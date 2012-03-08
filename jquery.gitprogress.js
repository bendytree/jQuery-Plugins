
/*
 * Include this line in: c:\PathToProject\.git\hooks\post-commit
 *
 * git --no-pager log --shortstat --date=short >> "c:\PathToLogFile.txt"
 *
 *
 * When you commit, the log file will automatically be generated. Mine is
 * saved to a dropbox folder which automatically makes it available on our
 * website. Therefore, 'git commit' automatically updates our website.
 *
 */

(function($) {
    var convert_log = function(log){
        var commits = {};

        var commitStrings = log.match(/Date:[.\s\S]*?deletions/g);
        for(var i=0; i<commitStrings.length; i++){
            var rx = /Date: +([-\d]+)[.\s\S]*?([\d]+) +insertions..., ([\d]+) +deletions/g;
            var matches = rx.exec(commitStrings[i]);
            var date = matches[1];
            var commit = commits[date];
            if(commit == null){
                commits[date] = commit = {
                    dateStr: date,
                    date: new Date(date),
                    insertions: 0,
                    deletions: 0
                };
            }
            commit.insertions += parseInt(matches[2]);
            commit.deletions += parseInt(matches[3]);
        }

        var commitArray = [];
        for (var key in commits) {
          if (commits.hasOwnProperty(key)) {
            commitArray.push(commits[key]);
          }
        }
        if(commitArray.length == 0)
            return {
                max: 0,
                min: 0,
                modifications: 0,
                insertions: 0,
                deletions: 0,
                days: []
            };

        //sort oldest to newest
        commitArray.sort(function(a,b){
          return ((a.dateStr < b.dateStr) ? -1 : ((a.dateStr > b.dateStr) ? 1 : 0));
        });

        //add empty days
        var startdate = commitArray[0].date;
        var dd = function(d){ return d < 10 ? ("0"+d) : d; }
        for(var i=1; i<commitArray.length && i < 100; i++){
            var date = new Date(startdate.getFullYear(), startdate.getMonth(), startdate.getDate()+i);
            
            var expectedDateStr = date.getFullYear() + "-" + dd(date.getMonth()+1) + "-"  + dd(date.getDate());
            if(expectedDateStr != commitArray[i].dateStr)
            {
                commitArray.splice(i, 0, {
                    dateStr: expectedDateStr,
                    date: date,
                    insertions: 0,
                    deletions: 0
                });
            }
        }

        //totals
        var insertions = 0;
        var deletions = 0;
        var max = 0;
        var min = 99999999999999;
        $.each(commitArray, function(){
            insertions += this.insertions;
            deletions += this.deletions;
            this.modifications = insertions-deletions;
            max = Math.max(this.modifications, max);
            min = Math.min(this.modifications, min);
        });

        //latest
        var latest = commitArray[commitArray.length-1];
        latest.since = Math.ceil((new Date().getTime() - latest.date.getTime()) / (24*60*60*1000.0));
        latest.since = latest.since + " day" + (latest.since == 1 ? "" : "s") + " ago";

        return {
            latest: latest,
            max: max,
            min: min,
            modifications: insertions-deletions,
            insertions: insertions,
            deletions: deletions,
            days: commitArray
        };
    };

	$.gitprogress = function(src, callback) {

        if($("#log").length > 0){
            setTimeout(function(){
                callback(convert_log($("#log").text()));
            }, 50);
            return;
        }

        $.get(
            src,
            function(log){
                callback(convert_log(log));
            }
        );
	};
})(jQuery);


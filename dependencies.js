
/**
 * JavaScript Dependencies
 *
 * A lightweight javascript lib to deal with loading external scripts
 * from a script. Does not require any other javascript libraries - wouldn't
 * want to be ironic.
 *
 *
 * Usage:
 * 
 * //include something
 * dependencies.add("/application.js");
 *  
 * //conditionally include something
 * dependencies.add("http://code.jquery.com/jquery-1.7.1.js", function(){ return !window.jQuery; }));
 * 
 * //when all scripts are done loading
 * dependencies.ready(function(){
 *     alert("done loading everything");
 * });
 *
 */ 

(function(){
    var pending = 0;
    var callback = null;
    var if_ready_perform_callback = function() {
        if(pending == 0 && callback){
            callback();
            callback = null;
        }
    };
    var script_complete = function() {
        pending -= 1;

        if_ready_perform_callback();
    };
    
    window.dependencies = {
        ready: function(_callback){
            callback = _callback;
            
            if_ready_perform_callback();
        },
        add: function(url, condition){
            if(condition && !condition())
                return;
            
            pending += 1;
            
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.onreadystatechange = script_complete;
            script.onload = script_complete;
            head.appendChild(script);
        }
    };
})();


/**
 *
 * jQuery.textfill.js
 *
 * Automatically increases or reduces a font-size so that text
 * fills its container. If the minimum size is still too large, it
 * can be truncated.  Text can be one line or multi line (wrap).
 *
 *
 * @author: Josh Wright, Bendy Tree LLC
 * @website: http://www.bendytree.com
 * The basic concept came from: http://stackoverflow.com/questions/687998/auto-size-dynamic-text-to-fill-fixed-size-container
 *
 *
 * EXAMPLE:
 *
 * <div style="width:200px; height:40px; border:solid 1px red;">
 *   This text gets resized!
 * </div>
 *
 * <script type="text/javascript">
 *   $(function(){
 *       $("div").textfill({
 *         max: 48,
 *         min: 28
 *       });
 *   });
 * </script>
 * 
 *
 * OPTIONS:
 * 
 * max:      (optional, defaults to 62) a number representing
 *           the maximum font size in pixels
 *
 * min:      (optional, defaults to 6) a number representing
 *           the minimum font size in pixels
 *
 * start:    (optional, defaults to average of max & min) 
 *           A number representing the starting font size in
 *           pixels. The algorithm will start from this font
 *           size, hopefully letting it get to the correct
 *           size faster.
 *
 * wrap:     (optional, defaults to true) If false, the text
 *           will be limited to one line.
 *
 * truncate: (optional, bool or string, defaults to "...") 
 *           false: the text will not be truncated
 *           "...": If the min font size is not small enough,
 *                  then the text is cut off and this string is
 *                  appended to the text.
 *
 */

; (function($) {
	$.fn.textfill = function(options) {
		options = $.extend({
			max: 62,
			min: 6,
            wrap: true,
            truncate: "&hellip;"
		}, options);
        options.start = options.start || Math.floor((options.max+options.min)/2);
		return this.each(function() {
            //make sure this isn't already done
            var container = $(this);
            if(container.find("span").length > 0) return;

            //create the span			
            container.contents().wrapAll("<span></span>");
            var span = container.find("span");

            //get/validate the original text
            var origText = span.text();
            if(origText.length == 0) return;

            //prepare our variables
            var fontSize = options.start;
			var maxHeight = container.height();
			var maxWidth = container.width();
            var lastSizeWasOk = null;
            var textWontFit = false;
            
            //prevent wrap, if nessessary
            if(options.wrap == false)
                span.css("white-space", "nowrap");

            //resize until it's as large as possible (or hits limits)
			while(true) {

                //set the size & measure
				span.css('font-size', fontSize);
				var itFits = span.height() < maxHeight && span.width() < maxWidth;

                if(itFits){
                    //this fits & last was too big, so stop
                    if(lastSizeWasOk == false)
                        break;
                    
                    fontSize += 1;
                    lastSizeWasOk = true;
                }else{
                    fontSize -= 1;
                    
                    //too big, but one smaller fit, so stop
                    if(lastSizeWasOk){
				        span.css('font-size', fontSize);
                        break;
                    }

                    lastSizeWasOk = false;
                }
                
                //too big? then stop
                if(fontSize > options.max){
				    span.css('font-size', options.max);
                    break;
                }

                //too small? then stop
                if(fontSize < options.min){
				    span.css('font-size', options.min);
                    textWontFit = true;
                    break;
                }
			}

            //still too big? then truncate
            if(textWontFit && options.truncate !== false){
                var text = "";
                for(var i=0; i<origText.length; i++){
                    //add a character
                    text += origText[i];
                    span.html(text+options.truncate);

                    //if it's too big, then use previous text
                    if(span.width() > maxWidth || span.height() > maxHeight)
                    {
                        span.html(text.substring(0, text.length-1).trim()+options.truncate);
                        break;
                    }
                }
            }
		});
	};
})(jQuery);


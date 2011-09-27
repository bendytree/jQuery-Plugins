
/**
 *
 * jQuery.makeclass.js
 *
 * This library extends JavaScript's prototyping mechanisms to allow
 * you to write truly object-oriented code.  It is a jQuery port of
 * Prototype's Class.create(...).
 *
 * See: http://www.prototypejs.org/api/class/create for prototype's version
 *
 *
 * @author: Josh Wright, Bendy Tree LLC
 * @website: http://www.bendytree.com
 *
 *
 * EXAMPLE:
 *
 * <div>
 *   Click to hide me.
 * </div>
 *
 * <script type="text/javascript">
 * $(function(){
 *
 *   var Controller = $.makeClass({
 *       init: function(){
 *           this.div = $("div");
 *       },
 *       begin: function(){
 *           this.div.click(this.clickedDiv.as(this))
 *       },
 *       clickedDiv: function(){
 *           this.div.hide();
 *       }
 *   });
 *
 *   var controller = new Controller();
 *   controller.begin();
 *
 * });
 * </script>
 * 
 *
 * EXPLANATION
 *
 * The code above is a very simple example of how you design
 * a class, create an instance, call an instance method, and
 * bind the context of a function given to a click event. You
 * should not use this library if you're doing something this
 * simple, but it should give you an idea of how it works.
 *
 *
 * The two main methods this library gives you are:
 * $.makeClass({})
 * [Function].as(context)
 *
 *
 * $.makeClass takes a hash of methods and properties which
 * become instance methods on the class that is returned. If
 * you supply a methods called 'init' (see example) then that
 * is used as the constructor.
 *
 * [Function].as(context) is a shortcut for forcing the 
 * context of a function to be whatever you pass as the context.
 * It workes identically to prototype's 'bind' method.
 * (See http://www.prototypejs.org/api/function/bind)
 *
 */

; (function($) {
    $.extend({
        makeClass: function() {
            var hasSuper = $.isFunction(arguments[0]);
            var parent = hasSuper ? arguments[0] : null;
            var properties = [];
            for (var i = (hasSuper ? 1 : 0); i < arguments.length; i++)
                properties.push(arguments[i]);
            function klass() {
                this.init.apply(this, arguments);
            }
            klass.superclass = parent;
            klass.subclasses = [];

            if (parent) {
                var subclass = function() { };
                subclass.prototype = parent.prototype;
                klass.prototype = new subclass;
                parent.subclasses.push(klass);
            }

            for (var i = 0; i < properties.length; i++)
                $.addMethods(klass, properties[i]);

            if (!klass.prototype.init)
                klass.prototype.init = function() { };

            klass.prototype.constructor = klass;
            return klass;
        },
        addMethods: function(target, source) {
            var ancestor = target.superclass && target.superclass.prototype;
            var properties = $.keys(source);

            for (var i = 0, length = properties.length; i < length; i++) {
                var property = properties[i];
                var value = source[property];
                if (ancestor && $.isFunction(value) && $.argumentNames(value).length && $.argumentNames(value)[0] == "$super") {
                    var method = value;
                    value = (function(m) {
                        return function() { return ancestor[m].apply(this, arguments) };
                    })(property).wrap(method);
                }
                target.prototype[property] = value;
            }

            return target;
        },
        keys: function(object) {
            var keys = [];
            for (var property in object)
                keys.push(property);
            return keys;
        },
        argumentNames: function(fun) {
            var names = fun.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1].replace(/\s+/g, '').split(',');
            return names.length == 1 && !names[0] ? [] : names;
        }
    });

    $.extend(Function.prototype, {
        as: function() {
            var _$A = function(a) { return Array.prototype.slice.call(a); }
            if (arguments.length < 2 && (typeof arguments[0] == "undefined")) return this;
            var __method = this, args = _$A(arguments), object = args.shift();
            return function() {
                return __method.apply(object, args.concat(_$A(arguments)));
            }
        },
        wrap: function(wrapper) {
            var __method = this;
            return function() {
                return wrapper.apply(this, [__method.as(this)].concat($A(arguments)));
            }
        }
    });

    function $A(iterable) {
        if (!iterable) return [];
        if (iterable.toArray) return iterable.toArray();
        var length = iterable.length || 0, results = new Array(length);
        while (length--) results[length] = iterable[length];
        return results;
    }

} (jQuery));
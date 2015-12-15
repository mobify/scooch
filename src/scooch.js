(function (factory) {
    if (typeof define === 'function' && define.amd) {
        /*
         In AMD environments, you will need to define an alias
         to your selector engine. i.e. either zepto or jQuery.
         */
        define(['$'], factory);
    } else {
        /*
         Browser globals
         */
        var selectorLibrary = window.Mobify && window.Mobify.$ || window.Zepto || window.jQuery;
        factory(selectorLibrary);
    }
}(function ($) {

    var Utils = (function($) {
        var exports = {};
        var ua = navigator.userAgent;
        var has = $.support = $.support || {};

        $.extend($.support, {
            'touch': 'ontouchend' in document
        });

        /**
            Events (either touch or mouse)
        */
        exports.events = (has.touch)
            ? {down: 'touchstart', move: 'touchmove', up: 'touchend'}
            : {down: 'mousedown', move: 'mousemove', up: 'mouseup'};

        /**
            Returns the position of a mouse or touch event in (x, y)
            @function
            @param {Event} touch or mouse event
            @returns {Object} X and Y coordinates
        */
        exports.getCursorPosition = (has.touch)
            ? function(e) {e = e.originalEvent || e; return {x: e.touches[0].clientX, y: e.touches[0].clientY}}
            : function(e) {return {x: e.clientX, y: e.clientY}};


        /**
            Returns prefix property for current browser.
            @param {String} CSS Property Name
            @return {String} Detected CSS Property Name
        */
        exports.getProperty = function(name) {
            var prefixes = ['Webkit', 'Moz', 'O', 'ms', '']
              , testStyle = document.createElement('div').style;
            
            for (var i = 0; i < prefixes.length; ++i) {
                if (testStyle[prefixes[i] + name] !== undefined) {
                    return prefixes[i] + name;
                }
            }

            // Not Supported
            return;
        };

        $.extend(has, {
            'transform': !! (exports.getProperty('Transform'))

            // Usage of transform3d on *android* would cause problems for input fields:
            // - https://coderwall.com/p/d5lmba
            // - http://static.trygve-lie.com/bugs/android_input/
          , 'transform3d': !! (window.WebKitCSSMatrix && 'm11' in new WebKitCSSMatrix() && !/android\s+[1-2]/i.test(ua)) 
        });

        // translateX(element, delta)
        // Moves the element by delta (px)
        var transformProperty = exports.getProperty('Transform');
        if (has.transform3d) {
            exports.translateX = function(element, delta) {
                 if (typeof delta == 'number') delta = delta + 'px';
                 element.style[transformProperty] = 'translate3d(' + delta  + ',0,0)';
            };
        } else if (has.transform) {
            exports.translateX = function(element, delta) {
                 if (typeof delta == 'number') delta = delta + 'px';
                 element.style[transformProperty] = 'translate(' + delta  + ',0)';
            };
        } else {
            exports.translateX = function(element, delta) {
                if (typeof delta == 'number') delta = delta + 'px';
                element.style.left = delta;
            };
        }

        // setTransitions
        var transitionProperty = exports.getProperty('Transition')
          , durationProperty = exports.getProperty('TransitionDuration');

        exports.setTransitions = function(element, enable) {
            if (enable) {
                element.style[durationProperty] = '';
            } else {
                element.style[durationProperty] = '0s';
            }
        };


        // Request Animation Frame
        // courtesy of @paul_irish
        exports.requestAnimationFrame = (function() {
            var prefixed = (window.requestAnimationFrame       || 
                            window.webkitRequestAnimationFrame || 
                            window.mozRequestAnimationFrame    || 
                            window.oRequestAnimationFrame      || 
                            window.msRequestAnimationFrame     || 
                            function( callback ){
                                window.setTimeout(callback, 1000 / 60);
                            });

            var requestAnimationFrame = function() {
                prefixed.apply(window, arguments);
            };

            return requestAnimationFrame;
        })();

        return exports;

    })($);

    var Scooch = (function($, Utils) {
        var defaults = {
                dragRadius: 10
              , moveRadius: 20
              , animate: true
              , autoHideArrows: false
              , rightToLeft: false
              , classPrefix: 'm-'
              , classNames: {
                    outer: 'scooch'
                  , inner: 'scooch-inner'
                  , item: 'item'
                  , center: 'center'
                  , touch: 'has-touch'
                  , dragging: 'dragging'
                  , active: 'active'
                  , inactive: 'inactive'
                  , fluid: 'fluid'
                }
            }
           , has = $.support;

        // Constructor
        var Scooch = function(element, options) {
            this.setOptions(options);
            this.initElements(element);
            this.initOffsets();
            this.initAnimation();
            this.bind();

            this._updateCallbacks = [];
        };

        // Expose Defaults
        Scooch.defaults = defaults;

        Scooch.prototype.setOptions = function(opts) {
            var options = this.options || $.extend({}, defaults, opts);

            /* classNames requires a deep copy */
            options.classNames = $.extend({}, options.classNames, opts.classNames || {});

            this.options = options;
        };

        Scooch.prototype.initElements = function(element) {
            this._index = 1;  // 1-based index

            this.element = element;
            this.$element = $(element);
            this.$inner = this.$element.find('.' + this._getClass('inner'));
            this.$items = this.$inner.children();

            this.$start = this.$items.eq(0);
            this.$sec = this.$items.eq(1);
            this.$current = this.$items.eq(this._index - 1);  // convert to 0-based index

            this._length = this.$items.length;
            this._alignment = this.$element.hasClass(this._getClass('center')) ? 0.5 : 0;

            this._isFluid = this.$element.hasClass(this._getClass('fluid'));
        };

        Scooch.prototype.initOffsets = function() {
            this._offsetDrag = 0;
        };

        Scooch.prototype.initAnimation = function() {
            this.animating = false;
            this.dragging = false;
            this._needsUpdate = false;
            this._enableAnimation();
        };


        Scooch.prototype._getClass = function(id) {
            return this.options.classPrefix + this.options.classNames[id];
        };


        Scooch.prototype._enableAnimation = function() {
            if (this.animating) {
                return;
            }

            Utils.setTransitions(this.$inner[0], true);
            this.$inner.removeClass(this._getClass('dragging'));
            this.animating = true;
        };

        Scooch.prototype._disableAnimation = function() {
            if (!this.animating) {
                return;
            }

            Utils.setTransitions(this.$inner[0], false);
            this.$inner.addClass(this._getClass('dragging'));
            this.animating = false;
        };

        Scooch.prototype.refresh = function() {
            /* Call when number of items has changed (e.g. with AJAX) */
            this.$items = this.$inner.children( '.' + this._getClass('item'));
            this.$start = this.$items.eq(0);
            this.$sec = this.$items.eq(1);
            this._length = this.$items.length;
            this.update();
        };

        Scooch.prototype.update = function(callback) {
            if (typeof callback != 'undefined') {
                this._updateCallbacks.push(callback);
            }

            /* We throttle calls to the real `_update` for efficiency */
            if (this._needsUpdate) {
                return;
            }

            this._needsUpdate = true;
            
            var self = this;
            Utils.requestAnimationFrame(function() {
                self._update();

                setTimeout(function() {
                    for (var i=0, _len = self._updateCallbacks.length; i < _len; i++) {
                        self._updateCallbacks[i].call(self);
                    }
                    self._updateCallbacks = [];
                }, 10)
            });
        };

        Scooch.prototype._update = function() {
            if (!this._needsUpdate) {
                return;
            }

            var $current = this.$current
              , $start = this.$start
              , currentOffset = $current.prop('offsetLeft') + $current.prop('clientWidth') * this._alignment
              , startOffset = $start.prop('offsetLeft') + $start.prop('clientWidth') * this._alignment
              , x = Math.round(-(currentOffset - startOffset) + this._offsetDrag);

            if ($current.prop('offsetParent')) {
                Utils.translateX(this.$inner[0], x);
            }

            this._needsUpdate = false;
        };

        Scooch.prototype.bind = function() {
            var abs = Math.abs
                , dragging = false
                , canceled = false
                , dragRadius = this.options.dragRadius
                , xy
                , dx
                , dy
                , dragThresholdMet
                , self = this
                , $element = this.$element
                , $inner = this.$inner
                , opts = this.options
                , lockLeft = false
                , lockRight = false
                , windowWidth = $(window).width();

            function start(e) {
                if (!has.touch) e.preventDefault();

                dragging = true;
                canceled = false;

                xy = Utils.getCursorPosition(e);
                dx = 0;
                dy = 0;
                dragThresholdMet = false;

                // Disable smooth transitions
                self._disableAnimation();

                lockLeft = self._index == 1;
                lockRight = self._index == self._length;
            }

            function drag(e) {
                if (!dragging || canceled) return;

                var newXY = Utils.getCursorPosition(e)
                  , dragLimit = self.$element.width();
                dx = xy.x - newXY.x;
                dy = xy.y - newXY.y;

                if (dragThresholdMet || abs(dx) > abs(dy) && (abs(dx) > dragRadius)) {
                    dragThresholdMet = true;
                    e.preventDefault();

                    if (lockLeft && (dx < 0)) {
                        dx = dx * (-dragLimit)/(dx - dragLimit);
                    } else if (lockRight && (dx > 0)) {
                        dx = dx * (dragLimit)/(dx + dragLimit);
                    }
                    self._offsetDrag = -dx;
                    self.update();
                } else if ((abs(dy) > abs(dx)) && (abs(dy) > dragRadius)) {
                    canceled = true;
                }
            }

            function end(e) {
                if (!dragging) {
                    return;
                }

                dragging = false;

                self._enableAnimation();

                if (!canceled && abs(dx) > opts.moveRadius) {
                    // Move to the next slide if necessary
                    if (opts.rightToLeft) {
                        if (dx < 0) {
                            self.next();
                        } else {
                            self.prev();
                        }
                    } else {
                        if (dx > 0) {
                            self.next();
                        } else {
                            self.prev();
                        }
                    }
                } else {
                    // Reset back to regular position
                    self._offsetDrag = 0;
                    self.update();
                }

            }

            function click(e) {
                if (dragThresholdMet) e.preventDefault();
            }

            $inner
                .on(Utils.events.down + '.scooch', start)
                .on(Utils.events.move + '.scooch', drag)
                .on(Utils.events.up + '.scooch', end)
                .on('click.scooch', click)
                .on('mouseout.scooch', end);

            $element.on('click', '[data-m-slide]', function(e){
                e.preventDefault();
                var action = $(this).attr('data-m-slide')
                  , index = parseInt(action, 10);

                if (isNaN(index)) {
                    self[action]();
                } else {
                    self.move(index);
                }
            });

            $element.on('afterSlide', function(e, previousSlide, nextSlide) {
                self.$items.eq(previousSlide - 1).removeClass(self._getClass('active'));
                self.$items.eq(nextSlide - 1).addClass(self._getClass('active'));

                self.$element.find('[data-m-slide=\'' + previousSlide + '\']').removeClass(self._getClass('active'));
                self.$element.find('[data-m-slide=\'' + nextSlide + '\']').addClass(self._getClass('active'));

                if (opts.autoHideArrows) { // Hide prev/next arrows when at bounds
                    self.$element.find('[data-m-slide=prev]').removeClass(self._getClass('inactive'));
                    self.$element.find('[data-m-slide=next]').removeClass(self._getClass('inactive'));

                    if (nextSlide === 1) {
                        self.$element.find('[data-m-slide=prev]').addClass(self._getClass('inactive'));
                    }

                    if (nextSlide === self._length) {
                        self.$element.find('[data-m-slide=next]').addClass(self._getClass('inactive'));
                    }
                }
            });

            $(window).on('resize orientationchange', function(e) {
                // Disable animation for now to avoid seeing 
                // the carousel sliding, as it updates its position.
                // Animation will be enabled automatically when you're swiping.
                // Don't update Carousel on window height change
                if(windowWidth == $(window).width())
                    return;

                self._disableAnimation();
                windowWidth = $(window).width();
                self.update();
            });

            $element.trigger('beforeSlide', [1, 1]);
            $element.trigger('afterSlide', [1, 1]);

            self.update();

        };

        Scooch.prototype.unbind = function() {
            this.$inner.off();
        };

        Scooch.prototype.destroy = function() {
            this.unbind();
            this.$element.trigger('destroy');
            this.$element.remove();

            // Cleanup
            this.$element = null;
            this.$inner = null;
            this.$start = null;
            this.$current = null;
        };

        Scooch.prototype.move = function(newIndex, opts) {
            var $element = this.$element
                , $inner = this.$inner
                , $items = this.$items
                , $start = this.$start
                , $current = this.$current
                , length = this._length
                , index = this._index;
                    
            opts = $.extend({}, this.options, opts);

            // Bound Values between [1, length];
            if (newIndex < 1) {
                newIndex = 1;
            } else if (newIndex > this._length) {
                newIndex = length;
            }
            
            // Bail out early if no move is necessary.
            if (newIndex == this._index) {
                //return; // Return Type?
            }

            // Check if we should animate
            if (opts.animate) {
                this._enableAnimation();
            } else {
                this._disableAnimation();
            }

            // Trigger beforeSlide event
            $element.trigger('beforeSlide', [index, newIndex]);


            // Index must be decremented to convert between 1- and 0-based indexing.
            this.$current = $current = $items.eq(newIndex - 1);

            this._offsetDrag = 0;
            this._index = newIndex;

            // Update, re-enable animation if necessary
            if (opts.animate) {
                this.update();
            } else {
                this.update(function() {    
                    this._enableAnimation();
                });
            }
            // Trigger afterSlide event
            $element.trigger('afterSlide', [index, newIndex]);
        };

        Scooch.prototype.next = function() {
            this.move(this._index + 1);
        };
        
        Scooch.prototype.prev = function() {
            this.move(this._index - 1);
        };

        return Scooch;

    })($, Utils);

    /**
        jQuery interface to set up a scooch carousel


        @param {String} [action] Action to perform. When no action is passed, the carousel is simply initialized.
        @param {Object} [options] Options passed to the action.
    */
    $.fn.scooch = function (action, options) {
        var initOptions = $.extend({}, $.fn.scooch.defaults);

        // Handle different calling conventions
        if (typeof action == 'object') {
            $.extend(initOptions, action, true);
            options = null;
            action = null;
        }

        options = Array.prototype.slice.apply(arguments);

        this.each(function () {
            var $this = $(this)
              , scooch = this._scooch;

            
            if (!scooch) {
                scooch = new Scooch(this, initOptions);
            }

            if (action) {
                scooch[action].apply(scooch, options.slice(1));

                if (action === 'destroy') {
                    scooch = null;
                }
            }
            
            this._scooch = scooch;
        });

        return this;
    };

    $.fn.scooch.defaults = {};

}));
/* 
 * Tipper v3.1.0 - 2015-04-04 
 * A jQuery plugin for simple tooltips. Part of the formstone library. 
 * http://classic.formstone.it/tipper/ 
 * 
 * Copyright 2015 Ben Plum; MIT Licensed 
 */

;(function ($, window) {
	"use strict";

	var namespace        = "tipper",
		$body            = null,
		data             = null,
		// Classes
		class_base       = namespace,
		class_content    = namespace + "-content",
		class_caret      = namespace + "-caret",
		class_visible    = namespace + "-visible",
		// Events
		event_leave      = "mouseleave." + namespace,
		event_move       = "mousemove." + namespace,
		event_enter      = "mouseenter." + namespace;

	/**
	 * @options
	 * @param delay [int] <0> "Hover delay"
	 * @param direction [string] <'top'> "Tooltip direction"
	 * @param follow [boolean] <false> "Flag to follow mouse"
	 * @param formatter [function] <$.noop> "Text format function"
	 * @param margin [int] <15> "Tooltip margin"
	 * @param match [boolean] <false> "Flag to match mouse position"
	 */
	var options = {
		delay        : 0,
		direction    : "top",
		follow       : false,
		formatter    : $.noop,
		margin       : 15,
		match        : false
	};

	var pub = {

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.tipper("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});

			return (typeof this === 'object') ? $(this) : true;
		},

		/**
		 * @method
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").tipper("destroy");
		 */
		destroy: function() {
			return this.trigger(event_leave)
					   .off( classify(namespace) )
					   .removeData(namespace);
		}
	};


	/**
	 * @method private
	 * @name init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function init(opts) {
		options.formatter = format;

		$body = $("body");

		return this.filter(function() {
						return !$(this).data(namespace);
					})
				   .data(namespace, $.extend({}, options, opts || {}))
				   .on(event_enter, build);
	}

	/**
	 * @method private
	 * @name build
	 * @description Builds target instance
	 * @param e [object] "Event data"
	 */
	function build(e) {
		var $target = $(e.currentTarget);

		data = $.extend(true, {
				$target: $target,
				left: e.pageX,
				top: e.pageY
			},
			$target.data(namespace) || {},
			$target.data(namespace + "-options") || {});

		if (data.delay) {
			data.timer = startTimer(data.timer, data.delay, function() {
				doBuild($target, data);
			});
		} else {
			doBuild($target, data);
		}

		data.$target.one(event_leave, data, onMouseOut);

		if (!data.follow && data.match) {
			$target.on(event_move, data, onMouseMove)
				   .trigger(event_move);
		}
	}

	/**
	 * @method private
	 * @name doBuild
	 * @description Builds target instance
	 * @param $target [jQuery object] "Target element"
	 * @param data [object] "Instance data"
	 */
	function doBuild($target, data) {
		var html = '';

		html += '<div class="' + [class_base, namespace + "-" + data.direction].join(" ") + '">';
		html += '<div class="' + class_content + '">';
		html += data.formatter.call($target, data);
		html += '<span class="' + class_caret + '"></span>';
		html += '</div>';
		html += '</div>';

		data.$tipper = $(html);

		$body.append(data.$tipper);

		data.$content = data.$tipper.find( classify(class_content) );
		data.$caret   = data.$tipper.find( classify(class_caret) );
		data.offset   = $target.offset();
		data.height   = $target.outerHeight();
		data.width    = $target.outerWidth();

		var position = {},
			caretPosition   = {},
			contentPosition = {},
			caretHeight     = data.$caret.outerHeight(true),
			caretWidth      = data.$caret.outerWidth(true),
			contentHeight   = data.$content.outerHeight(true),
			contentWidth    = data.$content.outerWidth(true);

		// position content
		if (data.direction === "right" || data.direction === "left") {
			caretPosition.top = (contentHeight - caretHeight) / 2;
			contentPosition.top = -contentHeight / 2;

			if (data.direction === "right") {
				contentPosition.left = data.margin;
			} else if (data.direction === "left") {
				contentPosition.left = -(contentWidth + data.margin);
			}
		} else {
			caretPosition.left = (contentWidth - caretWidth) / 2;
			contentPosition.left = -contentWidth / 2;

			if (data.direction === "bottom") {
				contentPosition.top = data.margin;
			} else if (data.direction === "top") {
				contentPosition.top = -(contentHeight + data.margin);
			}
		}

		// modify dom
		data.$content.css(contentPosition);
		data.$caret.css(caretPosition);

		// Position tipper
		if (data.follow) {
			data.$target.on(event_move, data, onMouseMove)
						.trigger(event_move);
		} else if (data.match) {
			if (data.direction === "right" || data.direction === "left") {
				position.top = data.top; // mouse pos

				if (data.direction === "right") {
					position.left = data.offset.left + data.width;
				} else if (data.direction === "left") {
					position.left = data.offset.left;
				}
			} else {
				position.left = data.left; // mouse pos

				if (data.direction === "bottom") {
					position.top = data.offset.top + data.height;
				} else if (data.direction === "top") {
					position.top = data.offset.top;
				}
			}
		} else {
			if (data.direction === "right" || data.direction === "left") {
				position.top = data.offset.top + (data.height / 2);

				if (data.direction === "right") {
					position.left = data.offset.left + data.width;
				} else if (data.direction === "left") {
					position.left = data.offset.left;
				}
			} else {
				position.left = data.offset.left + (data.width / 2);

				if (data.direction === "bottom") {
					position.top = data.offset.top + data.height;
				} else if (data.direction === "top") {
					position.top = data.offset.top;
				}
			}
		}

		data.$tipper.css(position)
					.addClass(class_visible);
	}

	/**
	 * @method private
	 * @name format
	 * @description Formats tooltip text
	 * @param data [object] "Data object"
	 * @return [string] "Formatted text"
	 */
	function format(data) {
		return this.data("title");
	}

	/**
	 * @method private
	 * @name onMouseMove
	 * @description Handles mousemove event
	 * @param e [object] "Event data"
	 */
	function onMouseMove(e) {
		var data = e.data,
			position = {
				left: e.pageX,
				top: e.pageY
			};

		if (data.follow && typeof data.$tipper !== "undefined") {
			data.$tipper.css(position);
		}
	}

	/**
	 * @method private
	 * @name onMouseOut
	 * @description Handles mouseout event
	 * @param e [object] "Event data"
	 */
	function onMouseOut(e) {
		var data = e.data;

		clearTimer(data.timer);

		if (typeof data.$tipper !== "undefined") {
			data.$tipper.remove();
			data.$target.off( [event_move, event_leave].join(" ") );

			data = null;
		}
	}

	/**
	 * @method private
	 * @name startTimer
	 * @description Starts an internal timer
	 * @param timer [int] "Timer ID"
	 * @param time [int] "Time until execution"
	 * @param callback [int] "Function to execute"
	 */
	function startTimer(timer, time, callback) {
		clearTimer(timer);
		return setTimeout(callback, time);
	}

	/**
	 * @method private
	 * @name clearTimer
	 * @description Clears an internal timer
	 * @param timer [int] "Timer ID"
	 */
	function clearTimer(timer) {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	/**
	 * @method private
	 * @name classify
	 * @description Create class selector from text
	 * @param text [string] "Text to convert"
	 * @return [string] "New class name"
	 */
	function classify(text) {
		return "." + text;
	}

	$.fn[namespace] = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return init.apply(this, arguments);
		}
		return this;
	};

	$[namespace] = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery);
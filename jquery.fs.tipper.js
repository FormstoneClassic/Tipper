/* 
 * Tipper v3.1.0 - 2014-10-23 
 * A jQuery plugin for simple tooltips. Part of the formstone library. 
 * http://formstone.it/tipper/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */

;(function ($, window) {
	"use strict";

	var $body,
		$tipper,
		pos;

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
		delay: 0,
		direction: "top",
		follow: false,
		formatter: $.noop,
		margin: 15,
		match: false
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
			return $(this);
		},

		/**
		 * @method
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").tipper("destroy");
		 */
		destroy: function() {
			return $(this).trigger("mouseleave.tipper")
						  .off(".tipper")
						  .removeClass("tipper-attached");
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

		return $(this).not(".tipper-attached")
					  .addClass("tipper-attached")
					  .on("mouseenter.tipper", $.extend({}, options, opts || {}), build);
	}

	/**
	 * @method private
	 * @name build
	 * @description Builds target instance
	 * @param e [object] "Event data"
	 */
	function build(e) {
		var $target = $(this),
		data = $.extend(true, {}, e.data, $target.data("tipper-options"));

		data.$target = $target;
		pos = {
			left: e.pageX,
			top: e.pageY
		};

		if (data.delay) {
			data.timer = startTimer(data.timer, data.delay, function() {
				doBuild(data.$target, data);
			});
		} else {
			doBuild(data.$target, data);
		}

		data.$target.one("mouseleave.tipper", data, onMouseOut);

		if (!data.follow && data.match) {
			data.$target.on("mousemove.tipper", data, onMouseMove)
						.trigger("mousemove");
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

		html += '<div class="tipper ' + data.direction + '">';
		html += '<div class="tipper-content">';
		html += data.formatter.apply($body, [$target]);
		html += '<span class="tipper-caret"></span>';
		html += '</div>';
		html += '</div>';

		data.$target = $target;
		data.$tipper = $(html);

		$body.append(data.$tipper);

		data.$content = data.$tipper.find(".tipper-content");
		data.$caret = data.$tipper.find(".tipper-caret");
		data.offset = $target.offset();
		data.height = $target.outerHeight();
		data.width  = $target.outerWidth();

		data.tipperPos = {};
		data.caretPos = {};
		data.contentPos = {};

		var caretHeight   = data.$caret.outerHeight(true),
			caretWidth    = data.$caret.outerWidth(true),
			contentHeight = data.$content.outerHeight(true),
			contentWidth  = data.$content.outerWidth(true);

		// position content
		if (data.direction === "right" || data.direction === "left") {
			data.caretPos.top = (contentHeight - caretHeight) / 2;
			data.contentPos.top = -contentHeight / 2;
			if (data.direction === "right") {
				data.contentPos.left = data.margin;
			} else if (data.direction === "left") {
				data.contentPos.left = -(contentWidth + data.margin);
			}
		} else {
			data.caretPos.left = (contentWidth - caretWidth) / 2;
			data.contentPos.left = -contentWidth / 2;

			if (data.direction === "bottom") {
				data.contentPos.top = data.margin;
			} else if (data.direction === "top") {
				data.contentPos.top = -(contentHeight + data.margin);
			}
		}

		// modify dom
		data.$content.css(data.contentPos);
		data.$caret.css(data.caretPos);

		// Position tipper
		if (data.follow) {
			data.$target.on("mousemove.tipper", data, onMouseMove)
						.trigger("mousemove");
		} else if (data.match) {
			if (data.direction === "right" || data.direction === "left") {
				data.tipperPos.top = pos.top;
				if (data.direction === "right") {
					data.tipperPos.left = data.offset.left + data.width;
				} else if (data.direction === "left") {
					data.tipperPos.left = data.offset.left;
				}
			} else {
				data.tipperPos.left = pos.left;
				if (data.direction === "bottom") {
					data.tipperPos.top = data.offset.top + data.height;
				} else if (data.direction === "top") {
					data.tipperPos.top = data.offset.top;
				}
			}

			data.$tipper.css(data.tipperPos);
		} else {
			if (data.direction === "right" || data.direction === "left") {
				data.tipperPos.top = data.offset.top + (data.height / 2);
				if (data.direction === "right") {
					data.tipperPos.left = data.offset.left + data.width;
				} else if (data.direction === "left") {
					data.tipperPos.left = data.offset.left;
				}
			} else {
				data.tipperPos.left = data.offset.left + (data.width / 2);
				if (data.direction === "bottom") {
					data.tipperPos.top = data.offset.top + data.height;
				} else if (data.direction === "top") {
					data.tipperPos.top = data.offset.top;
				}
			}

			data.$tipper.css(data.tipperPos);
		}

		data.$tipper.addClass("visible");
	}

	/**
	 * @method private
	 * @name format
	 * @description Formats tooltip text
	 * @param $target [jQuery object] "Target element"
	 * @return [string] "Formatted text"
	 */
	function format($target) {
		return $target.data("title");
	}

	/**
	 * @method private
	 * @name onMouseMove
	 * @description Handles mousemove event
	 * @param e [object] "Event data"
	 */
	function onMouseMove(e) {
		var data = e.data;

		pos = {
			left: e.pageX,
			top: e.pageY
		};

		if (data.follow && typeof data.$tipper !== "undefined") {
			data.$tipper.css({ left: pos.left, top: pos.top });
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
			data.$target.off("mousemove.tipper mouseleave.tipper");

			pos = null;
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

	$.fn.tipper = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return init.apply(this, arguments);
		}
		return this;
	};

	$.tipper = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery);
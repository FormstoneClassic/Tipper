/* 
 * Tipper v3.0.1 - 2014-01-29 
 * A jQuery plugin for simple tooltips. Part of the formstone library. 
 * http://formstone.it/tipper/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	var $body,
		$tipper;

	/**
	 * @options
	 * @param direction [string] <'top'> "Tooltip direction"
	 * @param follow [boolean] <false> "Flag to follow mouse"
	 * @param formatter [function] <$.noop> "Text format function"
	 * @param margin [int] <15> "Tooltip margin"
	 */
	var options = {
		direction: "top",
		follow: false,
		formatter: $.noop,
		margin: 15
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
						  .off(".tipper");
		}
	};


	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		options.formatter = _format;
		return $(this).on("mouseenter.tipper", $.extend({}, options, opts || {}), _build);
	}

	/**
	 * @method private
	 * @name _build
	 * @description Builds target instance
	 * @param e [object] "Event data"
	 */
	function _build(e) {
		$body = $("body");

		var $target = $(this),
			data = $.extend(true, {}, e.data, $target.data("tipper-options")),
			html = '';

		html += '<div class="tipper ' + data.direction + '">';
		html += '<div class="tipper-content">';
		html += data.formatter.apply($body, [$target]);
		html += '<span class="tipper-caret"</span>';
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
			contentWidth  = data.$content.outerWidth(true) + caretWidth;

		// position content
		if (data.direction === "right" || data.direction === "left") {
			data.caretPos.top = (contentHeight - caretHeight) / 2;
			data.contentPos.top = -contentHeight / 2;
			if (data.direction === "right") {
				data.contentPos.left = caretWidth + data.margin;
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
			data.$target.on("mousemove.tipper", data, _onMouseMove)
						.trigger("mousemove");
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

		// Bind events
		data.$target.one("mouseleave.tipper", data, _onMouseOut);
	}

	/**
	 * @method private
	 * @name _format
	 * @description Formats tooltip text
	 * @param $target [jQuery object] "Target element"
	 * @return [string] "Formatted text"
	 */
	function _format($target) {
		return $target.data("title");
	}

	/**
	 * @method private
	 * @name _onMouseMove
	 * @description Handles mousemove event
	 * @param e [object] "Event data"
	 */
	function _onMouseMove(e) {
		var data = e.data;

		data.$tipper.css({ left: e.pageX, top: e.pageY });
	}

	/**
	 * @method private
	 * @name _onMouseOut
	 * @description Handles mouseout event
	 * @param e [object] "Event data"
	 */
	function _onMouseOut(e) {
		var data = e.data;

		data.$tipper.remove();
		data.$target.off("mousemove.tipper mouseleave.tipper");
	}

	$.fn.tipper = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};

	$.tipper = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery);
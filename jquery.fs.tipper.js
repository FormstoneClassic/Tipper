/*
 * Tipper Plugin [Formstone Library]
 * @author Ben Plum
 * @version 0.4.3
 *
 * Copyright © 2012 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

if (jQuery) (function($) {
	
	var options = {
		direction: "right",
		follow: false,
		formatter: function() {},
		margin: 15
	};
	
	// Public Methods
	var pub = {
		
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},
		
		destroy: function() {
			$(".tipper-wrapper").remove();
			return $(this).off(".tipper")
					  	  .data("tipper", null);
		}
	};
		
	function _init(opts) {
		options.formatter = _format;
		return $(this).on("mouseenter.tipper", _build)
					  .data("tipper", $.extend({}, options, opts || {}));
	}
	
	function _build(e) {
		var $target = $(this),
			data = $target.data("tipper");
		
		var html = '<div class="tipper-wrapper"><div class="tipper-content">';
		html += data.formatter.apply($("body"), [$target]);
		html += '</div><span class="tipper-caret"></span></div>';
		
		$target.data("tipper-text", $target.attr("title")).attr("title", null);
		
		var $tipper = $('<div class="tipper-positioner ' + data.direction + '" />');
		$tipper.append(html)
			   .appendTo("body");
		
		var $caret = $tipper.find(".tipper-caret"),
			offset = $target.offset(),
			targetWidth = $target.outerWidth(),
			targetHeight = $target.outerHeight(),
			tipperWidth = $tipper.outerWidth(true),
			tipperHeight = $tipper.outerHeight(true),
			tipperPos = {},
			caretPos = {};
		
		if (data.direction == "right" || data.direction == "left") {
			tipperPos.top = offset.top - ((tipperHeight - targetHeight) / 2);
			caretPos.top = (tipperHeight - $caret.outerHeight(true)) / 2;
			
			if (data.direction == "right") {
				tipperPos.left = offset.left + targetWidth + data.margin;
			} else if (data.direction == "left") {
				tipperPos.left = offset.left - tipperWidth - data.margin;
			}
		} else {
			tipperPos.left = offset.left - ((tipperWidth - targetWidth) / 2);
			caretPos.left = (tipperWidth - $caret.outerWidth(true)) / 2;
			
			if (data.direction == "bottom") {
				tipperPos.top = offset.top + targetHeight + data.margin;
			} else if (data.direction == "top") {
				tipperPos.top = offset.top - tipperHeight - data.margin;
			}
		}
		
		$tipper.css(tipperPos);
		$caret.css(caretPos);
		
		$target.one("mouseleave.tipper", { 
			$tipper: $tipper,
			$target: $target
		}, _destroy);
	}
	
	function _format($target) {
		return $target.attr("title");
	}
	
	function _destroy(e) {
		var data = e.data;
		data.$target.attr("title", data.$target.data("tipper-text"))
					.data("tipper-text", null);
		data.$tipper.remove();
	}
	
	/*
	function _move(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var $tipper = $("#tipper");
		
		var width = $tipper.outerWidth(true);
		var height = $tipper.outerHeight(true);
		
		var left = e.pageX + options.cursorOffset;
		var top = e.pageY - ((options.caretOffset === "center") ? (height / 2) : options.caretOffset);
		
		if (left + width > $(window).width()) {
			$tipper.addClass("left");
			left = e.pageX - width - options.cursorOffset;
		} else {
			$tipper.removeClass("left");
		}
		
		$tipper.css({ left: left, top: top });
	}
	*/
	
	$.fn.tipper = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery);
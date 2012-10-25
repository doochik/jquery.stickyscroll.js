/**
 * @fileOverview jQuery sticky scroll plugin
 * @author Alexey Androsov, Roman Komarov, 2012
 * @requires jQuery 1.7+
 * @version 0.1
 */

(function($) {

    var StickyScroll = function(mainScroller, selector) {
        this._$main = $(mainScroller);

        this._onViewScrollBinded = $.proxy(this._onViewScroll, this);
        this._$blocks = this._$main
            .on('scroll.fixedscroll', $.proxy(this.recalc, this))
            .find(selector)
            .on('scroll.fixedscroll', this._onViewScrollBinded);

        this.recalc();
    };

    StickyScroll.prototype = {

        /**
         * Add new block to collection.
         * @param {jQuery} block New block(s)
         * @return {StickyScroll}
         */
        addBlock: function(block) {
            this._$blocks = this._$blocks.add(block);
            block.on('scroll.fixedscroll', this._onViewScrollBinded);

            return this;
        },

        /**
         * Destructor.
         */
        destroy: function() {
            this._$main.off('.fixedscroll');
            this._$blocks.off('.fixedscroll');

            // remove scroller
            if (this._$scroller) {
                this._$scroller.off('.fixedscroll').remove();
                delete this._$scroller;
            }
        },

        /**
         * Lazy custom scroller creator.
         * @param {Boolean} [preventInitIfNotExists=false] Prevent scroller init if it isn't exists&
         * @return {jQuery}
         * @private
         */
        _getCustomScroller: function(preventInitIfNotExists) {
            if (!this._$scroller && !preventInitIfNotExists) {
                this._$scroller = $('<div class="jquery-fixedscroll" style="display: none;"><div class="jquery-fixedscroll__i"></div></div>')
                    .on('scroll.fixedscroll', $.proxy(this._onCustomScroll, this))
                    .appendTo(this._$main);
            }

            return this._$scroller;
        },

        /**
         *
         * @private
         */
        _onCustomScroll: function(e) {
            if (this._curBlock) {
                this._curBlock.scrollLeft = e.currentTarget.scrollLeft;
            }
        },

        /**
         * Process scroll event on inner scrolled blocks.
         * @param {Event} e Scroll event.
         * @private
         */
        _onViewScroll: function(e) {
            var target = e.currentTarget;
            // check current block and scroll target
            if (this._curBlock && this._curBlock === target) {
                this._getCustomScroller().scrollLeft(target.scrollLeft);
            }
        },

        /**
         * Process current blocks. Hide or show custom scroll if needed.
         */
        recalc: function() {
            for (var i = 0, j = this._$blocks.length; i < j; i++) {
                var block =  this._$blocks[i];
                var scrollWidth = block.scrollWidth;
                var offsetWidth = block.offsetWidth;

                // has scroll
                if (scrollWidth > offsetWidth) {
                    var $block = $(block);
                    var mainScrollerOffset = this._$main.offset();
                    var scrollerTop = this._$main[0].scrollTop;

                    var blockOffset = $block.offset();

                    var blockTop = blockOffset.top - mainScrollerOffset.top + scrollerTop;
                    var blockBottom = blockTop + block.offsetHeight;


                    var scrollerBottom = scrollerTop + this._$main[0].offsetHeight;

                    /**
                     * @type {Boolean}
                     */
                    var blockTopInViewport = scrollerTop <= blockTop && blockTop <= scrollerBottom;

                    /**
                     * @type {Boolean}
                     */
                    var blockBottomInViewport = scrollerTop <= blockBottom && blockBottom <= scrollerBottom;

                    /**
                     * @type {Boolean}
                     */
                    var blockMiddleInViewport = scrollerTop >= blockTop && blockBottom >= scrollerBottom;

                    // check if block in viewport
                    if ((blockTopInViewport || blockMiddleInViewport) && !blockBottomInViewport) {
                        this._setScroller(block);
                        continue;
                    }
                }

                // block has no scroll or it's not in viewport so reset scroll
                this._resetScroller(block);
            }
        },

        _setScroller: function(associatedBlock) {
            // if we want to change associatedBlock or change width in current block
            if (associatedBlock != this._curBlock || associatedBlock.offsetWidth != this._curBlockWidth) {
                var $customScroller = this._getCustomScroller();

                /**
                 * Current scrolled block in view.
                 * @type {Node}
                 * @private
                 */
                this._curBlock = associatedBlock;

                /**
                 * Cached width of current scrolled block.
                 * @type {Number}
                 * @private
                 */
                this._curBlockWidth = associatedBlock.offsetWidth;

                $customScroller.width(this._curBlockWidth);
                $customScroller.find(':first').width(associatedBlock.scrollWidth);
                $customScroller.show();
                $customScroller.scrollLeft(associatedBlock.scrollLeft);

            }
        },

        _resetScroller: function(associatedBlock) {
            if (associatedBlock == this._curBlock) {
                var $customScroller = this._getCustomScroller(true);
                if ($customScroller) {
                    $customScroller.hide();
                }
                // reset cached data
                delete this._curBlockWidth;
                delete this._curBlock;
            }
        }
    };

    /**
     * Creates sticky scroll on current node for elements matched selector
     * @param {String} selector Selector for scrolled elements inside current node.
     * @return {StickyScroll}
     */
    $.fn.stickyScroll = function(selector) {
        return new StickyScroll(this, selector);
    };

})(jQuery);

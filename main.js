(function ($) {
    'use strict';

    const originalVal = $.fn.val;
    const originalEmpty = $.fn.empty;
    const originalProp = $.fn.prop;

    function escapeHtml(unsafe) {
        if (unsafe == null || unsafe === undefined) return "";

        const isAlreadyEscaped = /&amp;|&lt;|&gt;|&quot;|&#39;|&#187;|&#171;/.test(unsafe);

        if (isAlreadyEscaped) {
            return unsafe;
        }

        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/»/g, "&#187;")
            .replace(/«/g, "&#171;");
    }

    $.fn.val = function (value) {
        if (!this.hasClass("own-select")) {
            return originalVal.apply(this, arguments);
        }

        const $selected = this.find(".own-select__selected");

        if (arguments.length === 0) {
            return $selected.length ? $selected.attr("data-selected") || "" : "";
        }

        if (arguments.length > 0) {
            const $item = this.find(`.own-select__items div[value="${escapeHtml(String(value))}"]`);

            if ($item.length && $selected.length) {
                $selected.attr("data-selected", value);
                $selected.text($item.text());
            }

            return this;
        }
    };

    $.fn.empty = function () {
        if (!this.hasClass("own-select")) {
            return originalEmpty.apply(this, arguments);
        }

        const $items = this.find(".own-select__items");
        const $selected = this.find(".own-select__selected");

        if ($items.length && $selected.length) {
            $items.empty();
            $selected.text('');
            $selected.attr("data-selected", '');
        }

        return this;
    };

    $.fn.prop = function (name, value) {
        if (!this.hasClass("own-select") || name !== "disabled") {
            return originalProp.apply(this, arguments);
        }

        const $selected = this.find(".own-select__selected");

        if (arguments.length === 1) {
            return $selected.hasClass("disabled");
        }

        if (value) {
            $selected.addClass("disabled");
            this.removeClass("open");
        } else {
            $selected.removeClass("disabled");
        }

        return this;
    };

    $.fn.addSelectItem = function (value, text, disabled) {
        if (!this.hasClass("own-select") || arguments.length < 2) {
            return this;
        }

        if (!value || !text || typeof value !== 'string' || typeof text !== 'string') {
            return this;
        }

        const $select = this;
        const $items = this.find(".own-select__items");
        const $selected = this.find(".own-select__selected");

        if (!$items.length || !$selected.length) {
            return this;
        }

        const isFirstElement = $items.children().length === 0;

        const $newItem = $('<div>')
            .attr('value', value)
            .text(text);

        if (disabled === true) {
            $newItem.attr('disabled', 'disabled');
        }

        $newItem.on("click", function () {
            $selected.text($(this).text());
            $selected.attr("data-selected", $(this).attr("value"));
            $select.removeClass("open");
        });

        $items.append($newItem);

        if (isFirstElement && !this.hasClass("own-select_checked-empty")) {
            this.val(value);
        }

        return this;
    };

    function initOwnSelectElement() {
        $(document).off("click.ownSelect").on("click.ownSelect", ".own-select__selected", function () {
            const $select = $(this).closest(".own-select");
            $(".own-select").not($select).removeClass("open");
            $select.toggleClass("open");

            if ($select.hasClass("own-igroup__select") || $select.hasClass("own-select__open-control")) {
                if ($select.hasClass("open")) {
                    const rect = $select[0].getBoundingClientRect();
                    const spaceBelow = window.innerHeight - rect.bottom;
                    const itemsHeight = $select.find(".own-select__items").outerHeight(true);
                    if (itemsHeight > spaceBelow) {
                        $select.addClass("own-select--drop-up");
                    } else {
                        $select.removeClass("own-select--drop-up");
                    }
                } else {
                    $select.removeClass("own-select--drop-up");
                }
            }
        });

        $(document).off("click.ownSelectItem").on("click.ownSelectItem", ".own-select__items div", function () {
            if ($(this).attr("disabled") !== undefined) {
                return;
            }

            const $select = $(this).closest(".own-select");
            const $selected = $select.find(".own-select__selected");
            $selected.text($(this).text());
            $selected.attr("data-selected", $(this).attr("value"));
            $select.removeClass("open");
            $select.removeClass("own-select_checked-empty");
            $select.removeClass("no-validated");
            $select.trigger("change");
        });

        $(document).off("click.ownSelectOutside").on("click.ownSelectOutside", function (e) {
            if (!$(e.target).closest(".own-select").length) {
                $(".own-select").removeClass("open");
            }
        });
    }

    function initPrevDocsToggle() {
        $(document).on("click", ".prev-docs__toggle", function () {
            const $toggle = $(this);
            const $block = $toggle.closest(".prev-docs");
            const $list = $block.find(".prev-docs__list");
            const $icon = $block.find(".prev-docs__toggle-icon");
            const $parentCard = $block.closest(".documents-card");

            $list.slideToggle(200);
            $icon.toggleClass("prev-docs__toggle-icon_rotated");
            $parentCard.toggleClass("documents-card_opened-prev");
        });
    }

    $(document).ready(function () {
        initOwnSelectElement();
        initPrevDocsToggle();
    });
})(jQuery);

// Jquery Dependency
bindEventCommon();

const FORMAT_CURRENCY = ".";

function bindEventCommon() {
    jQuery(document).ready(function($) {
        $("input[data-type='currency']").on({
            keyup: function() {
                formatCurrency($(this));
            },
            blur: function() {}
        });

        $("input[data-type='currency']").each(function() {
            formatCurrency($(this));
        });

        function formatNumber(n) {
            // format number 1000000 to 1,234,567
            return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, FORMAT_CURRENCY)
        }

        function formatCurrency(input) {
            // get input value
            var input_val = input.val();

            // don't validate empty input
            if (input_val === "") { return; }

            // original length
            var original_len = input_val.length;

            // initial caret position 
            var caret_pos = input.prop("selectionStart");

            input_val = formatNumber(input_val);

            // send updated string to input
            input.val(input_val);

            // put caret back in the right position
            var updated_len = input_val.length;
            caret_pos = updated_len - original_len + caret_pos;
            input[0].setSelectionRange(caret_pos, caret_pos);
        }
    });
}

function replaceCurrency(value) {
    if (value == '') {
        return 0;
    }
    return value.replace(FORMAT_CURRENCY, '');
}

function formatNumber(n) {
    // format number 1000000 to 1,234,567
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, FORMAT_CURRENCY)
}

function formatCurrencyText(input_val) {
    // don't validate empty input
    if (input_val === "") { return; }

    // original length
    var original_len = input_val.length;

    // initial caret position 
    var caret_pos = input_val.length;

    return formatNumber(input_val.toString());
}
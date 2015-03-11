define(['knockout','moment'],
    function (ko, moment) {

   

    var bindings = {
        init: init
    };


    return bindings;
    
    function init() {

        ko.bindingHandlers.enterkey = {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var allBindings = allBindingsAccessor();

                $(element).bind('keypress', 'input, textarea, select', function(e) {
                    var keyCode = e.which || e.keyCode;
                    if (keyCode !== 13) {
                        return true;
                    }

                    var target = e.target;
                    target.blur();

                    allBindings.enterkey.call(viewModel, viewModel, target, element);

                    return false;
                });
            }
        };

        ko.bindingHandlers.checkedStringToBool = {
            //modified implementation found here http://stackoverflow.com/questions/12004709/checkbox-is-always-checked
            init: function (element, valueAccessor, allBindingsAccessor) {

                var value = valueAccessor();
                var val = false;

                
                if (value()) val = value().toLowerCase() === allBindingsAccessor().value().toLowerCase();
                $(element).prop('checked', val);
                ko.utils.registerEventHandler(element, "change", function () {
                    var observable = valueAccessor();
                    
                    observable($(element).prop('checked') === true ? allBindingsAccessor().value() : '');
                });
            },
            
        };

        ko.bindingHandlers.currency = {            
            update: function(element, valueAccessor) {
                //unwrap the amount (could be observable or not)
                var amount = parseFloat(ko.utils.unwrapObservable(valueAccessor())) || 0;
                var newValueAccessor = function() {
                    return "$" + amount.toFixed(2);
                };

                ko.bindingHandlers.text.update(element, newValueAccessor);
            }  
        };




        ko.bindingHandlers.featureWindowNestedMenu = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var allBindings = allBindingsAccessor();
                var v = valueAccessor();
                var menuitem = $(element);
                var paneStart = $("#" + v.curpane);
                var mypane = $("#" + v.mpane);
                $(menuitem).click(function () {
                    paneStart.removeClass('submenu-show');
                    paneStart.addClass('submenu-hide');
                    mypane.removeClass('submenu-hide');
                    mypane.addClass('submenu-show');
                });
            }
        };

        ko.bindingHandlers.initScrollbar = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var allBindings = allBindingsAccessor();
                var v = valueAccessor();
                var scrollContainer = $(element);
                scrollContainer.mCustomScrollbar();
                
            }
        };

        //bsdropdown
        ko.bindingHandlers.bsdropdown = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var allBindings = allBindingsAccessor();
                var v = valueAccessor();
                var drp = $(element);
                drp.dropdown();

            }
        };

        ko.bindingHandlers.datePicker = {

            init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var allBindings = allBindingsAccessor();

                var dp = $(element).datepicker();
                var value = ko.utils.unwrapObservable(allBindings.value);

                dp.on('onSelect', function(dateText,inst) {

                    value(dateText);
                });
            },

            update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var allBindings = allBindingsAccessor();
                

                var value = ko.utils.unwrapObservable(allBindings.value);
                $(element).datepicker('setDate', moment.utc(value).format('L'));
            }
        };

        ko.bindingHandlers.date = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var value = valueAccessor();
                var allBindings = allBindingsAccessor();
                var valueUnwrapped = ko.utils.unwrapObservable(value);

                // Date formats: http://momentjs.com/docs/#/displaying/format/
                var pattern = allBindings.format || 'MM/DD/YYYY';

                var output = "-";
                if (valueUnwrapped !== null && valueUnwrapped !== undefined) {
                    output = moment(valueUnwrapped).format(pattern);
                }

                if ($(element).is("input") === true) {
                    $(element).val(output);
                } else {
                    $(element).text(output);
                }
            }
        };
    }
});
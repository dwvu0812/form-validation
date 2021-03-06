
function validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRule = {};

    //Ham validate
    function validate(inputElement, rule) {
        var errorMessage
        var errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorSelector);
            
        var rules = selectorRule[rule.selector];

        for ( var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }

            // errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }
            if (errorMessage) {
                errorElement.innerText = errorMessage;
                getParent(inputElement, options.formGroup).classList.add('invalid');
            } else {
                errorElement.innerText = '';
                getParent(inputElement, options.formGroup).classList.remove('invalid');
            }
            return !errorMessage;
    }

    //Lay element cua form can validate
    var formElement = document.querySelector(options.form);

    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function (e) {

            e.preventDefault();

            var isFormValid = true;


            // Lap qua tung rule va validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        
                        switch (input.type) {
                            case 'radio':
                            case 'checkbox':
                                if (input.matches(':checked')){
                                    values[input.name] = input.value;
                                } else {
                                    values[input.name] = '';
                                }
                                break;
                            default:
                                values[input.name] = input.value;

                        }
                        return values;
                    }, {});

                    options.onSubmit(formValues);
                } else {
                    formElement.submit();
                }
            }
        }
    


        // Lap qua moi element
        options.rules.forEach(function (rule) {

            if (Array.isArray(selectorRule[rule.selector])) {
                selectorRule[rule.selector].push(rule.test);
            } else {
                selectorRule[rule.selector] = [rule.test];
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                if (inputElement) {
                    // Xu ly blur ra hkoi input
                    inputElement.onblur = function () {
                var inputElement = formElement.querySelector(rule.selector);
                        validate(inputElement, rule);
                    }
    
                    // Xu ly khi nguoi dung nhap vao input
                    inputElement.oninput = function () {
                        var errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroup).classList.remove('invalid');
                    }
                }

            })

        });
    }
};

validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : 'Vui l??ng nh???p tr?????ng n??y.'
        }
    }
};

validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Tr?????ng n??y ph???i l?? email.'
        }
    }
};
validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : `Vui l??ng nh???p t???i thi???u ${min} k?? t???.`
        }
    }
};

validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Gi?? tr??? nh???p v??o kh??ng ch??nh x??c.'

        }
    }
}

validator({
    form: '#form-1',
    formGroup: '.form-group',
    errorSelector: '.form-message',
    rules: [
        validator.isRequired('#fullname'),
        validator.isRequired('#password-confirm'),
        validator.isRequired('input[name="gender"]'),
        validator.isEmail('#email'),
        validator.minLength('#password', 8),
        validator.isConfirmed('#password-confirm', function () {
            return document.querySelector('#form-1 #password').value;
        }, 'M???t kh???u nh???p l???i kh??ng ch??nh x??c.')
    ],
    onSubmit: function (data) {
        console.log(data);
    }
});
(function ($) {
  "use strict";

  // Selectors and classes
  var form = '.ajax-contact';
  var invalidCls = 'is-invalid';
  var $email = '[name="email"]';
  var $number = '[name="number"]';
  var $batch = '[name="batch"]'; // Added select element
  var $validation = '[name="parent_name"],[name="number"],[name="email"],[name="child_name"],[name="child_age"],[name="batch"],[name="message"]'; // Added batch to validation
  var formMessages = $('.form-messages');

  // 🔹 Initialize EmailJS
  emailjs.init("URBQj-2FY8XO7TEQg"); // Your EmailJS public key

  // 🔹 Send form via EmailJS
  function sendContact() {
    var valid = validateContact();
    if (valid) {
      formMessages.removeClass('error success').text('Sending...');

      emailjs.sendForm("service_gyorn2l", "template_nuqzlp6", $(form)[0])
        .then(function (response) {
          console.log("SUCCESS!", response.status, response.text);
          formMessages.removeClass('error').addClass('success');
          formMessages.text("✅ Message sent successfully!");
          $(form + ' input:not([type="submit"]), ' + form + ' textarea, ' + form + ' select').val(''); // Added select to reset
        }, function (error) {
          console.error("FAILED...", error);
          formMessages.removeClass('success').addClass('error');
          formMessages.text("❌ Failed to send message. Please try again later.");
        });
    }
  }

  // 🔹 Validate the form
  function validateContact() {
    var valid = true;
    var formInput;

    // Clear old messages
    formMessages.removeClass('success').addClass('error').text('');

    function unvalid($validation) {
      $validation = $validation.split(',');
      for (var i = 0; i < $validation.length; i++) {
        formInput = form + ' ' + $validation[i];
        var $element = $(formInput);
        
        // Special handling for select element
        if ($element.is('select')) {
          if (!$element.val() || $element.val() === "") {
            $element.addClass(invalidCls);
            valid = false;
          } else {
            $element.removeClass(invalidCls);
          }
        } 
        // Handling for input and textarea
        else if (!$element.val() || $element.val().trim() === "") {
          $element.addClass(invalidCls);
          valid = false;
        } else {
          $element.removeClass(invalidCls);
        }
      }
    }

    unvalid($validation);

    // 🔸 Email validation
    var emailVal = $($email).val().trim();
    if (!emailVal || !emailVal.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/)) {
      $($email).addClass(invalidCls);
      valid = false;
      if (valid) formMessages.text("⚠️ Please enter a valid email address.");
    } else {
      $($email).removeClass(invalidCls);
    }

    // 🔸 Indian phone number validation
    var phoneVal = $($number).val().trim();
    var indianPhonePattern = /^[6-9]\d{9}$/; // Must start with 6-9 and have 10 digits

    if (!indianPhonePattern.test(phoneVal)) {
      $($number).addClass(invalidCls);
      valid = false;
      if (valid) formMessages.text("⚠️ Please enter a valid 10-digit Indian phone number (starting with 6–9).");
    } else {
      $($number).removeClass(invalidCls);
    }

    // 🔸 Course selection validation (specific message)
    var batchVal = $($batch).val();
    if (!batchVal || batchVal === "") {
      if (valid) formMessages.text("⚠️ Please select a course.");
    }

    return valid;
  }

  // 🔹 Handle form submit
  $(form).on('submit', function (element) {
    element.preventDefault();
    sendContact();
  });

})(jQuery);
(function ($) {
  "use strict";

  $(document).ready(function () {
    const form = '.ajax-register';
    const invalidCls = 'is-invalid';
    const $form = $(form);

    if ($form.length === 0) {
      console.log('Registration form not found');
      return;
    }

    const $email = $form.find('[name="email"]');
    const $phone = $form.find('[name="number"]');
    const $validation = $form.find('[name="name"],[name="email"],[name="number"],[name="child_name"],[name="batch"]');
    const $formMessages = $form.find('.form-messages');

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.init("URBQj-2FY8XO7TEQg");
      console.log('EmailJS initialized for registration form');
    } else {
      console.error('EmailJS not loaded');
    }

    function validateForm() {
      let valid = true;
      $formMessages.text('').removeClass('error success');

      // Validate required fields
      $validation.each(function () {
        const field = $(this);
        if (!field.val().trim()) {
          field.addClass(invalidCls);
          valid = false;
        } else {
          field.removeClass(invalidCls);
        }
      });

      if (!valid) {
        $formMessages.addClass('error').text("⚠️ Please fill in all required fields.");
        return false;
      }

      // Validate email
      const emailVal = $email.val().trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailVal)) {
        $email.addClass(invalidCls);
        $formMessages.addClass('error').text("⚠️ Please enter a valid email address.");
        return false;
      }

      // Validate Indian phone number
      const phoneVal = $phone.val().trim().replace(/\s+/g, '');
      const phonePattern = /^[6-9]\d{9}$/;
      if (!phonePattern.test(phoneVal)) {
        $phone.addClass(invalidCls);
        $formMessages.addClass('error').text("⚠️ Please enter a valid Indian phone number (10 digits starting with 6-9).");
        return false;
      }

      return true;
    }

    function sendRegistration() {
      console.log('sendRegistration called');

      if (!validateForm()) {
        console.log('Validation failed');
        return;
      }

      $formMessages.removeClass('error success').text('⏳ Submitting your registration...');
      $form.find('button').prop('disabled', true);
      $form.find('.vs-btn').html('<i class="fal fa-spinner fa-spin"></i> Sending...');

      const templateParams = {
        name: $form.find('[name="name"]').val().trim(),
        email: $email.val().trim(),
        number: $phone.val().trim().replace(/\s+/g, ''),
        child_name: $form.find('[name="child_name"]').val().trim(),
        batch: $form.find('[name="batch"]').val().trim(),
        message: $form.find('[name="message"]').val().trim() || 'No additional message provided',
      };

      console.log('Sending registration with params:', templateParams);

      emailjs.send("service_gyorn2l", "template_nuqzlp6", templateParams)
        .then((response) => {
          console.log('Registration email sent successfully:', response);
          $formMessages.addClass('success').text("✅ Registration successful! We'll contact you soon.");
          $form[0].reset();
          $validation.removeClass(invalidCls);

          setTimeout(() => {
            $form.find('button').prop('disabled', false);
            $form.find('.vs-btn').html('<i class="fal fa-paper-plane"></i> Register Now');
          }, 2000);
        })
        .catch((error) => {
          console.error('EmailJS Registration Error:', error);
          $formMessages.addClass('error').text("❌ Failed to send registration. Please try again later.");
          $form.find('button').prop('disabled', false);
          $form.find('.vs-btn').html('<i class="fal fa-paper-plane"></i> Register Now');
        });
    }

    // Real-time input validation
    $validation.on('input', function () {
      const field = $(this);
      if (field.val().trim()) {
        field.removeClass(invalidCls);
      }
    });

    // Handle submit
    $form.on('submit', function (e) {
      console.log('Registration form submit event triggered - PREVENTING DEFAULT');
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      sendRegistration();
      return false;
    });

    // Extra safety for buttons
    $form.find('button').on('click', function (e) {
      console.log('Register button clicked - PREVENTING DEFAULT');
      e.preventDefault();
      e.stopPropagation();
      $form.trigger('submit');
      return false;
    });

    $('.vs-btn').on('click', function (e) {
      if ($(this).closest(form).length) {
        console.log('VS button clicked inside register form');
        e.preventDefault();
        e.stopPropagation();
        $form.trigger('submit');
        return false;
      }
    });

    console.log('Registration form handler initialized');
  });

})(jQuery);

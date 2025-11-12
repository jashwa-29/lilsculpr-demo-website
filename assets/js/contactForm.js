(function ($) {
  "use strict";

  // Wait for DOM to be fully loaded
  $(document).ready(function() {
    const form = '.ajax-contact';
    const invalidCls = 'is-invalid';
    const $form = $(form);
    
    // Check if form exists on page
    if ($form.length === 0) {
      console.log('Contact form not found');
      return;
    }

    const $email = $form.find('[name="email"]');
    const $phone = $form.find('[name="number"]');
    const $validation = $form.find('[name="name"],[name="email"],[name="number"],[name="message"]');
    const $formMessages = $('.form-messages');
    
    // FIXED: Use multiple selectors to find the button
    const $button = $form.find('button[type="submit"], .vs-btn.wave-btn, button:contains("Send Now")');
    
    // Debug logging
    console.log('Form elements found:', {
      form: $form.length,
      email: $email.length,
      phone: $phone.length,
      button: $button.length,
      messages: $formMessages.length,
      buttonHTML: $form.find('button').html() // Check what buttons exist
    });

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.init("URBQj-2FY8XO7TEQg");
      console.log('EmailJS initialized');
    } else {
      console.error('EmailJS not loaded');
    }

    function validateContact() {
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

      // Email validation
      const emailVal = $email.val().trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailVal)) {
        $email.addClass(invalidCls);
        $formMessages.addClass('error').text("⚠️ Please enter a valid email address.");
        return false;
      }

      // Phone validation (Indian format)
      const phoneVal = $phone.val().trim().replace(/\s+/g, '');
      const phonePattern = /^[6-9]\d{9}$/;
      if (!phonePattern.test(phoneVal)) {
        $phone.addClass(invalidCls);
        $formMessages.addClass('error').text("⚠️ Please enter a valid Indian phone number (10 digits starting with 6-9).");
        return false;
      }

      return true;
    }

    function sendContact() {
      console.log('sendContact called');
      
      if (!validateContact()) {
        console.log('Validation failed');
        return;
      }

      $formMessages.removeClass('error success').text('⏳ Sending your message...');
      
      // Disable all buttons in the form to prevent multiple submissions
      $form.find('button').prop('disabled', true);
      $form.find('.vs-btn').text('Sending...');

      // Use template parameters
      const templateParams = {
        from_name: $form.find('[name="name"]').val().trim(),
        from_email: $email.val().trim(),
        number: $phone.val().trim().replace(/\s+/g, ''),
        message: $form.find('[name="message"]').val().trim()
      };

      console.log('Sending email with params:', templateParams);

      emailjs.send("service_gyorn2l", "template_nuqzlp6", templateParams)
        .then((response) => {
          console.log('Email sent successfully:', response);
          $formMessages.addClass('success').text("✅ Your message has been sent successfully! We'll get back to you soon.");
          $form[0].reset();
          $validation.removeClass(invalidCls);
          
          // Reset button after delay
          setTimeout(() => {
            $form.find('button').prop('disabled', false);
            $form.find('.vs-btn').text('Send Now');
          }, 2000);
        })
        .catch((error) => {
          console.error('EmailJS Error:', error);
          $formMessages.addClass('error').text("❌ Failed to send message. Please try again later or contact us directly.");
          $form.find('button').prop('disabled', false);
          $form.find('.vs-btn').text('Send Now');
        });
    }

    // Real-time validation
    $validation.on('input', function() {
      const field = $(this);
      if (field.val().trim()) {
        field.removeClass(invalidCls);
      }
    });

    // PRIMARY FIX: Handle form submission directly
    $form.on('submit', function (e) {
      console.log('Form submit event triggered - PREVENTING DEFAULT');
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      sendContact();
      return false;
    });

    // ALTERNATIVE: If button still not found, add a click handler to any button in the form
    $form.find('button').on('click', function(e) {
      console.log('Any button in form clicked - PREVENTING DEFAULT');
      e.preventDefault();
      e.stopPropagation();
      $form.trigger('submit');
      return false;
    });

    // EXTRA SAFETY: Prevent default on any element with the vs-btn class
    $('.vs-btn').on('click', function(e) {
      if ($(this).closest(form).length) {
        console.log('VS button in form clicked - PREVENTING DEFAULT');
        e.preventDefault();
        e.stopPropagation();
        $form.trigger('submit');
        return false;
      }
    });

    console.log('Contact form handler initialized');
  });

})(jQuery);
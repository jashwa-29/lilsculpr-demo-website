(function ($) {
  "use strict";

  // Wait for DOM to be fully loaded
  $(document).ready(function() {
    const form = '.ajax-contact';
    const invalidCls = 'is-invalid';
    const $form = $(form);
    
    // Check if form exists on page
    if ($form.length === 0) {
      return;
    }

    const $email = $form.find('[name="email"]');
    const $phone = $form.find('[name="number"]');
    const $validation = $form.find('[name="name"],[name="email"],[name="number"],[name="message"],[name="age"]');
    const $formMessages = $('.form-messages');
    
    // Find the submit button consistently
    const $button = $form.find('button[type="submit"]');

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.init("URBQj-2FY8XO7TEQg");
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
      if (!validateContact()) {
        return;
      }

      $formMessages.removeClass('error success').text('⏳ Sending your message...');
      
      // Disable button and update text
      $button.prop('disabled', true).text('Sending...');

      // Use template parameters matching the User's EmailJS template
      const templateParams = {
        name: $form.find('[name="name"]').val().trim(),
        email: $email.val().trim(),
        number: $phone.val().trim().replace(/\s+/g, ''),
        age: $form.find('[name="age"]').val().trim(),
        class_type: $form.find('[name="class_type"]').val(),
        message: $form.find('[name="message"]').val().trim()
      };

      emailjs.send("service_gyorn2l", "template_nuqzlp6", templateParams)
        .then((response) => {
          $formMessages.addClass('success').text("✅ Your message has been sent successfully! We'll get back to you soon.");
          $form[0].reset();
          $validation.removeClass(invalidCls);
          
          // Reset button after delay
          setTimeout(() => {
            $button.prop('disabled', false).text('👉 Send Enquiry');
          }, 2000);
        })
        .catch((error) => {
          console.error('EmailJS Error:', error);
          $formMessages.addClass('error').text("❌ Failed to send message. Please try again later or contact us directly.");
          $button.prop('disabled', false).text('👉 Send Enquiry');
        });
    }

    // Real-time validation
    $validation.on('input', function() {
      const field = $(this);
      if (field.val().trim()) {
        field.removeClass(invalidCls);
      }
    });

    // Handle form submission
    $form.on('submit', function (e) {
      e.preventDefault();
      sendContact();
    });

  });

})(jQuery);
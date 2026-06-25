(function ($) {
    "use strict";

    // ==================== CONFIGURATION ====================
    // const BACKEND_API      = 'https://backend.lilsculpr.com/api/free-workshop/register';
    // const SLOTS_API        = 'https://backend.lilsculpr.com/api/free-workshop/slots';
    const BACKEND_API   = 'http://localhost:5000/api/free-workshop/register';
    const SLOTS_API     = 'http://localhost:5000/api/free-workshop/slots';

    const TOTAL_SLOTS = 50;

    // ==================== FETCH SLOT COUNT ON LOAD ====================
    async function fetchSlots() {
        try {
            const res = await axios.get(SLOTS_API);
            const { remaining, registered, isFull } = res.data;
            updateSlotUI(remaining, registered, isFull);
        } catch (err) {
            console.error('Could not fetch slots:', err);
            $('#slots-badge').text('—');
            $('#slots-remaining-text').text('Could not load seat info');
        }
    }

    function updateSlotUI(remaining, registered, isFull) {
        const pct = Math.min(100, (registered / TOTAL_SLOTS) * 100);
        const $fill  = $('#slots-fill');
        const $badge = $('#slots-badge');
        const $text  = $('#slots-remaining-text');
        const $btn   = $('#submit-btn');

        // Progress bar
        $fill.css('width', pct + '%');
        $fill.removeClass('low full');

        if (isFull) {
            $fill.addClass('full');
            $badge.addClass('full').removeClass('low').text('FULL');
            $text.css('color', '#c62828').text('Seats are fully booked!');
            $btn.prop('disabled', true).find('.btn-text').text('Registrations Closed');
        } else if (remaining <= 10) {
            $fill.addClass('low');
            $badge.addClass('low').removeClass('full').text(remaining + ' left!');
            $text.css('color', '#e65100').text('Only ' + remaining + ' seats remaining — hurry!');
        } else {
            $badge.removeClass('full low').text(remaining + ' available');
            $text.css('color', '#2e7d32').text(remaining + ' seats still available');
        }
    }

    // Fetch on page load
    fetchSlots();

    // ==================== FORM SUBMISSION ====================
    $('#contactForm').on('submit', async function (e) {
        e.preventDefault();

        const formData = {
            parentName : $('[name="parentName"]').val().trim(),
            phone      : $('[name="phone"]').val().trim(),
            email      : $('[name="email"]').val().trim(),
            childName  : $('[name="childName"]').val().trim(),
            childAge   : $('[name="childAge"]').val().trim()
        };

        // --- Client-side validation ---
        if (!formData.parentName || !formData.phone || !formData.email || !formData.childName || !formData.childAge) {
            showMessage('⚠️ Please fill in all required fields.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showMessage('⚠️ Please enter a valid email address.', 'error');
            return;
        }

        const phone = formData.phone.replace(/\s/g, '');
        if (!/^[6-9]\d{9}$/.test(phone)) {
            showMessage('⚠️ Please enter a valid 10-digit Indian mobile number.', 'error');
            return;
        }

        const age = parseInt(formData.childAge);
        if (isNaN(age) || age < 5 || age > 14) {
            showMessage('⚠️ Child age must be between 5 and 14 years.', 'error');
            return;
        }

        // --- Loading state ---
        const $btn = $('#submit-btn');
        const $btnText = $btn.find('.btn-text');
        const $loader  = $btn.find('.button-loader');
        $btnText.hide();
        $loader.show();
        $btn.prop('disabled', true);
        $('.form-messages').hide();

        try {
            const response = await axios.post(BACKEND_API, formData);

            if (response.data && response.data.success) {
                showMessage('🎉 Registration successful! A confirmation will be shared with you shortly. See you on 28 June! 🐧', 'success');
                $('#contactForm')[0].reset();
                // Refresh slot count after successful registration
                fetchSlots();
            } else {
                showMessage('❌ ' + (response.data.message || 'Registration failed. Please try again.'), 'error');
            }

        } catch (error) {
            console.error('Registration Error:', error);
            let msg = '❌ Something went wrong. Please try again later.';
            if (error.response && error.response.data && error.response.data.message) {
                msg = '❌ ' + error.response.data.message;
            }
            showMessage(msg, 'error');
        } finally {
            $btnText.show();
            $loader.hide();
            $btn.prop('disabled', false);
        }
    });

    // ==================== MESSAGE HELPER ====================
    function showMessage(msg, type) {
        const $msgs = $('.form-messages');
        $msgs.removeClass('text-success text-danger').removeAttr('style');

        if (type === 'success') {
            $msgs.css({
                'color'            : '#155724',
                'background-color' : '#d4edda',
                'border'           : '1px solid #c3e6cb',
                'padding'          : '12px 16px',
                'border-radius'    : '8px',
                'font-size'        : '14px',
                'font-weight'      : '500',
                'line-height'      : '1.5'
            });
        } else {
            $msgs.css({
                'color'            : '#721c24',
                'background-color' : '#f8d7da',
                'border'           : '1px solid #f5c6cb',
                'padding'          : '12px 16px',
                'border-radius'    : '8px',
                'font-size'        : '14px',
                'font-weight'      : '500',
                'line-height'      : '1.5'
            });
        }

        $msgs.text(msg).show();

        // Auto-scroll to message
        $('html, body').animate({ scrollTop: $msgs.offset().top - 100 }, 400);
    }

})(jQuery);

// Firebase and EmailJS initialization
(function ($) {
    "use strict";

    // Initialize EmailJS
    emailjs.init("URBQj-2FY8XO7TEQg");

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDGV0EvpH_jfqk5HN7fFfr79I8gLd7lOxI",
        authDomain: "lil-sculpr.firebasestorage.app",
        databaseURL: "https://lil-sculpr-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "lil-sculpr",
        storageBucket: "lil-sculpr.firebasestorage.app",
        messagingSenderId: "836136061215",
        appId: "1:836136061215:web:3e025d30218e37747cc82a"
    };

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // Selectors and classes
    var form = '.ajax-contact';
    var submitBtn = '.vs-btn[type="submit"]';
    var invalidCls = 'is-invalid';
    var $email = '[name="email"]';
    var $number = '[name="number"]';
    var $batch = '[name="batch"]';
    var $validation = '[name="parent_name"],[name="number"],[name="email"],[name="child_name"],[name="child_age"],[name="batch"]';
    var formMessages = $('.form-messages');

    // 🔹 Sanitize Firebase key - replace invalid characters with underscores
    function sanitizeFirebaseKey(key) {
        return key.replace(/[.#$\[\]]/g, "_");
    }

    // 🔹 Show loader in button
    function showButtonLoader() {
        var $submitBtn = $(submitBtn);
        $submitBtn.prop('disabled', true);
        $submitBtn.html('<span class="button-loader"></span> Processing...');
    }

    // 🔹 Hide loader and restore button text
    function hideButtonLoader() {
        var $submitBtn = $(submitBtn);
        $submitBtn.prop('disabled', false);
        $submitBtn.text('Book Your Free Assessment');
    }

    // 🔹 Check if email has already registered
    async function checkEmailRegistration(email) {
        try {
            const normalizedEmail = email.toLowerCase().trim();
            const sanitizedEmail = sanitizeFirebaseKey(normalizedEmail);
            const emailRef = firebase.database().ref("registrations/emails/" + sanitizedEmail);
            const snapshot = await emailRef.get();
            return snapshot.exists();
        } catch (error) {
            console.error('Error checking email registration:', error);
            return false;
        }
    }

    // 🔹 Check if phone number has already registered
    async function checkPhoneRegistration(phone) {
        try {
            const normalizedPhone = phone.replace(/\s+|[-+()]/g, '');
            const sanitizedPhone = sanitizeFirebaseKey(normalizedPhone);
            const phoneRef = firebase.database().ref("registrations/phones/" + sanitizedPhone);
            const snapshot = await phoneRef.get();
            return snapshot.exists();
        } catch (error) {
            console.error('Error checking phone registration:', error);
            return false;
        }
    }

    // 🔹 Record registration details after successful registration
    async function recordRegistration(email, phone) {
        try {
            const timestamp = Date.now();
            
            // Sanitize all keys
            const normalizedEmail = email.toLowerCase().trim();
            const sanitizedEmail = sanitizeFirebaseKey(normalizedEmail);
            const normalizedPhone = phone.replace(/\s+|[-+()]/g, '');
            const sanitizedPhone = sanitizeFirebaseKey(normalizedPhone);

            // Record Email
            const emailRef = firebase.database().ref("registrations/emails/" + sanitizedEmail);
            await emailRef.set({ 
                timestamp: timestamp, 
                phone: phone,
                originalEmail: email
            });

            // Record Phone
            const phoneRef = firebase.database().ref("registrations/phones/" + sanitizedPhone);
            await phoneRef.set({ 
                timestamp: timestamp, 
                email: email,
                originalPhone: phone
            });

            console.log("✅ Registration recorded successfully");

        } catch (error) {
            console.error('Error recording registration:', error);
        }
    }

    // 🔹 FIXED: Handle form submit
    $(document).on('submit', form, async function (element) {
        element.preventDefault();
        console.log("Form submission intercepted");

        var valid = validateContact();
        if (!valid) {
            return false;
        }

        // Show button loader
        showButtonLoader();

        // Get form data
        var selectedBatch = $($batch).val();
        var userEmail = $($email).val().trim();
        var userPhone = $($number).val().trim();

        // Show loading state
        formMessages.removeClass('error success').text('Checking availability...');

        try {
            // ✅ Check email restrictions
            const emailRegistered = await checkEmailRegistration(userEmail);
            if (emailRegistered) {
                formMessages.removeClass('success').addClass('error');
                formMessages.text('❌ This email address has already been registered. Please use a different email.');
                $($email).addClass(invalidCls);
                hideButtonLoader();
                return false;
            }

            // ✅ Check phone restrictions
            const phoneRegistered = await checkPhoneRegistration(userPhone);
            if (phoneRegistered) {
                formMessages.removeClass('success').addClass('error');
                formMessages.text('❌ This phone number has already been registered. Please use a different phone number.');
                $($number).addClass(invalidCls);
                hideButtonLoader();
                return false;
            }

            // ✅ Check Firebase slot availability
            const batchesRef = firebase.database().ref("batches");
            const snapshot = await batchesRef.get();
            const data = snapshot.exists() ? snapshot.val() : {};

            const cleanKey = sanitizeFirebaseKey(selectedBatch);
            if (!data[cleanKey]) data[cleanKey] = 0;

            if (data[cleanKey] >= 10) {
                formMessages.removeClass('success').addClass('error');
                formMessages.text('❌ Sorry, this time slot is full.');
                hideButtonLoader();
                return false;
            }

            // Send form via EmailJS
            formMessages.text('Sending registration...');
            
            await emailjs.sendForm("service_gyorn2l", "template_nuqzlp6", this);
            console.log("✅ Email sent successfully!");

            // Update Firebase count and record registration details
            await batchesRef.update({ [cleanKey]: data[cleanKey] + 1 });
            await recordRegistration(userEmail, userPhone);

            formMessages.removeClass('error').addClass('success');
            formMessages.text("✅ Registration successful! See you soon!");

            // Reset form
            $(this).trigger('reset');
            await disableFullSlots();
            
        } catch (error) {
            console.error("❌ FAILED:", error);
            formMessages.removeClass('success').addClass('error');
            formMessages.text("❌ Failed to send message. Please try again later.");
        } finally {
            // Always hide loader whether success or error
            hideButtonLoader();
        }
        
        return false;
    });

    // 🔹 Disable full slots dynamically with color indication
    async function disableFullSlots() {
        try {
            const batchesRef = firebase.database().ref("batches");
            const snapshot = await batchesRef.get();
            if (!snapshot.exists()) return;

            const data = snapshot.val();
            $('select[name="batch"] option').each(function () {
                const val = $(this).val();
                if (!val) return;
                
                const cleanKey = sanitizeFirebaseKey(val);
                if (data[cleanKey] >= 10) {
                    $(this).attr("disabled", true);
                    $(this).addClass('full-slot'); // Add color class
                    if (!$(this).text().includes("(Full)")) {
                        $(this).text($(this).text() + " (Full)");
                    }
                } else {
                    $(this).attr("disabled", false);
                    $(this).removeClass('full-slot'); // Remove color class
                    $(this).text($(this).text().replace(" (Full)", ""));
                }
            });
        } catch (error) {
            console.error('Error disabling full slots:', error);
        }
    }

    // 🔹 Enhanced validation function
    function validateContact() {
        var valid = true;
        formMessages.removeClass('success').addClass('error').text('');
        var formInput;

        function unvalid($validation) {
            $validation = $validation.split(',');
            for (var i = 0; i < $validation.length; i++) {
                formInput = form + ' ' + $validation[i].trim();
                var $element = $(formInput);
                
                if ($element.length === 0) continue;
                
                if ($element.is('select')) {
                    if (!$element.val() || $element.val() === "") {
                        $element.addClass(invalidCls);
                        valid = false;
                    } else {
                        $element.removeClass(invalidCls);
                    }
                } else if (!$element.val() || $element.val().trim() === "") {
                    $element.addClass(invalidCls);
                    valid = false;
                } else {
                    $element.removeClass(invalidCls);
                }
            }
        }

        unvalid($validation);

        // Email validation
        var emailVal = $($email).val().trim();
        if (!emailVal.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})$/)) {
            $($email).addClass(invalidCls);
            valid = false;
        } else {
            $($email).removeClass(invalidCls);
        }

        // Phone validation (India)
        var phoneVal = $($number).val().trim();
        var cleanPhone = phoneVal.replace(/\s+|[-+()]/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            $($number).addClass(invalidCls);
            valid = false;
        } else {
            $($number).removeClass(invalidCls);
        }

        return valid;
    }

    // 🔹 Real-time validation for email and phone
    $(document).on('blur', $email, async function() {
        const email = $(this).val().trim();
        if (email && email.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})$/)) {
            const emailRegistered = await checkEmailRegistration(email);
            if (emailRegistered) {
                $(this).addClass(invalidCls);
                formMessages.removeClass('success').addClass('error');
                formMessages.text('❌ This email is already registered.');
            } else {
                $(this).removeClass(invalidCls);
                formMessages.text('');
            }
        }
    });

    $(document).on('blur', $number, async function() {
        const phone = $(this).val().trim();
        const cleanPhone = phone.replace(/\s+|[-+()]/g, '');
        if (cleanPhone && /^[6-9]\d{9}$/.test(cleanPhone)) {
            const phoneRegistered = await checkPhoneRegistration(phone);
            if (phoneRegistered) {
                $(this).addClass(invalidCls);
                formMessages.removeClass('success').addClass('error');
                formMessages.text('❌ This phone number is already registered.');
            } else {
                $(this).removeClass(invalidCls);
                formMessages.text('');
            }
        }
    });

    // Add CSS for full slots and button loader
    function addCustomStyles() {
        if (!$('#custom-styles').length) {
            $('head').append(`
                <style id="custom-styles">
                    select[name="batch"] option.full-slot {
                        color: #dc3545 !important;
                        background-color: #f8d7da !important;
                        font-weight: bold;
                    }
                    select[name="batch"] option:disabled {
                        color: #6c757d;
                    }
                    select[name="batch"] option.full-slot:disabled {
                        color: #dc3545 !important;
                        background-color: #f8d7da !important;
                        font-weight: bold;
                    }
                    
                    /* Button loader styles */
                    .button-loader {
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        border: 2px solid #ffffff;
                        border-radius: 50%;
                        border-top-color: transparent;
                        animation: buttonSpin 1s ease-in-out infinite;
                        margin-right: 8px;
                        vertical-align: middle;
                    }
                    
                    @keyframes buttonSpin {
                        to { transform: rotate(360deg); }
                    }
                    
                    .vs-btn[disabled] {
                        opacity: 0.7;
                        cursor: not-allowed;
                    }
                </style>
            `);
        }
    }

    // Run once when page loads
    $(document).ready(function() {
        addCustomStyles();
        disableFullSlots();
        console.log("Form handler initialized");
    });

})(jQuery);
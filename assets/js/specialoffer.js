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
    var $childName = '[name="child_name"]';
    var $validation = '[name="parent_name"],[name="number"],[name="email"],[name="child_name"],[name="child_age"],[name="batch"]';
    var formMessages = $('.form-messages');

    // 🔹 Sanitize Firebase key - replace invalid characters with underscores
    function sanitizeFirebaseKey(key) {
        return key.replace(/[.#$\[\]]/g, "_");
    }

    // 🔹 Normalize child name for consistent comparison
    function normalizeChildName(name) {
        return name.trim().toLowerCase().replace(/\s+/g, ' ');
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

    // 🔹 NEW: Get slot availability count
    async function getSlotAvailability(batchName) {
        try {
            const batchesRef = firebase.database().ref("batches");
            const snapshot = await batchesRef.get();
            const data = snapshot.exists() ? snapshot.val() : {};

            const cleanKey = sanitizeFirebaseKey(batchName);
            const currentCount = data[cleanKey] || 0;
            const availableSlots = Math.max(0, 10 - currentCount);
            
            return {
                current: currentCount,
                available: availableSlots,
                isFull: currentCount >= 10
            };
        } catch (error) {
            console.error('Error getting slot availability:', error);
            return { current: 0, available: 10, isFull: false };
        }
    }

    // 🔹 NEW: Update batch options with live slot counts
    async function updateBatchOptionsWithAvailability() {
        try {
            const $batchSelect = $($batch);
            const batchesRef = firebase.database().ref("batches");
            const snapshot = await batchesRef.get();
            const data = snapshot.exists() ? snapshot.val() : {};

            $batchSelect.find('option').each(function() {
                const val = $(this).val();
                if (!val) return;

                const cleanKey = sanitizeFirebaseKey(val);
                const currentCount = data[cleanKey] || 0;
                const availableSlots = Math.max(0, 10 - currentCount);
                
                // Get original option text without any slot info
                let originalText = $(this).attr('data-original-text') || $(this).text();
                // Remove any existing slot info from original text
                originalText = originalText.replace(/\s*\(\d+\s*slots? available\)\s*$/, '')
                                          .replace(/\s*\(Full\)\s*$/, '')
                                          .trim();
                
                // Store original text for future use
                if (!$(this).attr('data-original-text')) {
                    $(this).attr('data-original-text', originalText);
                }
                
                if (currentCount >= 10) {
                    $(this).text(originalText + ' (Full)');
                    $(this).attr("disabled", true);
                    $(this).addClass('full-slot');
                } else {
                    const slotText = availableSlots === 1 ? 'slot' : 'slots';
                    $(this).text(originalText + ` (${availableSlots} ${slotText} available)`);
                    $(this).attr("disabled", false);
                    $(this).removeClass('full-slot');
                }
            });

            console.log("✅ Batch options updated with live availability");
            
        } catch (error) {
            console.error('Error updating batch options:', error);
        }
    }

    // 🔹 NEW: Check if the exact same registration exists (email + phone + child name)
    async function checkExactRegistration(email, phone, childName) {
        try {
            const normalizedEmail = email.toLowerCase().trim();
            const normalizedPhone = phone.replace(/\s+|[-+()]/g, '');
            const normalizedChildName = normalizeChildName(childName);
            
            // Check in email registrations
            const emailRef = firebase.database().ref("registrations/emails");
            const emailSnapshot = await emailRef.get();
            
            if (emailSnapshot.exists()) {
                const emailData = emailSnapshot.val();
                for (const [emailKey, emailDetails] of Object.entries(emailData)) {
                    // Check if this email has the same child name
                    if (emailDetails.children && emailDetails.children[normalizedChildName]) {
                        return {
                            exists: true,
                            message: `❌ This child "${childName}" is already registered with the provided email and phone number.`
                        };
                    }
                }
            }

            // Check in phone registrations
            const phoneRef = firebase.database().ref("registrations/phones");
            const phoneSnapshot = await phoneRef.get();
            
            if (phoneSnapshot.exists()) {
                const phoneData = phoneSnapshot.val();
                for (const [phoneKey, phoneDetails] of Object.entries(phoneData)) {
                    // Check if this phone has the same child name
                    if (phoneDetails.children && phoneDetails.children[normalizedChildName]) {
                        return {
                            exists: true,
                            message: `❌ This child "${childName}" is already registered with the provided email and phone number.`
                        };
                    }
                }
            }

            return { exists: false };

        } catch (error) {
            console.error('Error checking exact registration:', error);
            return { exists: false };
        }
    }

    // 🔹 Record registration details after successful registration
    async function recordRegistration(email, phone, childName) {
        try {
            const timestamp = Date.now();
            
            // Sanitize all keys
            const normalizedEmail = email.toLowerCase().trim();
            const sanitizedEmail = sanitizeFirebaseKey(normalizedEmail);
            const normalizedPhone = phone.replace(/\s+|[-+()]/g, '');
            const sanitizedPhone = sanitizeFirebaseKey(normalizedPhone);
            const normalizedChildName = normalizeChildName(childName);
            const sanitizedChildName = sanitizeFirebaseKey(normalizedChildName);

            // Record Email with child information
            const emailRef = firebase.database().ref("registrations/emails/" + sanitizedEmail);
            const emailData = {
                timestamp: timestamp,
                phone: phone,
                originalEmail: email,
                lastUpdated: timestamp
            };
            
            // Add child to children subnode
            emailData.children = {};
            emailData.children[sanitizedChildName] = {
                name: childName,
                registeredAt: timestamp
            };
            
            await emailRef.set(emailData);

            // Record Phone with child information
            const phoneRef = firebase.database().ref("registrations/phones/" + sanitizedPhone);
            const phoneData = {
                timestamp: timestamp,
                email: email,
                originalPhone: phone,
                lastUpdated: timestamp
            };
            
            // Add child to children subnode
            phoneData.children = {};
            phoneData.children[sanitizedChildName] = {
                name: childName,
                registeredAt: timestamp
            };
            
            await phoneRef.set(phoneData);

            console.log("✅ Registration recorded successfully with child name");

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
        var childName = $($childName).val().trim();

        // Show loading state
        formMessages.removeClass('error success').text('Checking availability...');

        try {
            // ✅ NEW: Only check if the exact same registration exists (email + phone + child name)
            const exactRegistrationCheck = await checkExactRegistration(userEmail, userPhone, childName);
            if (exactRegistrationCheck.exists) {
                formMessages.removeClass('success').addClass('error');
                formMessages.text(exactRegistrationCheck.message);
                $($childName).addClass(invalidCls);
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
                formMessages.text('❌ Sorry, this time slot is full. Please select another slot.');
                hideButtonLoader();
                return false;
            }

            // Send form via EmailJS
            formMessages.text('Sending registration...');
            
            await emailjs.sendForm("service_gyorn2l", "template_nuqzlp6", this);
            console.log("✅ Email sent successfully!");

            // Update Firebase count and record registration details
            await batchesRef.update({ [cleanKey]: data[cleanKey] + 1 });
            await recordRegistration(userEmail, userPhone, childName);

            formMessages.removeClass('error').addClass('success');
            formMessages.text("✅ Registration successful! See you soon!");

            // Reset form and update slot display
            $(this).trigger('reset');
            await updateBatchOptionsWithAvailability();
            
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

    // 🔹 UPDATED: Disable full slots and show availability
    async function disableFullSlots() {
        try {
            await updateBatchOptionsWithAvailability();
        } catch (error) {
            console.error('Error disabling full slots:', error);
        }
    }

    // 🔹 NEW: Real-time slot monitoring
    function startSlotMonitoring() {
        const batchesRef = firebase.database().ref("batches");
        
        // Listen for real-time changes
        batchesRef.on('value', function(snapshot) {
            console.log("🔄 Real-time slot update detected");
            updateBatchOptionsWithAvailability();
        });
        
        console.log("✅ Real-time slot monitoring started");
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

    // 🔹 UPDATED: Real-time validation - only check exact registration when all three fields are filled
    function checkAllFieldsFilled() {
        const email = $($email).val().trim();
        const phone = $($number).val().trim();
        const childName = $($childName).val().trim();
        
        return email && phone && childName;
    }

    // 🔹 UPDATED: Check for exact duplicate registration
    async function validateExactRegistration() {
        if (!checkAllFieldsFilled()) {
            return;
        }

        const email = $($email).val().trim();
        const phone = $($number).val().trim();
        const childName = $($childName).val().trim();
        
        const emailValid = email.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})$/);
        const phoneValid = /^[6-9]\d{9}$/.test(phone.replace(/\s+|[-+()]/g, ''));
        
        if (emailValid && phoneValid) {
            formMessages.removeClass('success error').text('Checking registration...');
            
            const exactCheck = await checkExactRegistration(email, phone, childName);
            if (exactCheck.exists) {
                formMessages.removeClass('success').addClass('error');
                formMessages.text(exactCheck.message);
                $($childName).addClass(invalidCls);
            } else {
                formMessages.removeClass('error').addClass('success');
                formMessages.text('✅ All details are available for registration!');
                $($email).removeClass(invalidCls);
                $($number).removeClass(invalidCls);
                $($childName).removeClass(invalidCls);
            }
        }
    }

    // 🔹 UPDATED: Real-time validation events - only check for exact duplicates
    $(document).on('blur', $email, function() {
        // Only do basic format validation
        const email = $(this).val().trim();
        if (email && !email.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})$/)) {
            $(this).addClass(invalidCls);
            formMessages.removeClass('success').addClass('error');
            formMessages.text('❌ Please enter a valid email address.');
        } else {
            $(this).removeClass(invalidCls);
            // Clear message if it was about email format
            if (formMessages.text().includes('email address')) {
                formMessages.text('');
            }
            // Check exact registration if all fields are filled
            validateExactRegistration();
        }
    });

    $(document).on('blur', $number, function() {
        // Only do basic format validation
        const phone = $(this).val().trim();
        const cleanPhone = phone.replace(/\s+|[-+()]/g, '');
        if (cleanPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
            $(this).addClass(invalidCls);
            formMessages.removeClass('success').addClass('error');
            formMessages.text('❌ Please enter a valid 10-digit Indian phone number.');
        } else {
            $(this).removeClass(invalidCls);
            // Clear message if it was about phone format
            if (formMessages.text().includes('phone number')) {
                formMessages.text('');
            }
            // Check exact registration if all fields are filled
            validateExactRegistration();
        }
    });

    $(document).on('blur', $childName, function() {
        const childName = $(this).val().trim();
        if (!childName) {
            $(this).addClass(invalidCls);
            formMessages.removeClass('success').addClass('error');
            formMessages.text('❌ Please enter child name.');
        } else {
            $(this).removeClass(invalidCls);
            // Clear message if it was about child name being empty
            if (formMessages.text().includes('child name')) {
                formMessages.text('');
            }
            // Check exact registration if all fields are filled
            validateExactRegistration();
        }
    });

    // 🔹 NEW: Also validate when any field changes and all are filled
    $(document).on('input', $email + ', ' + $number + ', ' + $childName, function() {
        if (checkAllFieldsFilled()) {
            // Small delay to let user finish typing
            clearTimeout(window.validationTimeout);
            window.validationTimeout = setTimeout(validateExactRegistration, 500);
        } else {
            // Clear any previous success/error messages if not all fields are filled
            formMessages.removeClass('success error').text('');
            $($email).removeClass(invalidCls);
            $($number).removeClass(invalidCls);
            $($childName).removeClass(invalidCls);
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
                    
                    /* Available slots styling */
                    select[name="batch"] option:not(.full-slot):not(:disabled) {
                        color: #198754 !important;
                        font-weight: 500;
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
                    
                    /* Slot availability info */
                    .slot-info {
                        margin-top: 8px;
                        font-size: 14px;
                        color: #6c757d;
                        font-style: italic;
                    }
                </style>
            `);
        }
    }

    // 🔹 NEW: Add slot information display
    function addSlotInfoDisplay() {
        if (!$('.slot-info').length) {
            $($batch).after('<div class="slot-info"></div>');
        }
    }

    // Run once when page loads
    $(document).ready(function() {
        addCustomStyles();
        addSlotInfoDisplay();
        disableFullSlots();
        startSlotMonitoring(); // Start real-time monitoring
        
        console.log("Form handler initialized - with live slot availability");
    });

})(jQuery);
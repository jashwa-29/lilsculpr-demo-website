// Lil Sculpr Winter Carnival Workshop Registration - Complete Fixed Version
// Backend API Integration with Razorpay Payment for December 21-22, 2025
(function ($) {
    "use strict";

    // ==================== CONFIGURATION ====================
const RAZORPAY_KEY = "rzp_test_1DP5mmOlF5G5ag";

    const MATERIAL_PRICE_WITH = 499;
    const MATERIAL_PRICE_WITHOUT = 299;
    let currentWorkshopFee = MATERIAL_PRICE_WITH; // Default
    const BACKEND_API = 'http://127.0.0.1:5000/api/special-course'; // Localhost IP
    const CARNIVAL_NAME = "Republic Day Special Workshop �🇳";
    const AVAILABLE_DATES = ["2026-01-25", "2026-01-26"];
    
    // Default batch templates - UPDATED
    const BATCHES_JAN_25 = [
        "Special Offer Workshop 🎨 ⏰ 10:30 AM – 12:00 PM (Online Unlimited)"
    ];
    
    const BATCHES_JAN_26 = [
        "Special Offer Workshop 🎨 ⏰ 10:00 AM – 11:30 AM",
        "Special Offer Workshop 🎨 ⏰ 12:00 PM – 1:30 PM",
        "Special Offer Workshop 🎨 ⏰ 2:30 PM – 4:00 PM",
        "Special Offer Workshop 🎨 ⏰ 4:30 PM – 6:00 PM"
    ];

    // ==================== SELECTORS ====================
    const form = '.ajax-contact';
    const submitBtn = '.vs-btn[type="submit"]';
    const invalidCls = 'is-invalid';
    const $email = '[name="email"]';
    const $number = '[name="number"]';
    const $batch = '[name="batch"]';
    const $parentName = '[name="parent_name"]';
    const $childName = '[name="child_name"]';
    const $childAge = '[name="child_age"]';
    const $selectedDate = '[name="selectedDate"]';
    const $materialType = '#materialTypeHidden';
    const $carnivalName = '[name="carnivalName"]';
    const $paymentConfirm = '#payment-confirm';
    const $validation = '[name="parent_name"],[name="number"],[name="email"],[name="child_name"],[name="child_age"],[name="selectedDate"],[name="batch"]';
    let formMessages = $('.form-messages');
    let paymentStatus = $('#payment-status');

    // ==================== HELPER FUNCTIONS ====================

    // Add all custom styles with date and batch support
    function addCustomStyles() {
        if (!$('#custom-styles').length) {
            $('head').append(`
                <style id="custom-styles">
                    :root {
                        --saffron: #FF9933;
                        --white: #FFFFFF;
                        --green: #138808;
                        --navy: #000080;
                        --kid-purple: #9C29B2;
                        --kid-orange: #ff6b00;
                        --playful-font: "Baloo 2", cursive;
                    }

                    .appointment-form {
                        background: #ffffff;
                        padding: 25px 30px !important;
                        border-radius: 30px !important;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.1) !important;
                        position: relative;
                    }

                    .appointment-form::after {
                        content: '🎨';
                        position: absolute;
                        bottom: -15px;
                        right: -15px;
                        font-size: 40px;
                        transform: rotate(15deg);
                    }

                    .form-title, .sec-title, h3, h5, .breadcumb-title, .expect-title {
                        font-family: var(--playful-font) !important;
                        font-weight: 800 !important;
                    }

                    .form-group label {
                        font-family: var(--playful-font);
                        font-weight: 700;
                        color: #333;
                        margin-bottom: 5px;
                        display: block;
                        font-size: 16px;
                    }

                    .form-group .form-control, .form-group .form-select {
                        border: 3px solid #f1f5f9 !important;
                        border-radius: 15px !important;
                        padding-left: 15px !important;
                        height: 50px !important;
                        font-size: 15px !important;
                        transition: all 0.3s ease;
                        font-family: var(--playful-font);
                    }

                    .form-group .form-control:focus {
                        border-color: var(--kid-purple) !important;
                        box-shadow: 0 0 0 6px rgba(156, 41, 178, 0.1) !important;
                        transform: scale(1.02);
                    }

                    /* Date & Material Selection Playful Cards */
                    .date-selection, .material-selection {
                        display: flex;
                        gap: 12px;
                        margin-bottom: 15px;
                    }

                    .date-option, .material-option {
                        flex: 1;
                        min-width: 100px;
                    }

                    .date-radio, .material-radio {
                        display: none;
                    }

                    .date-label, .material-label {
                        border: 3px solid #f1f5f9;
                        border-radius: 20px;
                        padding: 12px 10px;
                        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        background: #fff;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        cursor: pointer;
                        box-shadow: 0 4px 0 #f1f5f9;
                    }

                    .date-label:hover, .material-label:hover {
                        border-color: var(--kid-orange);
                        transform: translateY(-5px);
                        box-shadow: 0 10px 0 rgba(255, 107, 0, 0.1);
                    }

                    .date-radio:checked + .date-label {
                        border-color: var(--green) !important;
                        background: #f0fff4 !important;
                        box-shadow: 0 8px 0 rgba(19, 136, 8, 0.2) !important;
                        transform: scale(1.05);
                    }

                    .material-radio:checked + .material-label {
                        border-color: var(--saffron) !important;
                        background: #fffaf0 !important;
                        box-shadow: 0 8px 0 rgba(255, 153, 51, 0.2) !important;
                        transform: scale(1.05);
                    }

                    .date-number { font-size: 24px; font-weight: 800; color: #1e293b; line-height: 1.2; font-family: var(--playful-font); }
                    .date-day, .date-month { font-size: 12px; font-weight: 700; color: #64748b; font-family: var(--playful-font); }

                    .material-name { font-size: 12px; font-weight: 700; color: #64748b; font-family: var(--playful-font); }
                    .material-price { font-size: 22px; font-weight: 800; color: #1e293b; line-height: 1.2; font-family: var(--playful-font); }


                    /* Right Side Redesign Styles - Kid Friendly */
                    .workshop-highlights-card {
                        background: #fff;
                        border-radius: 40px;
                        padding: 35px;
                        border: 4px dashed #e2e8f0;
                        position: relative;
                        overflow: visible; /* To allow floating icons to pop out */
                    }

                    .workshop-highlights-card::before {
                        content: '✨';
                        position: absolute;
                        top: -20px;
                        left: -20px;
                        font-size: 40px;
                    }

                    .feature-list {
                        list-style: none;
                        padding: 0;
                        margin: 25px 0 0;
                    }

                    .feature-item {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 20px;
                        transition: transform 0.3s ease;
                    }

                    .feature-item:hover {
                        transform: translateX(10px);
                    }

                    .feature-icon-box {
                        width: 55px; height: 55px;
                        background: #fff;
                        border-radius: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 6px 0 #f1f5f9;
                        flex-shrink: 0;
                        font-size: 22px;
                        border: 3px solid #f1f5f9;
                    }

                    .feature-text h5 {
                        font-family: var(--playful-font);
                        font-size: 18px;
                        font-weight: 800;
                        margin-bottom: 2px;
                        color: #1e293b;
                    }

                    .feature-text p {
                        font-size: 14px;
                        color: #64748b;
                        margin-bottom: 0;
                        line-height: 1.3;
                    }

                    .info-tag {
                        display: inline-flex;
                        align-items: center;
                        padding: 8px 16px;
                        background: #fff;
                        border-radius: 50px;
                        font-size: 13px;
                        font-weight: 800;
                        border: 2px solid #f1f5f9;
                        color: #475569;
                        margin-right: 8px;
                        margin-bottom: 8px;
                        font-family: var(--playful-font);
                        box-shadow: 0 4px 0 #f1f5f9;
                    }

                    .info-tag i { color: var(--kid-purple); margin-right: 8px; }

                    .what-to-expect {
                        background: #fef5ff;
                        border-radius: 25px;
                        padding: 22px;
                        margin-top: 25px;
                        border: 3px solid #fce7ff;
                    }

                    .expect-title {
                        font-size: 15px;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: var(--kid-purple);
                        margin-bottom: 12px;
                        display: block;
                        font-family: var(--playful-font);
                    }

                    .expect-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }

                    .expect-item {
                        font-size: 14px;
                        color: #475569;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        font-family: var(--playful-font);
                        font-weight: 700;
                    }

                    .expect-item::before {
                        content: '⭐';
                        margin-right: 12px;
                        font-size: 14px;
                    }

                    /* Bouncy Animations for Kids Flow */
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-15px); }
                    }

                    @keyframes wiggle {
                        0%, 100% { transform: rotate(0deg); }
                        25% { transform: rotate(5deg); }
                        75% { transform: rotate(-5deg); }
                    }

                    .bouncy { animation: bounce 3s ease-in-out infinite; }
                    .wiggle { animation: wiggle 2s ease-in-out infinite; }
                    
                    .shapePulse { animation: shapePulse 4s ease-in-out infinite; }
                    
                    @keyframes shapePulse {
                        0%, 100% { transform: scale(1) rotate(0deg); }
                        50% { transform: scale(1.1) rotate(10deg); }
                    }

                    /* Decorative Design Flow Elements */
                    .design-blob {
                        position: absolute;
                        z-index: -1;
                        filter: blur(60px);
                        opacity: 0.15;
                        border-radius: 50%;
                        pointer-events: none;
                    }

                    .blob-saffron { width: 300px; height: 300px; background: var(--saffron); top: -50px; left: -100px; }
                    .blob-green { width: 250px; height: 250px; background: var(--green); bottom: -50px; right: -50px; }

                    .glass-card {
                        backdrop-filter: blur(10px);
                        background: rgba(255, 255, 255, 0.8) !important;
                    }

                    .shape-mockup {
                        position: absolute;
                        pointer-events: none;
                        display: block;
                    }

                    .shapePulse {
                        animation: shapePulse 4s ease-in-out infinite;
                    }

                    @keyframes shapePulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }

                    .rotate {
                        animation: rotate 20s linear infinite;
                    }

                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    .slidetopleft {
                        animation: slidetopleft 10s ease-in-out infinite;
                    }

                    @keyframes slidetopleft {
                        0%, 100% { transform: translate(0, 0); }
                        50% { transform: translate(-20px, -20px); }
                    }

                    .section-divider {
                        position: absolute;
                        left: 0;
                        width: 100%;
                        line-height: 0;
                        z-index: 1;
                    }

                    .divider-top { top: 0; height: 25px; transform: rotate(180deg); }
                    .divider-bottom { bottom: 0; height: 40px; }
                    
                    /* Patriotic Accent Border */
                    .patriotic-border {
                        height: 4px;
                        width: 100%;
                        background: linear-gradient(to right, var(--saffron) 33.33%, #fff 33.33%, #fff 66.66%, var(--green) 66.66%);
                        border-radius: 2px;
                        margin-bottom: 20px;
                    }

                    @media (max-width: 768px) {
                        .design-blob { opacity: 0.08; }
                        .workshop-highlights-card { padding: 25px; }
                        .feature-item { margin-bottom: 15px; }
                    }

                    #payment-loading {
                        background: rgba(15, 23, 42, 0.8);
                        backdrop-filter: blur(8px);
                        display: none;
                        position: fixed;
                        top: 0; left: 0; width: 100%; height: 100%;
                        z-index: 99999;
                        justify-content: center;
                        align-items: center;
                    }

                    .payment-loading-content {
                        border-radius: 24px;
                        padding: 50px 40px;
                        background: #fff;
                        color: #1e293b;
                        text-align: center;
                    }

                    .payment-spinner {
                        width: 60px; height: 60px;
                        border: 6px solid #f1f5f9;
                        border-top: 6px solid var(--saffron);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }

                    @keyframes spin { to { transform: rotate(360deg); } }

                    @media (max-width: 768px) {
                        .date-selection { flex-wrap: wrap; }
                        .material-selection { flex-direction: column; }
                    }
                </style>
            `);
        }
    }

    // Show loader in button
    function showButtonLoader(text = 'Processing...') {
        const $submitBtn = $(submitBtn);
        $submitBtn.prop('disabled', true);
        const $btnText = $submitBtn.find('.btn-text');
        const $btnLoader = $submitBtn.find('.button-loader');
        
        if ($btnText.length && $btnLoader.length) {
            $btnText.hide();
            $btnLoader.show();
        } else {
            $submitBtn.html(`<span class="button-loader"></span> ${text}`);
        }
    }

    // Hide loader and restore button text
    function hideButtonLoader() {
        const $submitBtn = $(submitBtn);
        $submitBtn.prop('disabled', false);
        const $btnText = $submitBtn.find('.btn-text');
        const $btnLoader = $submitBtn.find('.button-loader');
        
        if ($btnText.length && $btnLoader.length) {
            $btnText.show();
            $btnLoader.hide();
        } else {
            $submitBtn.text(`Pay ₹${currentWorkshopFee} & Confirm Registration`);
        }
    }

    // Show payment loading overlay
    function showPaymentLoading(show = true, message = 'Processing Payment...') {
        const loader = $('#payment-loading');
        if (loader.length) {
            if (show) {
                loader.find('h4').text(message);
                loader.css('display', 'flex');
            } else {
                loader.css('display', 'none');
            }
        }
    }

    // Show payment status message
    function showPaymentStatus(message, type = 'success', duration = 10000) {
        if (paymentStatus.length) {
            paymentStatus.text(message);
            paymentStatus.removeClass('payment-success payment-error payment-processing');
            paymentStatus.addClass(`payment-${type}`);
            paymentStatus.fadeIn(300);
            
            if (duration > 0) {
                setTimeout(() => {
                    paymentStatus.fadeOut(300);
                }, duration);
            }
        }
    }

    // Format phone number
    function formatPhoneNumber(phone) {
        return phone.replace(/\s+|[-+()]/g, '');
    }

    // Validate email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number (India)
    function isValidPhone(phone) {
        const cleanPhone = formatPhoneNumber(phone);
        return /^[6-9]\d{9}$/.test(cleanPhone);
    }

    // Extract time from batch string
    function extractBatchTime(batchString) {
        const match = batchString.match(/⏰\s*(.+)/);
        return match ? match[1] : batchString;
    }

    // ==================== API FUNCTIONS ====================

    // Get slot availability for specific date and batch
    async function getSlotAvailability(carnivalName, batchName, selectedDate) {
        try {
            const apiUrl = `${BACKEND_API}/check-slots`.trim();
            const response = await axios.get(apiUrl, {
                params: { 
                    carnivalName: carnivalName.trim(),
                    batch: batchName.trim(),
                    date: selectedDate.trim(),
                    _t: Date.now()
                }
            });
            if (response.data.success) return response.data.data;
            throw new Error(response.data.message || 'Failed to check slots');
        } catch (error) {
            console.error('❌ Slot availability error:', error);
            return { availableSlots: 15, isFull: false, capacity: 15, status: 'available' };
        }
    }

    // Get all batches for a specific date
    async function getBatchesForDate(selectedDate) {
        try {
            const batchesToLoad = selectedDate === "2026-01-25" ? BATCHES_JAN_25 : BATCHES_JAN_26;
            const batchResults = [];
            for (const batch of batchesToLoad) {
                const isOnline = batch.includes('Online Unlimited');
                const slotInfo = await getSlotAvailability(CARNIVAL_NAME, batch, selectedDate);
                batchResults.push({
                    name: batch,
                    displayName: extractBatchTime(batch) + (isOnline ? ' (Online)' : ''),
                    availableSlots: isOnline ? 999 : (slotInfo.availableSlots || 15),
                    isFull: isOnline ? false : (slotInfo.isFull || false),
                });
            }
            return batchResults;
        } catch (error) {
            console.error('❌ Batch fetch error:', error.message);
            const batchesToLoad = selectedDate === "2026-01-25" ? BATCHES_JAN_25 : BATCHES_JAN_26;
            return batchesToLoad.map(batch => ({
                name: batch, displayName: extractBatchTime(batch), availableSlots: 15, isFull: false
            }));
        }
    }

    // Check duplicate registration with date - FIXED VERSION
    async function checkDuplicateRegistration(carnivalName, email, phone, childName, selectedDate) {
        try {
            console.log(`🔍 Checking duplicate for ${childName} on ${selectedDate}`);
            
            const response = await axios.post(`${BACKEND_API}/check-duplicate`.trim(), {
                carnivalName: carnivalName,
                email: email.trim(),
                phone: formatPhoneNumber(phone),
                childName: childName.trim(),
                selectedDate: selectedDate
            });
            
            if (response.data.success) {
                console.log(`✅ Duplicate check completed: ${response.data.exists ? 'Found' : 'Not found'}`);
                return response.data;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('❌ Duplicate check error:', error);
            return { 
                success: false, 
                exists: false,
                error: error.message
            };
        }
    }

    // Save registration to backend - FIXED VERSION
    async function saveRegistration(formData) {
        try {
            console.log('📝 Saving registration:', formData);
            
            const response = await axios.post(`${BACKEND_API}/register`.trim(), {
                carnivalName: formData.carnivalName,
                parentName: formData.parentName,
                email: formData.email,
                phone: formData.phone,
                childName: formData.childName,
                childAge: formData.childAge,
                selectedBatch: formData.batch,
                selectedDate: formData.selectedDate,
                availableDates: AVAILABLE_DATES,
                materialType: formData.materialType
            });

            console.log('✅ Registration saved successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Registration save error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }

    // Verify payment with backend - FIXED VERSION
    async function verifyPaymentWithBackend(paymentResponse, registrationId, additionalDetails = {}) {
        try {
            console.log(`💰 Verifying payment for ${registrationId}`);
            
            const response = await axios.post(`${BACKEND_API}/verify-payment`.trim(), {
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id || 'direct_payment',
                razorpay_signature: paymentResponse.razorpay_signature || 'direct_payment',
                registrationId: registrationId,
                paymentDetails: {
                    method: paymentResponse.method || 'card',
                    bank: paymentResponse.bank || '',
                    wallet: paymentResponse.wallet || '',
                    vpa: paymentResponse.vpa || '',
                    ...additionalDetails
                }
            });

            console.log('✅ Payment verified by backend:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Payment verification error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }

    // ==================== DATE & BATCH MANAGEMENT ====================

    // Load batches for selected date - FIXED VERSION
    async function loadBatchesForDate(selectedDate) {
        const $batchSelect = $($batch);
        const $dateError = $('#date-error');
        
        console.log(`🔄 Loading batches for date: ${selectedDate}`);
        
        // Clear batch selection
        $batchSelect.html('');
        $('#batch-summary').slideUp(300);
        $batchSelect.prop('disabled', true);
        
        // Show loading
        $batchSelect.html('<option value="" disabled selected>Loading available time slots...</option>');
        
        try {
            // Get batches for selected date
            const batches = await getBatchesForDate(selectedDate);
            
            console.log(`📊 Received ${batches.length} batches`);
            
            // Clear and prepare dropdown
            $batchSelect.html('<option value="" disabled selected>Select a time slot</option>');
            
            if (batches.length === 0) {
                $batchSelect.append('<option value="" disabled>No slots available for this date</option>');
                $dateError.text('No time slots available for this date.').show();
                return;
            }
            
            // Track if we have any available batches
            let hasAvailableBatches = false;
            
            // Add each batch option
            batches.forEach((batchInfo) => {
                const option = createBatchOption(batchInfo);
                $batchSelect.append(option);
                
                if (!batchInfo.isFull && batchInfo.availableSlots > 0) {
                    hasAvailableBatches = true;
                }
            });
            
            // Enable dropdown if there are available batches
            if (hasAvailableBatches) {
                $batchSelect.prop('disabled', false);
                $dateError.hide();
                
                // Update date selection styling
                $(`.date-option[data-date="${selectedDate}"]`).removeClass('invalid').addClass('valid');
                
                console.log(`✅ Loaded ${batches.length} batches for ${selectedDate}, dropdown ENABLED`);
            } else {
                // No available batches
                $batchSelect.html('<option value="" disabled selected>All slots are full for this date</option>');
                $dateError.text('All batches are full for this date. Please select another date.').show();
                $(`.date-option[data-date="${selectedDate}"]`).addClass('invalid');
                console.log('❌ No available batches for this date');
            }
            
        } catch (error) {
            console.error('❌ Error loading batches:', error);
            $batchSelect.html('<option value="" disabled selected>Error loading slots. Please try again.</option>');
            $dateError.text('Unable to load time slots. Please try again.').show();
        }
    }

    // Create batch option - FIXED: Show full text "only X slots available"
    function createBatchOption(batchInfo) {
        const option = $('<option></option>');
        
        // Use the full batch string as value and display extracted time
        const displayTime = extractBatchTime(batchInfo.name);
        const batchValue = batchInfo.name; // Full string like "Winter Carnival Workshop 🎄 ⏰ 10:00 AM – 11:30 AM"
        
        // Determine status
        const isFull = batchInfo.isFull || false;
        const availableSlots = batchInfo.availableSlots || 0;
        
        // Create option text with slot information
        let optionText = displayTime;
        let statusClass = '';
        let slotBadge = '';
        
        if (isFull) {
            optionText += ' (Full)';
            statusClass = 'full';
            slotBadge = `<span class="slot-badge slot-full">Full</span>`;
        } else if (availableSlots <= 3) {
            // FIXED: Show "only X left" 
            optionText += ` (only ${availableSlots} left)`;
            statusClass = 'limited';
            slotBadge = `<span class="slot-badge slot-limited">only ${availableSlots} left</span>`;
        } else {
            // FIXED: Show "only X slots available"
            optionText += ` (${availableSlots} available)`;
            statusClass = 'available';
            slotBadge = `<span class="slot-badge slot-available">only ${availableSlots} available</span>`;
        }
        
        // Set option properties
        option.val(batchValue);
        option.html(`${displayTime} ${slotBadge}`);
        option.addClass(`batch-option ${statusClass}`);
        option.data('slots', availableSlots);
        option.data('isFull', isFull);
        option.data('batchTime', displayTime);
        option.data('capacity', batchInfo.capacity || 15);
        
        if (isFull) {
            option.prop('disabled', true);
        }
        
        return option;
    }

    // Update batch summary display
    function updateBatchSummary() {
        const $batchSelect = $($batch);
        const selectedOption = $batchSelect.find('option:selected');
        const $batchError = $('#batch-error');
        
        if (!selectedOption.val() || selectedOption.prop('disabled')) {
            $('#batch-summary').slideUp(300);
            $batchError.hide();
            return;
        }
        
        const slots = selectedOption.data('slots') || 0;
        const isFull = selectedOption.data('isFull') || false;
        const batchTime = selectedOption.data('batchTime') || extractBatchTime(selectedOption.val());
        const selectedDate = $($selectedDate + ':checked').val();
        
        if (isFull) {
            $batchError.text('This batch is full. Please select another time slot.').show();
            $('#batch-summary').slideUp(300);
            return;
        }
        
        $batchError.hide();
        
        const summaryDiv = $('#batch-summary');
        let slotsClass = '';
        let slotsIcon = '';
        let slotsText = '';
        
        if (isFull) {
            slotsClass = 'slots-full';
            slotsIcon = '❌';
            slotsText = 'No slots available';
        } else if (slots <= 3) {
            slotsClass = 'slots-limited';
            slotsIcon = '⚠️';
            slotsText = `only ${slots} slot${slots !== 1 ? 's' : ''} left - Hurry!`;
        } else {
            slotsClass = 'slots-available';
            slotsIcon = '✅';
            slotsText = `only ${slots} slot${slots !== 1 ? 's' : ''} available`;
        }
        
        const dateObj = new Date(selectedDate);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        summaryDiv.html(`
            <span class="batch-selected">
                <i class="fas fa-calendar-day me-2"></i> ${formattedDate}
            </span>
            <span class="batch-slots-info ${slotsClass}">
                <span class="slots-icon">${slotsIcon}</span>
                <span class="slots-count">${batchTime} • ${slotsText}</span>
            </span>
        `).slideDown(300);
    }

    // Initialize date selection
    function initializeDateSelection() {
        console.log('📅 Initializing date selection...');
        
        // Handle date selection
        $($selectedDate).on('change', async function() {
            const selectedDate = $(this).val();
            console.log(`📅 Date selected: ${selectedDate}`);
            
            if (!selectedDate) {
                console.log('⚠️ No date selected');
                return;
            }

            // Update price based on date: Jan 25 is Online (299), Jan 26 is Offline (499)
            const isOnlineDate = selectedDate === "2026-01-25";
            currentWorkshopFee = isOnlineDate ? MATERIAL_PRICE_WITHOUT : MATERIAL_PRICE_WITH;
            const hasMaterial = !isOnlineDate;
            
            // Update hidden material type
            $($materialType).val(hasMaterial.toString());
            
            console.log(`💰 Date-based pricing: ${selectedDate} -> ₹${currentWorkshopFee} (${hasMaterial ? 'With' : 'Without'} Material)`);

            // Update UI elements with new price
            updatePriceDisplay();
            
            // Show loading for batches
            await loadBatchesForDate(selectedDate);
            
            // Update validation
            $(this).removeClass(invalidCls).addClass('is-valid');
            $('#date-error').hide();
            
            console.log('✅ Date selection completed');
        });
        
        // Handle batch selection change
        $(document).on('change', $batch, function() {
            console.log('🔄 Batch selection changed');
            updateBatchSummary();
        });
        
        console.log('✅ Date selection initialized');
    }

    // Update all price-related UI elements
    function updatePriceDisplay() {
        // Update button text
        const $submitBtn = $(submitBtn);
        const $btnText = $submitBtn.find('.btn-text');
        const priceText = `Pay ₹${currentWorkshopFee} & Confirm Registration`;
        
        if ($btnText.length) {
            $btnText.text(priceText);
        } else {
            $submitBtn.text(priceText);
        }
        
        // Update payment confirmation description
        const $confirmLabel = $('label[for="payment-confirm"]');
        if ($confirmLabel.length) {
            $confirmLabel.text(`I understand that ₹${currentWorkshopFee} payment is required to confirm my registration.`);
        }
    }

    // Material selection is now automated based on date
    function initializeMaterialSelection() {
        console.log('🎨 Material selection is now automated based on date.');
        updatePriceDisplay();
    }

    // ==================== VALIDATION FUNCTIONS ====================

    // Enhanced validation function with date support
    function validateContact() {
        let valid = true;
        formMessages.removeClass('success error processing').text('');
        
        console.log('🔍 Starting form validation...');
        
        // Validate all required fields
        $($validation).each(function() {
            const $element = $(this);
            const value = $element.val() ? $element.val().trim() : '';
            
            if ($element.is('select')) {
                if (!value || value === "") {
                    $element.addClass(invalidCls);
                    valid = false;
                    console.log(`❌ Select field empty: ${$element.attr('name')}`);
                } else {
                    $element.removeClass(invalidCls).addClass('is-valid');
                }
            } else if ($element.is('input[type="radio"]')) {
                const name = $element.attr('name');
                const isChecked = $(`input[name="${name}"]:checked`).length > 0;
                if (!isChecked) {
                    if (name === 'selectedDate') {
                        $('#date-error').text('Please select a workshop date').show();
                    }
                    $element.closest('.date-selection, .material-selection').addClass('is-invalid');
                    valid = false;
                    console.log(`❌ No radio selected for ${name}`);
                } else {
                    if (name === 'selectedDate') {
                        $('#date-error').hide();
                    }
                    $element.closest('.date-selection, .material-selection').removeClass('is-invalid');
                }
            } else if (!value) {
                $element.addClass(invalidCls);
                valid = false;
                console.log(`❌ Field empty: ${$element.attr('name')}`);
            } else {
                $element.removeClass(invalidCls).addClass('is-valid');
            }
        });

        // Email validation
        const emailVal = $($email).val().trim();
        if (!isValidEmail(emailVal)) {
            $($email).addClass(invalidCls);
            valid = false;
            console.log('❌ Invalid email');
        } else {
            $($email).removeClass(invalidCls).addClass('is-valid');
        }

        // Phone validation
        const phoneVal = $($number).val().trim();
        if (!isValidPhone(phoneVal)) {
            $($number).addClass(invalidCls);
            valid = false;
            console.log('❌ Invalid phone');
        } else {
            $($number).removeClass(invalidCls).addClass('is-valid');
        }

        // Child age validation
        const childAgeVal = $($childAge).val().trim();
        if (childAgeVal) {
            const age = parseInt(childAgeVal);
            if (isNaN(age) || age < 3 || age > 16) {
                $($childAge).addClass(invalidCls);
                formMessages.addClass('error').text('Child age must be between 3 and 16 years');
                valid = false;
                console.log('❌ Invalid age');
            } else {
                $($childAge).removeClass(invalidCls).addClass('is-valid');
            }
        }

        // Check if date is selected
        const selectedDate = $($selectedDate + ':checked').val();
        if (!selectedDate) {
            $('#date-error').text('Please select a workshop date').show();
            valid = false;
            console.log('❌ No date selected');
        }

        // Check if batch is selected and available
        const selectedBatch = $($batch).val();
        const isBatchFull = $($batch).find('option:selected').data('isFull');
        if (!selectedBatch) {
            $('#batch-error').text('Please select a time slot').show();
            valid = false;
            console.log('❌ No batch selected');
        } else if (isBatchFull) {
            $('#batch-error').text('Selected time slot is full. Please choose another.').show();
            valid = false;
            console.log('❌ Batch is full');
        }

        // Check payment confirmation checkbox
        const paymentCheckbox = $($paymentConfirm);
        if (paymentCheckbox.length && !paymentCheckbox.is(':checked')) {
            formMessages.addClass('error').text('Please confirm the payment terms to proceed.');
            valid = false;
            console.log('❌ Payment not confirmed');
        }

        console.log(`✅ Form validation ${valid ? 'passed' : 'failed'}`);
        return valid;
    }

    // Real-time field validation
    function setupRealTimeValidation() {
        console.log('🔧 Setting up real-time validation...');
        
        // Email validation on blur
        $(document).on('blur', $email, function() {
            const email = $(this).val().trim();
            if (email && !isValidEmail(email)) {
                $(this).addClass(invalidCls);
                formMessages.addClass('error').text('Please enter a valid email address.');
            } else if (email) {
                $(this).removeClass(invalidCls).addClass('is-valid');
                if (formMessages.text().includes('email')) formMessages.text('');
            }
        });

        // Phone validation on blur
        $(document).on('blur', $number, function() {
            const phone = $(this).val().trim();
            if (phone && !isValidPhone(phone)) {
                $(this).addClass(invalidCls);
                formMessages.addClass('error').text('Please enter a valid 10-digit Indian phone number.');
            } else if (phone) {
                $(this).removeClass(invalidCls).addClass('is-valid');
                if (formMessages.text().includes('phone')) formMessages.text('');
            }
        });

        // Real-time duplicate checking with date
        let validationTimeout;
        $(document).on('input', $email + ', ' + $number + ', ' + $childName, function() {
            const email = $($email).val().trim();
            const phone = $($number).val().trim();
            const childName = $($childName).val().trim();
            const selectedDate = $($selectedDate + ':checked').val();
            
            if (email && phone && childName && selectedDate && isValidEmail(email) && isValidPhone(phone)) {
                clearTimeout(validationTimeout);
                validationTimeout = setTimeout(async () => {
                    formMessages.removeClass('error success').addClass('processing')
                        .text('Checking for existing registration...');
                    
                    const duplicateCheck = await checkDuplicateRegistration(
                        CARNIVAL_NAME, 
                        email, 
                        phone, 
                        childName, 
                        selectedDate
                    );
                    
                    if (duplicateCheck.exists) {
                        formMessages.removeClass('processing').addClass('error')
                            .text(duplicateCheck.message);
                        $($childName).addClass(invalidCls);
                    } else {
                        formMessages.removeClass('processing error').addClass('success')
                            .text('✅ All details are available for registration!');
                        $($email).removeClass(invalidCls).addClass('is-valid');
                        $($number).removeClass(invalidCls).addClass('is-valid');
                        $($childName).removeClass(invalidCls).addClass('is-valid');
                    }
                }, 800);
            }
        });

        console.log('✅ Real-time validation setup complete');
    }

    // ==================== PAYMENT FUNCTIONS ====================

    // Initialize Razorpay payment
    function initializeRazorpayPayment(registrationData) {
        console.log('💰 Initializing Razorpay payment...');
        
        showPaymentLoading(true, 'Opening payment gateway...');
        showPaymentStatus('Redirecting to secure payment...', 'processing');

        try {
            // Check if Razorpay is loaded
            if (typeof Razorpay === 'undefined') {
                throw new Error('Payment gateway not available. Please refresh the page.');
            }

            // Format date for display
            const dateObj = new Date(registrationData.selectedDate);
            const formattedDate = dateObj.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const options = {
                "key": RAZORPAY_KEY,
                "amount": currentWorkshopFee * 100,
                "currency": "INR",
                "name": "Lil Sculpr Clay Academy",
                "description": `Winter Carnival Workshop - ${formattedDate}`,
                "image": "https://lilsculpr.com/assets/img/Final%20Logo.png",
                "handler": async function (response) {
                    console.log('✅ Payment successful, response:', response);
                    await handlePaymentSuccess(response, registrationData);
                },
                "prefill": {
                    "name": registrationData.parentName,
                    "email": registrationData.email,
                    "contact": registrationData.phone
                },
                "notes": {
                    "child_name": registrationData.childName,
                    "child_age": registrationData.childAge,
                    "batch": registrationData.batch,
                    "date": registrationData.selectedDate,
                    "registration_id": registrationData.registrationId,
                    "workshop": CARNIVAL_NAME
                },
                "theme": {
                    "color": "#3498db"
                },
                "modal": {
                    "ondismiss": function() {
                        console.log('⚠️ Payment modal dismissed');
                        showPaymentLoading(false);
                        showPaymentStatus('Payment cancelled. You can try again.', 'error');
                        hideButtonLoader();
                    },
                    "escape": false,
                    "backdrop_close": false
                },
                "remember_customer": true,
                "retry": {
                    "enabled": true,
                    "max_count": 2
                }
            };

            const rzp = new Razorpay(options);
            
            // Add event listeners for better UX
            rzp.on('payment.failed', function(response) {
                console.error('❌ Payment failed:', response.error);
                showPaymentLoading(false);
                showPaymentStatus(`Payment failed: ${response.error.description || 'Unknown error'}`, 'error', 15000);
                
                formMessages.html(`
                    <div class="error-message">
                        <div class="mb-3" style="font-size: 50px; color: #dc3545;">❌</div>
                        <p class="mb-2" style="font-size: 18px; color: #721c24; font-weight: 500;">Payment Failed</p>
                        <p class="mb-3" style="color: #6c757d;">${response.error.description || 'Payment processing failed'}</p>
                        <div class="mt-4">
                            <button onclick="location.reload()" class="btn btn-outline-primary px-4">
                                Try Again
                            </button>
                        </div>
                    </div>
                `).removeClass('success').addClass('error');
            });

            // Open payment modal
            rzp.open();
            
            console.log('✅ Razorpay payment initialized');

        } catch (error) {
            console.error('❌ Razorpay initialization error:', error);
            showPaymentLoading(false);
            showPaymentStatus('❌ ' + error.message, 'error', 10000);
            hideButtonLoader();
            
            formMessages.html(`
                <div class="error-message">
                    <div class="mb-3" style="font-size: 50px; color: #dc3545;">❌</div>
                    <p class="mb-2" style="font-size: 18px; color: #721c24; font-weight: 500;">Payment System Error</p>
                    <p class="mb-3" style="color: #6c757d;">${error.message}</p>
                    <div class="mt-4">
                        <button onclick="location.reload()" class="btn btn-outline-primary px-4">
                            Refresh Page
                        </button>
                    </div>
                </div>
            `).removeClass('success').addClass('error');
        }
    }

    // Handle successful payment
    async function handlePaymentSuccess(paymentResponse, registrationData) {
        console.log('🔍 Handling payment success...');
        
        showPaymentLoading(true, 'Verifying payment...');
        showPaymentStatus('Confirming your payment...', 'processing');

        try {
            // Verify payment with backend
            const verificationResult = await verifyPaymentWithBackend(paymentResponse, registrationData.registrationId);

            if (verificationResult.success) {
                // SUCCESS - Payment verified and email sent
                showPaymentLoading(false);
                showPaymentStatus('✅ Payment successful! Registration confirmed.', 'success', 5000);
                
                // Show success message
                showRegistrationSuccess(registrationData, paymentResponse, verificationResult.data);
                
                // Update batch availability for selected date
                await loadBatchesForDate(registrationData.selectedDate);
                
                console.log('🎉 Registration completed successfully');
                
            } else {
                throw new Error(verificationResult.message || 'Payment verification failed');
            }
            
        } catch (error) {
            console.error('❌ Payment processing error:', error);
            showPaymentLoading(false);
            
            // Payment succeeded but backend verification failed
            showPaymentStatus('⚠️ Payment succeeded but confirmation pending.', 'processing', 15000);
            
            formMessages.html(`
                <div class="error-message">
                    <div class="mb-3" style="font-size: 50px; color: #ffc107;">⚠️</div>
                    <p class="mb-2" style="font-size: 18px; color: #856404; font-weight: 500;">Payment Received - Confirmation Pending</p>
                    <p class="mb-3" style="color: #6c757d;">Your payment was received but system confirmation is pending.</p>
                    <p class="mb-3" style="color: #6c757d; font-size: 14px;">Please contact support with your payment ID.</p>
                    <div class="mt-4">
                        <button onclick="location.reload()" class="btn btn-outline-primary px-4">
                            Try Again
                        </button>
                    </div>
                </div>
            `).removeClass('success error').addClass('processing');
        }
    }

    // Show registration success - SIMPLIFIED VERSION
    function showRegistrationSuccess(registrationData, paymentResponse, backendData) {
        console.log('🎉 Showing registration success...');
        
        // Reset form
        $('#contactForm')[0].reset();
        
        // Remove validation classes
        $($validation).removeClass('is-valid is-invalid');
        
        // Hide batch summary
        $('#batch-summary').slideUp(300);
        
        // Enable batch select
        $($batch).prop('disabled', true);
        
        const successHTML = `
            <div class="success-message">
                <div class="mb-3" style="font-size: 50px; color: #28a745;">✅</div>
                <p class="mb-2" style="font-size: 18px; color: #28a745; font-weight: 500;">Payment Successful!</p>
                <p class="mb-3" style="color: #6c757d;">Registration details will be sent to your email.</p>
                <div class="mt-4">
                    <button onclick="location.reload()" class="btn btn-primary px-4">
                        Register Another Child
                    </button>
                </div>
            </div>
        `;
        
        formMessages.html(successHTML).removeClass('error processing').addClass('success');
        
        // Scroll to success message
        $('html, body').animate({
            scrollTop: formMessages.offset().top - 100
        }, 1000);
        
        console.log('✅ Success message displayed');
    }

    // ==================== MAIN FORM SUBMIT HANDLER ====================

    $(document).on('submit', form, async function (element) {
        element.preventDefault();
        console.log('🚀 Form submission started');

        // Validate form
        if (!validateContact()) {
            showPaymentStatus('Please fix the errors in the form.', 'error', 5000);
            return false;
        }

        // Show loading
        showButtonLoader();
        formMessages.removeClass('error success').addClass('processing')
            .text('Checking availability and processing registration...');

        // Collect form data
        const formData = {
            carnivalName: CARNIVAL_NAME,
            parentName: $($parentName).val().trim(),
            email: $($email).val().trim(),
            phone: $($number).val().trim(),
            childName: $($childName).val().trim(),
            childAge: $($childAge).val().trim(),
            selectedDate: $($selectedDate + ':checked').val(),
            batch: $($batch).val().trim(),
            materialType: $($materialType).val() === 'true'
        };

        console.log('📋 Form data collected:', formData);

        try {
            // Step 1: Check duplicate with date
            formMessages.text('Checking for existing registration...');
            const duplicateCheck = await checkDuplicateRegistration(
                formData.carnivalName,
                formData.email, 
                formData.phone, 
                formData.childName,
                formData.selectedDate
            );
            
            if (duplicateCheck.exists) {
                throw new Error(duplicateCheck.message);
            }

            // Step 2: Check slot availability for selected batch and date
            formMessages.text('Checking slot availability...');
            const slotInfo = await getSlotAvailability(
                formData.carnivalName,
                formData.batch,
                formData.selectedDate
            );
            
            if (slotInfo.isFull) {
                throw new Error('❌ Sorry, this batch is completely full. Please select another time slot or date.');
            }

            // Step 3: Save registration to backend
            formMessages.text('Saving registration details...');
            const registrationResult = await saveRegistration(formData);
            
            if (!registrationResult.success) {
                throw new Error(registrationResult.message || 'Registration failed');
            }

            const registrationId = registrationResult.data.registrationId;
            
            // Success - ready for payment
            formMessages.removeClass('processing error').addClass('success')
                .html(`
                    <div style="text-align: center;">
                        <div style="font-size: 40px; color: #28a745; margin-bottom: 15px;">✅</div>
                        <p style="font-size: 16px; color: #155724; font-weight: 500;">Registration Saved Successfully!</p>
                        <p>Opening payment gateway...</p>
                    </div>
                `);
            
            hideButtonLoader();
            
            // Step 4: Initialize payment
            setTimeout(() => {
                initializeRazorpayPayment({
                    ...formData,
                    registrationId: registrationId
                });
            }, 1000);
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            formMessages.removeClass('success processing').addClass('error')
                .html(`
                    <div class="error-message">
                        <div class="mb-3" style="font-size: 50px; color: #dc3545;">❌</div>
                        <p class="mb-2" style="font-size: 18px; color: #721c24; font-weight: 500;">Registration Failed</p>
                        <p class="mb-3" style="color: #6c757d;">${error.response?.data?.message || error.message || 'Please try again.'}</p>
                        <div class="mt-4">
                            <button onclick="location.reload()" class="btn btn-outline-primary px-4">
                                Try Again
                            </button>
                        </div>
                    </div>
                `);
            
            showPaymentStatus('Registration failed. Please check the form.', 'error', 5000);
            hideButtonLoader();
        }
        
        return false;
    });

    // ==================== INITIALIZATION ====================

    // Create loading overlay
    function createLoadingOverlay() {
        if (!$('#payment-loading').length) {
            $('body').append(`
                <div id="payment-loading" class="payment-loading">
                    <div class="payment-loading-content">
                        <div class="payment-spinner"></div>
                        <h4>Processing Payment...</h4>
                        <p>Please wait while we process your payment.</p>
                        <p class="small mt-3">Do not close this window or refresh the page.</p>
                    </div>
                </div>
            `);
        }
    }

    // Create payment status element
    function createPaymentStatusElement() {
        if (!$('#payment-status').length) {
            $('#contactForm').before(`
                <div id="payment-status" class="payment-status" style="display: none;"></div>
            `);
            paymentStatus = $('#payment-status');
        }
    }

    // Initialize everything
    function initialize() {
        console.log('🎨 Initializing Lil Sculpr Registration Form...');
        console.log('🔗 Backend API:', BACKEND_API.trim()); // FIX: Trim the URL
        console.log('💰 Workshop Fee: ₹' + currentWorkshopFee);
        console.log('📅 Available Dates:', AVAILABLE_DATES.join(', '));

        // Add styles
        addCustomStyles();
        
        // Create required elements
        createLoadingOverlay();
        createPaymentStatusElement();
        
        // Check if axios is loaded
        if (typeof axios === 'undefined') {
            console.log('📦 Loading Axios...');
            $('head').append('<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>');
            // Wait for axios to load
            setTimeout(initialize, 1000);
            return;
        }
        
        // Check if Razorpay is loaded
        if (typeof Razorpay === 'undefined') {
            console.log('📦 Loading Razorpay SDK...');
            $('head').append('<script src="https://checkout.razorpay.com/v1/checkout.js"></script>');
            // Wait for Razorpay to load
            setTimeout(initialize, 1000);
            return;
        }

        // Setup real-time validation
        setupRealTimeValidation();
        
        // Initialize selections
        initializeDateSelection();
        initializeMaterialSelection();
        
        // Also initialize FontAwesome if needed
        if (typeof FontAwesome === 'undefined' && !$('link[href*="font-awesome"]').length) {
            console.log('📦 Loading FontAwesome...');
            $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">');
        }
        
        console.log('✅ Registration form initialized successfully');
        
        // Show welcome message
        setTimeout(() => {
            if ($(form).length) {
                formMessages.html(`
                    <div class="processing p-3 rounded">
                        <p style="color: #FF9933; font-size: 16px; font-weight: 500;"><i class="fas fa-flag mr-2"></i> Republic Day Special Workshop Registration</p>
                        <p><strong>📅 Workshop Dates:</strong> January 25-26, 2026</p>
                        <p>Fill in the details below to register your child for an exciting patriotic clay workshop experience!</p>
                        <div class="mt-3 p-3 bg-white border rounded" style="border-left: 5px solid #138808 !important;">
                            <i class="fas fa-landmark mr-2" style="color: #000080;"></i>
                            <strong>Republic Day Special:</strong> Guided Patriotic Themed Clay Modelling
                        </div>
                        <p class="mt-3 mb-0"><strong>Instructions:</strong></p>
                        <ol class="text-start small">
                            <li>Select your preferred workshop date</li>
                            <li>Choose an available time slot</li>
                            <li>Fill in child and parent details</li>
                            <li>Complete the registration fee payment (₹299 for Online / ₹499 for Offline)</li>
                        </ol>
                    </div>
                `).removeClass('error success').addClass('processing');
            }
        }, 1000);
    }

    // Start when document is ready
    $(document).ready(function() {
        console.log('📄 Document ready, starting initialization...');
        initialize();
    });

})(jQuery);
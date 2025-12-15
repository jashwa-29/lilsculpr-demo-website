// Lil Sculpr Winter Carnival Workshop Registration - Complete Fixed Version
// Backend API Integration with Razorpay Payment for December 21-22, 2025
(function ($) {
    "use strict";

    // ==================== CONFIGURATION ====================
    const RAZORPAY_KEY = "rzp_live_mTBnRikOBzrdpK";
    const WORKSHOP_FEE = 499;
    const BACKEND_API = 'http://localhost:5000/api/special-course'; // Change for production
    const CARNIVAL_NAME = "Winter Carnival Workshop 🎄";
    const AVAILABLE_DATES = ["2025-12-21", "2025-12-22"];
    
    // Default batch templates - FIXED FORMAT
    const DEFAULT_BATCHES = [
        "Winter Carnival Workshop 🎄 ⏰ 10:00 AM – 12:00 PM",
        "Winter Carnival Workshop 🎄 ⏰ 2:00 PM – 4:00 PM",
        "Winter Carnival Workshop 🎄 ⏰ 4:00 PM – 6:00 PM"
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
    const $message = '[name="message"]';
    const $selectedDate = '[name="selectedDate"]';
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
                    /* Date Selection Styles */
                    .date-selection {
                        display: flex;
                        gap: 12px;
                        margin-bottom: 15px;
                    }
                    
                    .date-option {
                        flex: 1;
                        min-width: 120px;
                    }
                    
                    .date-radio {
                        display: none;
                    }
                    
                    .date-label {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 15px;
                        border: 2px solid #dee2e6;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        background: white;
                        text-align: center;
                        min-height: 100px;
                        justify-content: center;
                    }
                    
                    .date-label:hover {
                        border-color: #3498db;
                        background: #f8f9fa;
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(52, 152, 219, 0.1);
                    }
                    
                    .date-radio:checked + .date-label {
                        border-color: #28a745;
                        background: linear-gradient(135deg, #f8fff9 0%, #e8f7ec 100%);
                        box-shadow: 0 8px 20px rgba(40, 167, 69, 0.15);
                    }
                    
                    .date-day {
                        font-size: 12px;
                        color: #6c757d;
                        text-transform: uppercase;
                        font-weight: 600;
                        margin-bottom: 5px;
                    }
                    
                    .date-number {
                        font-size: 28px;
                        font-weight: bold;
                        color: #2c3e50;
                        line-height: 1;
                        margin: 5px 0;
                    }
                    
                    .date-month {
                        font-size: 14px;
                        color: #495057;
                        font-weight: 500;
                    }
                    
                    /* Workshop dates info */
                    .workshop-dates-info {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 20px;
                        border-radius: 12px;
                        border-left: 4px solid #3498db;
                    }
                    
                    .date-list {
                        margin-top: 15px;
                    }
                    
                    .date-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 15px;
                        background: white;
                        border-radius: 8px;
                        margin-bottom: 8px;
                        border: 1px solid #dee2e6;
                    }
                    
                    .date-badge {
                        background: #e9ecef;
                        color: #495057;
                        padding: 4px 10px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        min-width: 70px;
                        text-align: center;
                    }
                    
                    /* Form validation styles */
                    .is-invalid {
                        border-color: #dc3545 !important;
                        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
                        background-repeat: no-repeat;
                        background-position: right calc(.375em + .1875rem) center;
                        background-size: calc(.75em + .375rem) calc(.75em + .375rem);
                    }
                    
                    .is-valid {
                        border-color: #198754 !important;
                    }
                    
                    /* Batch availability styles - ENHANCED */
                    select[name="batch"] {
                        font-size: 14px;
                        font-weight: 500;
                    }
                    
                    select[name="batch"]:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                    
                    .batch-option {
                        padding: 12px 15px;
                        display: block !important;
                        margin: 2px 0;
                        border-radius: 6px;
                        border-left: 3px solid transparent;
                    }
                    
                    .batch-option.available {
                        color: #155724;
                        background-color: #f8fff9;
                        border-left-color: #28a745;
                    }
                    
                    .batch-option.available:hover {
                        background-color: #e8f7ec;
                    }
                    
                    .batch-option.limited {
                        color: #856404;
                        background-color: #fff9e6;
                        border-left-color: #ffc107;
                    }
                    
                    .batch-option.limited:hover {
                        background-color: #fff3cc;
                    }
                    
                    .batch-option.full {
                        color: #721c24;
                        background-color: #fff5f5;
                        opacity: 0.7;
                        text-decoration: line-through;
                        border-left-color: #dc3545;
                    }
                    
                    .batch-option.full:hover {
                        background-color: #ffeaea;
                    }
                    
                    /* Slot count badge inside options - FIXED: Show full text */
                    .slot-badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 4px 10px;
                        border-radius: 15px;
                        font-size: 11px;
                        font-weight: bold;
                        min-width: 110px;
                        text-align: center;
                        justify-content: center;
                        margin-left: 10px;
                        float: right;
                    }
                    
                    .slot-available {
                        background-color: #d4edda;
                        color: #155724;
                        border: 1px solid #c3e6cb;
                    }
                    
                    .slot-limited {
                        background-color: #fff3cd;
                        color: #856404;
                        border: 1px solid #ffeaa7;
                    }
                    
                    .slot-full {
                        background-color: #f8d7da;
                        color: #721c24;
                        border: 1px solid #f5c6cb;
                    }
                    
                    .slot-count {
                        font-weight: 900;
                        margin-right: 3px;
                        font-size: 12px;
                    }
                    
                    .batch-time {
                        font-weight: 500;
                    }
                    
                    .batch-status {
                        font-size: 11px;
                        opacity: 0.8;
                        margin-left: 8px;
                    }
                    
                    /* Batch selection summary */
                    .batch-summary {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-top: 8px;
                        font-size: 13px;
                        padding: 10px 15px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border-left: 4px solid #6c757d;
                    }
                    
                    .batch-selected {
                        font-weight: 600;
                        color: #2c3e50;
                    }
                    
                    .batch-slots-info {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        font-size: 12px;
                    }
                    
                    .slots-icon {
                        font-size: 14px;
                    }
                    
                    .slots-count {
                        font-weight: bold;
                    }
                    
                    .slots-available {
                        color: #28a745;
                    }
                    
                    .slots-limited {
                        color: #ffc107;
                    }
                    
                    .slots-full {
                        color: #dc3545;
                    }
                    
                    /* Button loader */
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
                    
                    /* Form messages */
                    .form-messages {
                        margin: 15px 0;
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid transparent;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    
                    .form-messages.success {
                        background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                        color: #155724;
                        border-color: #b1d8b8;
                    }
                    
                    .form-messages.error {
                        background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
                        color: #721c24;
                        border-color: #f1b0b7;
                    }
                    
                    .form-messages.processing {
                        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                        color: #856404;
                        border-color: #ffe694;
                    }
                    
                    /* Payment status */
                    #payment-status {
                        display: none;
                        padding: 16px 20px;
                        border-radius: 12px;
                        margin: 20px 0;
                        font-weight: 500;
                        border: 1px solid transparent;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        animation: slideIn 0.3s ease-out;
                    }
                    
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    
                    .payment-success {
                        background: linear-gradient(135deg, #d4edda 0%, #b8e0c1 100%);
                        color: #155724;
                        border-color: #9cd3a7;
                        border-left: 5px solid #28a745;
                    }
                    
                    .payment-error {
                        background: linear-gradient(135deg, #f8d7da 0%, #f2b9c0 100%);
                        color: #721c24;
                        border-color: #ec9ca6;
                        border-left: 5px solid #dc3545;
                    }
                    
                    .payment-processing {
                        background: linear-gradient(135deg, #fff3cd 0%, #ffdf7e 100%);
                        color: #856404;
                        border-color: #ffd351;
                        border-left: 5px solid #ffc107;
                    }
                    
                    /* Simple message styles */
                    .success-message {
                        background: #f8fff9;
                        border-radius: 10px;
                        border: 2px solid #d4edda;
                        text-align: center;
                        padding: 30px 20px;
                    }
                    
                    .error-message {
                        background: #fff5f5;
                        border-radius: 10px;
                        border: 2px solid #f8d7da;
                        text-align: center;
                        padding: 30px 20px;
                    }
                    
                    .btn-primary {
                        background: #3498db;
                        border: none;
                        padding: 10px 25px;
                        border-radius: 5px;
                        font-weight: 500;
                        color: white;
                        transition: all 0.3s ease;
                    }
                    
                    .btn-primary:hover {
                        background: #2980b9;
                        color: white;
                    }
                    
                    .btn-outline-primary {
                        background: transparent;
                        border: 2px solid #3498db;
                        color: #3498db;
                        padding: 10px 25px;
                        border-radius: 5px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    }
                    
                    .btn-outline-primary:hover {
                        background: #3498db;
                        color: white;
                    }
                    
                    /* Payment loading overlay */
                    #payment-loading {
                        display: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.92);
                        z-index: 99999;
                        justify-content: center;
                        align-items: center;
                        backdrop-filter: blur(8px);
                    }
                    
                    .payment-loading-content {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 50px 40px;
                        border-radius: 24px;
                        text-align: center;
                        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                        max-width: 450px;
                        width: 90%;
                        color: white;
                        animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    }
                    
                    @keyframes scaleIn {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    
                    .payment-spinner {
                        width: 70px;
                        height: 70px;
                        border: 5px solid rgba(255,255,255,0.2);
                        border-top: 5px solid #ffffff;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 30px;
                        box-shadow: 0 0 20px rgba(255,255,255,0.3);
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    /* Loading animation for batches */
                    .batches-loading {
                        text-align: center;
                        padding: 15px;
                        color: #6c757d;
                    }
                    
                    .batches-loading .spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #3498db;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 10px;
                    }
                    
                    /* Date validation */
                    .date-option.invalid .date-label {
                        border-color: #dc3545;
                        background: #fff5f5;
                        opacity: 0.6;
                    }
                    
                    .date-option.invalid .date-label:hover {
                        border-color: #dc3545;
                        background: #ffeaea;
                    }
                    
                    .date-option.valid .date-label {
                        border-color: #28a745;
                        background: #f8fff9;
                    }
                    
                    /* Mobile responsiveness */
                    @media (max-width: 768px) {
                        .date-selection {
                            flex-direction: column;
                            gap: 10px;
                        }
                        
                        .date-label {
                            min-height: 80px;
                            padding: 12px;
                        }
                        
                        .date-number {
                            font-size: 24px;
                        }
                        
                        .batch-option {
                            padding: 10px 12px;
                            font-size: 13px;
                        }
                        
                        .slot-badge {
                            font-size: 10px;
                            min-width: 90px;
                            padding: 3px 6px;
                        }
                        
                        .payment-loading-content {
                            padding: 30px 20px;
                            margin: 15px;
                        }
                        
                        .success-message, .error-message {
                            padding: 20px 15px;
                        }
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
            $submitBtn.text('Pay ₹199 & Confirm Registration');
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
        
        // Also log to console
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⏳';
        console.log(`${icon} ${message}`);
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
        // Extract time from batch string like "Winter Carnival Workshop 🎄 ⏰ 10:00 AM – 11:30 AM"
        const match = batchString.match(/⏰\s*(.+)/);
        return match ? match[1] : batchString;
    }

    // ==================== API FUNCTIONS ====================

    // Get slot availability for specific date and batch - FIXED VERSION
    async function getSlotAvailability(carnivalName, batchName, selectedDate) {
        try {
            console.log(`🔍 Checking slots for ${batchName} on ${selectedDate}`);
            
            // FIX: Trim URL and parameters to remove newlines
            const apiUrl = `${BACKEND_API}/check-slots`.trim();
            
            const response = await axios.get(apiUrl, {
                params: { 
                    carnivalName: carnivalName.trim(),
                    batch: batchName.trim(),
                    date: selectedDate.trim(),
                    _t: Date.now()
                }
            });
            
            if (response.data.success) {
                console.log(`✅ Slot info for ${batchName}:`, response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to check slots');
            }
        } catch (error) {
            console.error('❌ Slot availability error:', error);
            // Return default availability
            return {
                carnivalName: carnivalName,
                batch: batchName,
                date: selectedDate,
                availableSlots: 15,
                isFull: false,
                capacity: 15,
                status: 'available'
            };
        }
    }

    // Get all batches for a specific date with slot counts - FIXED VERSION
    async function getBatchesForDate(selectedDate) {
        try {
            console.log(`📅 Fetching batches for date: ${selectedDate}`);
            
            // First, check all default batches availability
            const batchResults = [];
            
            for (const batch of DEFAULT_BATCHES) {
                try {
                    const slotInfo = await getSlotAvailability(CARNIVAL_NAME, batch, selectedDate);
                    batchResults.push({
                        name: batch,
                        displayName: extractBatchTime(batch),
                        time: extractBatchTime(batch),
                        availableSlots: slotInfo.availableSlots || 15,
                        isFull: slotInfo.isFull || false,
                        capacity: slotInfo.capacity || 15,
                        status: slotInfo.status || 'available'
                    });
                } catch (error) {
                    console.warn(`⚠️ Could not check availability for ${batch}:`, error.message);
                    // Add default data if check fails
                    batchResults.push({
                        name: batch,
                        displayName: extractBatchTime(batch),
                        time: extractBatchTime(batch),
                        availableSlots: 15,
                        isFull: false,
                        capacity: 15,
                        status: 'available'
                    });
                }
            }
            
            console.log(`✅ Loaded ${batchResults.length} batches for ${selectedDate}`);
            return batchResults;
            
        } catch (error) {
            console.error('❌ Batch fetch error:', error.message);
            console.log('🔄 Using default batches as fallback');
            // Return default batches as fallback
            return DEFAULT_BATCHES.map(batch => ({
                name: batch,
                displayName: extractBatchTime(batch),
                time: extractBatchTime(batch),
                availableSlots: 15,
                isFull: false,
                capacity: 15,
                status: 'available'
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
                message: formData.message || ''
            });

            console.log('✅ Registration saved:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Registration save error:', error);
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

            console.log('✅ Payment verified:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Payment verification error:', error);
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
                const isChecked = $($selectedDate + ':checked').length > 0;
                if (!isChecked) {
                    $('#date-error').text('Please select a workshop date').show();
                    $('.date-selection').addClass('is-invalid');
                    valid = false;
                    console.log('❌ No date selected');
                } else {
                    $('#date-error').hide();
                    $('.date-selection').removeClass('is-invalid');
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
                "amount": WORKSHOP_FEE * 100,
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
            message: $($message).val() ? $($message).val().trim() : ''
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
        console.log('💰 Workshop Fee: ₹' + WORKSHOP_FEE);
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
        
        // Initialize date selection
        initializeDateSelection();
        
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
                        <p style="color: #856404; font-size: 16px; font-weight: 500;"><i class="fas fa-palette mr-2"></i> Winter Carnival Workshop Registration</p>
                        <p><strong>📅 Workshop Dates:</strong> December 21-22, 2025</p>
                        <p>Fill in the details below to register your child for an exciting clay workshop experience!</p>
                        <div class="mt-3 p-3 bg-warning text-dark rounded">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            <strong>Limited Slots:</strong> Only 15 seats per batch. Secure your spot now!
                        </div>
                        <p class="mt-3 mb-0"><strong>Instructions:</strong></p>
                        <ol class="text-start small">
                            <li>Select your preferred workshop date</li>
                            <li>Choose an available time slot</li>
                            <li>Fill in child and parent details</li>
                            <li>Complete the ₹199 registration fee payment</li>
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
/**
 * specialoffer.js - Strawberry Cottage Workshop Registration
 * Handles form validation, API calls, and Razorpay payment integration
 */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────────
    // const API_BASE = 'https://backend.lilsculpr.com/api/special-course';
    const API_BASE = 'http://localhost:5000/api/special-course'; // Local testing

    const WORKSHOP_NAME = 'Strawberry Cottage Workshop';
    const WORKSHOP_PRICE = 399;
    const WORKSHOP_DATE = '2026-07-26';

    // ─── DOM References ─────────────────────────────────────────────
    const form = document.getElementById('workshopForm');
    const submitBtn = document.getElementById('submitBtn');
    const paymentStatus = document.getElementById('payment-status');
    const paymentLoading = document.getElementById('paymentLoading');
    const paymentConfirm = document.getElementById('paymentConfirm');

    // ─── Utility Functions ──────────────────────────────────────────
    function showStatus(message, type = 'info') {
        if (!paymentStatus) return;
        paymentStatus.className = 'payment-status ' + type;
        paymentStatus.textContent = message;
        paymentStatus.style.display = 'block';
        
        // Auto-hide after 8 seconds for non-error messages
        if (type !== 'error') {
            clearTimeout(paymentStatus._hideTimer);
            paymentStatus._hideTimer = setTimeout(() => {
                paymentStatus.style.display = 'none';
            }, 8000);
        }
    }

    function hideStatus() {
        if (paymentStatus) {
            paymentStatus.style.display = 'none';
            clearTimeout(paymentStatus._hideTimer);
        }
    }

    function setLoading(loading) {
        if (!submitBtn || !paymentLoading) return;
        
        if (loading) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
            paymentLoading.classList.add('active');
        } else {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
            paymentLoading.classList.remove('active');
        }
    }

    function getFormData() {
        return {
            parentName: document.getElementById('parentName')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            childName: document.getElementById('childName')?.value.trim() || '',
            childAge: document.getElementById('childAge')?.value.trim() || '',
            selectedDate: WORKSHOP_DATE,
            selectedBatch: document.getElementById('selectedBatch')?.value || '',
            carnivalName: WORKSHOP_NAME,
            materialType: document.getElementById('materialTypeHidden')?.value === 'true',
            availableDates: [WORKSHOP_DATE]
        };
    }

    function validateForm(data) {
        const errors = [];

        // Parent name
        if (!data.parentName || data.parentName.length < 2) {
            errors.push('Please enter a valid parent name');
        }

        // Email
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Please enter a valid email address');
        }

        // Phone - exactly 10 digits
        const cleanPhone = data.phone.replace(/\D/g, '');
        if (!cleanPhone || cleanPhone.length !== 10) {
            errors.push('Please enter a valid 10-digit phone number');
        }

        // Child name
        if (!data.childName || data.childName.length < 2) {
            errors.push('Please enter a valid child name');
        }

        // Child age
        const age = parseInt(data.childAge);
        if (!data.childAge || isNaN(age) || age < 5 || age > 14) {
            errors.push('Child age must be between 5 and 14 years');
        }

        // Payment confirmation
        if (!paymentConfirm || !paymentConfirm.checked) {
            errors.push('Please confirm the payment terms');
        }

        return errors;
    }

    // ─── API Calls ──────────────────────────────────────────────────
    async function apiCall(endpoint, data, method = 'POST') {
        try {
            const response = await axios({
                method: method,
                url: `${API_BASE}${endpoint}`,
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            }
            if (error.request) {
                throw { message: 'No response from server. Please check your connection.' };
            }
            throw { message: error.message || 'An unexpected error occurred.' };
        }
    }

    async function registerWorkshop(data) {
        return await apiCall('/register', data);
    }

    async function createPaymentOrder(registrationId) {
        return await apiCall('/create-order', { registrationId });
    }

    async function verifyPayment(paymentData) {
        return await apiCall('/verify-payment', paymentData);
    }

    // ─── Razorpay Payment ──────────────────────────────────────────
    function openRazorpay(orderData, registrationId) {
        return new Promise((resolve, reject) => {
            const parentName = document.getElementById('parentName')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const phone = document.getElementById('phone')?.value || '';

            const options = {
                key: orderData.data.key_id,
                amount: orderData.data.amount * 100,
                currency: orderData.data.currency,
                name: 'Lil Sculpr Clay Academy',
                description: 'Strawberry Cottage Workshop',
                image: 'https://www.lilsculpr.com/assets/img/logo.webp',
                order_id: orderData.data.orderId,
                prefill: {
                    name: parentName,
                    email: email,
                    contact: phone
                },
                theme: {
                    color: '#9C29B2'
                },
                handler: function(response) {
                    resolve({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        registrationId: registrationId
                    });
                },
                modal: {
                    ondismiss: function() {
                        reject({ message: 'Payment was cancelled by user.' });
                    }
                }
            };

            try {
                const rzp = new Razorpay(options);
                rzp.open();
            } catch (error) {
                reject({ message: 'Failed to open payment gateway: ' + error.message });
            }
        });
    }

    // ─── Form Submit Handler ──────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();

        // Hide any previous status
        hideStatus();

        // Get and validate form data
        const formData = getFormData();
        const errors = validateForm(formData);

        if (errors.length > 0) {
            showStatus('❌ ' + errors.join(' • '), 'error');
            // Scroll to top to show error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        showStatus('⏳ Processing registration...', 'info');

        try {
            // Step 1: Register for workshop
            const registerResult = await registerWorkshop(formData);

            if (!registerResult.success) {
                throw { 
                    message: registerResult.message || 'Registration failed',
                    data: registerResult.data
                };
            }

            const registrationId = registerResult.data.registrationId;
            showStatus('✅ Registration created! Creating payment order...', 'info');

            // Step 2: Create payment order
            const orderResult = await createPaymentOrder(registrationId);

            if (!orderResult.success) {
                throw { message: orderResult.message || 'Failed to create payment order' };
            }

            // Step 3: Open Razorpay
            showStatus('💳 Opening payment gateway...', 'info');

            const paymentResponse = await openRazorpay(orderResult, registrationId);

            // Step 4: Verify payment
            showStatus('✅ Payment successful! Verifying...', 'info');

            const verifyResult = await verifyPayment({
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                registrationId: registrationId,
                paymentDetails: {
                    method: 'razorpay'
                }
            });

            if (verifyResult.success) {
                showStatus('🎉 Registration confirmed! Check your email for details.', 'success');
                form.reset();
                if (paymentConfirm) paymentConfirm.checked = false;
                
                // Optional: Redirect to success page
                // window.location.href = '/success.html?registrationId=' + registrationId;
            } else {
                throw { message: verifyResult.message || 'Payment verification failed' };
            }

        } catch (error) {
            console.error('Workshop registration error:', error);
            
            let errorMessage = 'Something went wrong. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            showStatus('❌ ' + errorMessage, 'error');
            
            // Log additional error details for debugging
            if (error.data) {
                console.error('Error details:', error.data);
            }
        } finally {
            setLoading(false);
        }
    }

    // ─── Input Validation Helpers ──────────────────────────────────
    function setupInputValidation() {
        // Phone number - only digits, max 10
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').slice(0, 10);
            });
        }

        // Age - only numbers, min 5, max 14
        const ageInput = document.getElementById('childAge');
        if (ageInput) {
            ageInput.addEventListener('input', function() {
                const val = parseInt(this.value);
                if (this.value && (isNaN(val) || val < 1)) {
                    this.value = '';
                } else if (val > 14) {
                    this.value = '14';
                }
            });
        }

        // Email - basic validation on blur
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const val = this.value.trim();
                if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '';
                }
            });
            emailInput.addEventListener('input', function() {
                this.style.borderColor = '';
            });
        }
    }

    // ─── Initialize ──────────────────────────────────────────────────
    function init() {
        // Check if required elements exist
        if (!form) {
            console.error('Workshop form not found!');
            return;
        }

        // Setup form submit
        form.addEventListener('submit', handleSubmit);

        // Setup input validation
        setupInputValidation();

        console.log('✅ Strawberry Cottage Workshop form initialized');
        console.log(`📍 API Base: ${API_BASE}`);
        console.log(`🎪 Workshop: ${WORKSHOP_NAME}`);
        console.log(`💰 Price: ₹${WORKSHOP_PRICE}`);
    }

    // Run init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
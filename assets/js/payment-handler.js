// Payment Handler for Razorpay Integration
class PaymentHandler {
    constructor() {
        this.razorpayKey = "rzp_test_1DP5mmOlF5G5ag"; // Replace with your actual key
       this.amount = 49900; // ₹499 in paise
        this.currency = "INR";
        this.db = firebase.database();
    }
    
    // Show/hide payment loading
    showLoading(show = true) {
        const loader = document.getElementById('payment-loading');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }
    
    // Show payment status message
    showPaymentStatus(message, type = 'success') {
        const statusDiv = document.getElementById('payment-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `payment-status payment-${type}`;
            statusDiv.style.display = 'block';
            
            // Auto hide after 10 seconds
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 10000);
        }
    }
    
    // Generate order ID (simulated - in production, use backend)
    async generateOrderId(registrationData) {
        try {
            const timestamp = Date.now();
            const orderId = `order_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Store order details in Firebase
            await this.db.ref(`orders/${orderId}`).set({
                ...registrationData,
                orderId: orderId,
                amount: this.amount,
                currency: this.currency,
                status: 'created',
                created_at: timestamp,
                updated_at: timestamp
            });
            
            return orderId;
        } catch (error) {
            console.error('Error generating order:', error);
            throw error;
        }
    }
    
    // Initialize Razorpay payment
    async initializePayment(registrationData) {
        this.showLoading(true);
        
        try {
            // Generate order ID
            const orderId = await this.generateOrderId(registrationData);
            
            const options = {
                key: this.razorpayKey,
                amount: this.amount.toString(),
                currency: this.currency,
                name: "Lil Sculpr Clay Academy",
                description: "Winter Carnival Workshop Registration",
                order_id: orderId, // Use generated order ID
                handler: (response) => this.handlePaymentSuccess(response, registrationData),
                prefill: {
                    name: registrationData.parentName,
                    email: registrationData.email,
                    contact: registrationData.phone
                },
                theme: {
                    color: "#3498db"
                },
                modal: {
                    ondismiss: () => {
                        this.showPaymentStatus('Payment cancelled. Please try again.', 'error');
                        this.showLoading(false);
                    }
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.open();
            
        } catch (error) {
            console.error('Payment initialization failed:', error);
            this.showPaymentStatus('Failed to initialize payment. Please try again.', 'error');
            this.showLoading(false);
        }
    }
    
    // Handle successful payment
    async handlePaymentSuccess(response, registrationData) {
        try {
            this.showLoading(true);
            
            // Store payment details in Firebase
            const paymentData = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: this.amount,
                currency: this.currency,
                status: 'success',
                timestamp: Date.now(),
                registration_data: registrationData
            };
            
            // Store in payments collection
            await this.db.ref(`payments/${response.razorpay_payment_id}`).set(paymentData);
            
            // Update registration with payment info
            await this.db.ref(`registrations/all/${registrationData.registrationId}/payment`).set({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                amount: this.amount / 100,
                status: 'paid',
                payment_date: Date.now()
            });
            
            // Send confirmation email
            await this.sendConfirmationEmail(registrationData, response.razorpay_payment_id);
            
            this.showLoading(false);
            this.showPaymentStatus('✅ Payment successful! Registration confirmed. We have sent a confirmation email.', 'success');
            
            // Reset form
            document.getElementById('contactForm').reset();
            
        } catch (error) {
            console.error('Error processing payment success:', error);
            this.showLoading(false);
            this.showPaymentStatus('Payment recorded but there was an issue with confirmation. Please contact support.', 'error');
        }
    }
    
    // Send confirmation email via EmailJS
    async sendConfirmationEmail(registrationData, paymentId) {
        try {
            const templateParams = {
                to_email: registrationData.email,
                parent_name: registrationData.parentName,
                child_name: registrationData.childName,
                batch: registrationData.batch,
                payment_id: paymentId,
                amount: '199',
                workshop_date: 'To be announced',
                workshop_time: registrationData.batch.match(/⏰\s*([\d:APM\s–-]+)/)?.[1] || '1.5 hours'
            };
            
            await emailjs.send(
                'service_gyorn2l', // Your EmailJS service ID
                'template_payment_confirmation', // Create this template in EmailJS
                templateParams
            );
            
            console.log('Confirmation email sent successfully');
            
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            // Don't throw error - payment is successful even if email fails
        }
    }
}

// Initialize payment handler
const paymentHandler = new PaymentHandler();
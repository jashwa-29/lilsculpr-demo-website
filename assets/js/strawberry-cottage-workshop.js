(function() {
  'use strict';
const API_BASE = 'https://backend.lilsculpr.com/api/special-course';
  // const API_BASE = 'http://localhost:5000/api/special-course';
  const WORKSHOP_NAME = 'Strawberry Cottage Workshop';
  const WORKSHOP_PRICE = 399;
  const WORKSHOP_DATE = '2026-07-26';

  const form = document.getElementById('workshopForm');
  const submitBtn = document.getElementById('submitBtn');
  const paymentStatus = document.getElementById('payment-status');
  const paymentLoading = document.getElementById('paymentLoading');
  const successModal = document.getElementById('paymentSuccessModal');
  const failureModal = document.getElementById('paymentFailureModal');
  const successWorkshop = document.getElementById('successWorkshop');
  const failureMessage = document.getElementById('failureMessage');

  const slotIndicator = document.getElementById('slotIndicator');
  const slotCount = document.getElementById('slotCount');
  const slotCapacity = document.getElementById('slotCapacity');
  const slotFill = document.getElementById('slotFill');
  const slotStatusText = document.getElementById('slotStatusText');

  async function checkSlotAvailability() {
    if (!slotIndicator) return;
    try {
      const params = new URLSearchParams({
        carnivalName: WORKSHOP_NAME,
        batch: 'Strawberry Cottage Workshop 🍓 ⏰ 11:00 AM – 1:00 PM',
        date: WORKSHOP_DATE
      });
      const response = await axios.get(`${API_BASE}/check-slots?${params}`);
      const data = response.data;
      if (data.success) {
        const avail = data.data.availableSlots;
        const cap = data.data.capacity;
        const ratio = cap > 0 ? avail / cap : 0;

        slotCount.textContent = avail;
        slotCapacity.textContent = cap;
        slotFill.style.width = (ratio * 100) + '%';

        if (avail === 0) {
          slotIndicator.style.background = '#fef2f2';
          slotIndicator.style.borderColor = '#fca5a5';
          slotCount.style.color = '#dc2626';
          slotStatusText.textContent = '❌ Workshop is full!';
          slotStatusText.style.color = '#dc2626';
          slotFill.style.background = '#ef4444';
          submitBtn.disabled = true;
          submitBtn.title = 'No slots available';
        } else if (avail <= 5) {
          slotIndicator.style.background = '#fff7ed';
          slotIndicator.style.borderColor = '#fdba74';
          slotCount.style.color = '#ea580c';
          slotStatusText.textContent = '⚠️ Only ' + avail + ' slot' + (avail > 1 ? 's' : '') + ' remaining!';
          slotStatusText.style.color = '#ea580c';
          slotFill.style.background = '#f97316';
        } else {
          slotIndicator.style.background = '#f0fdf4';
          slotIndicator.style.borderColor = '#86efac';
          slotCount.style.color = '#166534';
          slotStatusText.textContent = '✅ Slots available — register now!';
          slotStatusText.style.color = '#166534';
          slotFill.style.background = '#22c55e';
        }
      }
    } catch (err) {
      console.error('Slot check failed:', err);
      slotStatusText.textContent = 'Could not check availability';
      slotStatusText.style.color = '#6b7280';
    }
  }

  function showStatus(message, type = 'info') {
    paymentStatus.className = 'payment-status ' + type;
    paymentStatus.textContent = message;
    paymentStatus.style.display = 'block';
    setTimeout(() => {
      paymentStatus.style.display = 'none';
    }, 8000);
  }

  function setLoading(loading) {
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

  function showSuccessModal() {
    if (!successModal) return;
    if (successWorkshop) successWorkshop.textContent = WORKSHOP_NAME;
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideSuccessModal() {
    if (!successModal) return;
    successModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showFailureModal(message) {
    if (!failureModal) return;
    if (failureMessage) failureMessage.textContent = message;
    failureModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideFailureModal() {
    if (!failureModal) return;
    failureModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function(e) {
    if (e.target === successModal) hideSuccessModal();
    if (e.target === failureModal) hideFailureModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideSuccessModal();
      hideFailureModal();
    }
  });

  function getFormData() {
    return {
      parentName: document.getElementById('parentName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      childName: document.getElementById('childName').value.trim(),
      childAge: document.getElementById('childAge').value.trim(),
      selectedDate: WORKSHOP_DATE,
      selectedBatch: document.getElementById('selectedBatch').value,
      carnivalName: WORKSHOP_NAME,
      materialType: document.getElementById('materialTypeHidden').value === 'true'
    };
  }

  function validateForm(data) {
    const errors = [];

    if (!data.parentName || data.parentName.length < 2) {
      errors.push('Please enter a valid parent name');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.phone || !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
      errors.push('Please enter a valid 10-digit phone number');
    }

    if (!data.childName || data.childName.length < 2) {
      errors.push('Please enter a valid child name');
    }

    const age = parseInt(data.childAge);
    if (!data.childAge || isNaN(age) || age < 5 || age > 14) {
      errors.push('Child age must be between 5 and 14 years');
    }

    if (!document.getElementById('paymentConfirm').checked) {
      errors.push('Please confirm the payment terms');
    }

    return errors;
  }

  async function registerWorkshop(data) {
    try {
      const response = await axios.post(`${API_BASE}/register`, data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw { message: 'Network error. Please check your connection.' };
    }
  }

  async function createPaymentOrder(registrationId) {
    try {
      const response = await axios.post(`${API_BASE}/create-order`, {
        registrationId: registrationId
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw { message: 'Failed to create payment order.' };
    }
  }

  async function verifyPayment(paymentData) {
    try {
      const response = await axios.post(`${API_BASE}/verify-payment`, paymentData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw { message: 'Payment verification failed.' };
    }
  }

  function openRazorpay(orderData, registrationId) {
    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.data.key_id,
        amount: orderData.data.amount * 100,
        currency: orderData.data.currency,
        name: 'Lil Sculpr Clay Academy',
        description: 'Strawberry Cottage Workshop',
        image: 'https://www.lilsculpr.com/assets/img/logo.webp',
        order_id: orderData.data.orderId,
        prefill: {
          name: document.getElementById('parentName').value,
          email: document.getElementById('email').value,
          contact: document.getElementById('phone').value
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

      const rzp = new Razorpay(options);
      rzp.open();
    });
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = getFormData();
    const errors = validateForm(formData);

    if (errors.length > 0) {
      showStatus('❌ ' + errors.join(' • '), 'error');
      return;
    }

    setLoading(true);
    showStatus('⏳ Registering for workshop...', 'info');

    try {
      const registerResult = await registerWorkshop(formData);

      if (!registerResult.success) {
        throw { message: registerResult.message || 'Registration failed' };
      }

      const registrationId = registerResult.data.registrationId;
      showStatus('✅ Registration created! Creating payment order...', 'info');

      const orderResult = await createPaymentOrder(registrationId);

      if (!orderResult.success) {
        throw { message: orderResult.message || 'Failed to create payment order' };
      }

      showStatus('💳 Opening payment gateway...', 'info');

      const paymentResponse = await openRazorpay(orderResult, registrationId);

      showStatus('✅ Payment successful! Verifying...', 'info');

      const verifyResult = await verifyPayment({
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        registrationId: registrationId
      });

      if (verifyResult.success) {
        setLoading(false);
        showSuccessModal();
        form.reset();
        document.getElementById('paymentConfirm').checked = false;
        checkSlotAvailability();
      } else {
        throw { message: verifyResult.message || 'Payment verification failed' };
      }

    } catch (error) {
      console.error('Workshop registration error:', error);
      setLoading(false);
      showFailureModal(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  document.getElementById('successModalBtn').addEventListener('click', hideSuccessModal);
  document.getElementById('failureModalBtn').addEventListener('click', hideFailureModal);

  document.getElementById('phone').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 10);
  });

  window.addEventListener('beforeunload', function() {
    if (paymentLoading.classList.contains('active')) {
      setLoading(false);
    }
  });

  console.log('✅ Strawberry Cottage Workshop registration form initialized');
  checkSlotAvailability();
})();

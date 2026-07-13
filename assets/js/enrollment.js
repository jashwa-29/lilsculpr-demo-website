(function($) {
    "use strict";
  const BACKEND_BASE = 'https://backend.lilsculpr.com/api';
  const BACKEND_API = `${BACKEND_BASE}/enrollment`;
   // const BACKEND_BASE = 'http://localhost:5000/api';
   // const BACKEND_API = 'http://localhost:5000/api/enrollment';
    
    // UI elements
    const form = '#admissionForm';
    let formMessages = $('.form-messages');

    /* ── DATA LAYER ── */
    let MAX_PER_SLOT = 8;
    // Raw batch documents from DB, keyed by type
    let BATCHES_BY_TYPE = { offline: [], online: [] };

    function slotKey(type, dayId, time) {
        return `${type}|${dayId}|${time}`;
    }

    /* ── STATE ── */
    let currentType = "offline";
    let selectedSlot = null;

    // ==================== API FUNCTIONS ====================
    async function fetchBatchesFromDB() {
        try {
            console.log('🔄 Fetching batches from database...');
            const response = await axios.get(`${BACKEND_BASE}/batches`);
            
            if (response.data.success && response.data.batches) {
                const allBatches = response.data.batches;
                // Group by type
                BATCHES_BY_TYPE.offline = allBatches.filter(b => b.type === 'offline' && b.status === 'active');
                BATCHES_BY_TYPE.online  = allBatches.filter(b => b.type === 'online'  && b.status === 'active');
                console.log(`✅ Loaded ${allBatches.length} batches from database`);
            }
        } catch (error) {
            console.error('❌ Failed to fetch batches:', error);
        }
    }

    async function createOrderOnBackend(classType, kitOptIn) {
        try {
            console.log(`📦 Creating order...`);
            const response = await axios.post(`${BACKEND_API}/create-order`, {
                classType: classType,
                kitOptIn: kitOptIn
            });
            if (response.data.success) {
                console.log('✅ Order created successfully:', response.data.order.id);
                return { order: response.data.order, amount: response.data.amount, key_id: response.data.key_id };
            } else {
                throw new Error(response.data.error || 'Failed to create order');
            }
        } catch (error) {
            console.error('❌ Order creation error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to create payment order';
            throw new Error(errorMessage);
        }
    }

    async function submitEnrollment(formData) {
        try {
            console.log(`📝 Submitting enrollment...`);
            // we use axios.post with multipart form data since it contains a file
            const response = await axios.post(`${BACKEND_API}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                console.log('✅ Enrollment submitted successfully');
                return response.data;
            } else {
                throw new Error(response.data.error || 'Failed to submit enrollment');
            }
        } catch (error) {
            console.error('❌ Enrollment submission error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to submit enrollment';
            throw new Error(errorMessage);
        }
    }

    // ==================== UI FUNCTIONS ====================
    // Compute available seats for a batch document
    function seatsLeft(batch) {
        const enrolled = batch.enrolledStudents ? batch.enrolledStudents.length : 0;
        return Math.max(0, (batch.capacity || MAX_PER_SLOT) - enrolled);
    }

    // Day label map
    const DAY_LABELS = {
        monfri:  '📅 Monday & Friday',
        tuethu:  '📅 Tuesday & Thursday',
        satsu:   '📅 Saturday & Sunday'
    };

    async function buildAllSlots() {
        await fetchBatchesFromDB();

        ['offline', 'online'].forEach(type => {
            const container = $(`#slots-${type}`);
            if (!container.length) return;
            container.empty();

            const batches = BATCHES_BY_TYPE[type];
            if (!batches.length) {
                container.html('<p style="color:var(--muted);font-size:0.85rem;">No available slots at the moment. Please check back soon.</p>');
                return;
            }

            // Group batches by dayId
            const grouped = {};
            batches.forEach(batch => {
                if (!grouped[batch.dayId]) grouped[batch.dayId] = [];
                grouped[batch.dayId].push(batch);
            });

            // Render each day group
            ['monfri', 'tuethu', 'satsu'].forEach(dayId => {
                const dayBatches = grouped[dayId];
                if (!dayBatches || !dayBatches.length) return;

                const grp = $('<div class="batch-group"></div>');
                grp.append(`<h4>${DAY_LABELS[dayId] || dayId}</h4><div class="batch-slots" id="bs-${type}-${dayId}"></div>`);
                container.append(grp);

                const wrap = grp.find('.batch-slots');

                dayBatches.forEach(batch => {
                    const left = seatsLeft(batch);
                    const full = left === 0;
                    const few  = left <= 2 && left > 0;
                    const seatClass = full ? 'seats-full' : few ? 'seats-few' : 'seats-ok';
                    const seatText  = full ? 'Full' : left === 1 ? '1 seat left' : `${left} seats left`;

                    const btn = $('<div></div>').addClass(`slot-btn ${full ? 'full' : ''}`)
                        .attr({
                            'data-type':   type,
                            'data-day':    batch.dayId,
                            'data-time':   batch.time,
                            'data-batchid': batch._id
                        })
                        .html(`<span class="time">⏰ ${batch.time}</span><span class="seats ${seatClass}">${seatText}</span>`);

                    if (!full) {
                        btn.on('click', function() {
                            $('.slot-btn').removeClass('selected');
                            $(this).addClass('selected');
                            selectedSlot = {
                                type,
                                dayId: batch.dayId,
                                time:  batch.time,
                                batchId: batch._id,
                                key:   slotKey(type, batch.dayId, batch.time)
                            };
                        });
                    }
                    wrap.append(btn);
                });
            });
        });
    }

    // Export some functions to global scope as they are called from HTML inline onclick
    window.switchType = function(type, el) {
        currentType = type;
        $('.type-tab').removeClass('active');
        $(el).addClass('active');
        $('.batch-panel').removeClass('visible');
        $(`#panel-${type}`).addClass('visible');
    };

    window.previewPhoto = function(input) {
        const file = input.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = e => {
            $('#photoPreview').attr('src', e.target.result).show();
        };
        r.readAsDataURL(file);
    };

    // ==================== FORM SUBMISSION ====================
    function validateForm() {
        let valid = true;
        
        function req(id, errId) {
            const el = $(`#${id}`);
            if (!el.length) return true;
            const ok = el.val().trim() !== '';
            el.css('border-color', ok ? '' : '#ef4444');
            $(`#${errId}`).css('display', ok ? 'none' : 'block');
            return ok;
        }

        valid = req('childName', 'e-childName') && valid;
        valid = req('childDob', 'e-childDob') && valid;
        valid = req('childClass', 'e-childClass') && valid;
        valid = req('schoolName', 'e-schoolName') && valid;
        valid = req('parentName', 'e-parentName') && valid;
        valid = req('contact1', 'e-contact1') && valid;
        valid = req('contact2', 'e-contact2') && valid;

        const photoFile = $('#photoInput')[0]?.files[0];
        if (!photoFile) {
            alert("Please upload a child photograph.");
            valid = false;
        }

        if (!selectedSlot) {
            $('#e-batch').css('display', 'block');
            valid = false;
        } else {
            $('#e-batch').css('display', 'none');
        }

        const d1 = $('#decl1').is(':checked');
        const d2 = $('#decl2').is(':checked');
        if (!d1 || !d2) {
            $('#e-decl').css('display', 'block');
            valid = false;
        } else {
            $('#e-decl').css('display', 'none');
        }

        return valid;
    }

    $(document).on('submit', form, async function (element) {
        element.preventDefault();
        console.log('🚀 Enrollment form submission started');

        if (!validateForm()) {
            return false;
        }

        const submitBtn = $('.submit-btn');
        submitBtn.prop('disabled', true).text('Processing Payment...');

        try {
            const kitOptIn = $('#kitOptIn').is(':checked');
            
            // 1. Create Order
            const { order, amount, key_id } = await createOrderOnBackend(selectedSlot.type, kitOptIn);
            
            // 2. Initialize Payment — key is provided by backend, never hardcoded in frontend
            const options = {
                key: key_id,
                amount: order.amount,
                currency: "INR",
                name: "Lil Sculpr Academy",
                description: "First Month Fee" + (kitOptIn ? " + Enrollment Kit" : ""),
                image: "https://www.lilsculpr.com/assets/img/logo.webp",
                order_id: order.id,
                handler: async function (response) {
                    submitBtn.text('Finalizing Enrollment...');
                    
                    try {
                        const formData = new FormData();
                        formData.append("razorpayOrderId", response.razorpay_order_id);
                        formData.append("razorpayPaymentId", response.razorpay_payment_id);
                        formData.append("razorpaySignature", response.razorpay_signature);
                        formData.append("childName", $('#childName').val().trim());
                        formData.append("childAge", $('#childDob').val());
                        formData.append("dateOfBirth", $('#childDob').val());
                        formData.append("childClass", $('#childClass').val());
                        formData.append("schoolName", $('#schoolName').val().trim());
                        formData.append("parentName", $('#parentName').val().trim());
                        formData.append("contact1", $('#contact1').val().trim());
                        formData.append("contact2", $('#contact2').val().trim());
                        formData.append("email", $('#email').val().trim());
                        formData.append("classType", selectedSlot.type);
                        formData.append("dayId", selectedSlot.dayId);
                        formData.append("time", selectedSlot.time);
                        formData.append("slotKey", selectedSlot.key);
                        formData.append("batchId", selectedSlot.batchId || '');
                        formData.append("kitOptIn", kitOptIn);
                        formData.append("amountPaid", amount);
                        formData.append("photo", $('#photoInput')[0].files[0]);


                        const result = await submitEnrollment(formData);
                        
                        // Instead of showing a popup, we redirect to the success page!
                        window.location.href = `success.html?enrollmentId=${result.student.enrollmentId}&paymentId=${response.razorpay_payment_id}`;
                    } catch (submitError) {
                        alert('Enrollment failed: ' + submitError.message);
                        submitBtn.prop('disabled', false).text('🎨 Submit Admission Form');
                    }
                },
                prefill: {
                    name: $('#parentName').val().trim(),
                    email: $('#email').val().trim(),
                    contact: $('#contact1').val().trim()
                },
                theme: { color: "#f97316" },
                modal: {
                    ondismiss: function() {
                        submitBtn.prop('disabled', false).text('🎨 Retry Payment');
                        console.log('Razorpay payment modal closed by user.');
                    }
                }
            };

            // Wrap in setTimeout to detach from the form submit event context!
            setTimeout(() => {
                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function(response) {
                    window.location.href = `failed.html?reason=${encodeURIComponent(response.error.description || 'Payment Failed')}`;
                });
                rzp.open();
            }, 100);
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('An error occurred while processing. Please try again.');
            submitBtn.prop('disabled', false).text('🎨 Submit Admission Form');
        }
    });

    // Clear errors on input
    $(document).on('input', 'input, select', function() {
        $(this).css('border-color', '');
    });

    // ==================== INITIALIZATION ====================
    function initialize() {
        console.log('🎨 Initializing Enrollment Form...');
        console.log('🔗 Backend API:', BACKEND_API);

        // Check if axios is loaded
        if (typeof axios === 'undefined') {
            console.log('📦 Loading Axios...');
            $('head').append('<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>');
            setTimeout(initialize, 1000);
            return;
        }

        // Check if Razorpay is loaded
        if (typeof Razorpay === 'undefined') {
            console.log('📦 Loading Razorpay SDK...');
            $('head').append('<script src="https://checkout.razorpay.com/v1/checkout.js"></script>');
            setTimeout(initialize, 1000);
            return;
        }

        if ($('#slots-offline').length) {
            buildAllSlots();
        }
        
        console.log('✅ Enrollment form initialized successfully');
    }

    $(document).ready(function() {
        console.log('📄 Document ready, starting initialization...');
        initialize();
    });

})(jQuery);


        $(document).ready(function(){
            // DOM Elements
            const spinnerPopup = document.getElementById('spinner-popup');
            const closePopup = document.getElementById('close-popup');
            const wheel = document.getElementById('wheel');
            const spinBtn = document.getElementById('spin-btn');
            const winnerPopup = document.getElementById('winner-popup');
            const winnerText = document.getElementById('winner-text');
            const claimBtn = document.getElementById('claim-btn');
            const closeWinner = document.getElementById('close-winner');

            // Prize Configuration
            const prizes = [
                { text: "Free Trial class", color: "#FF6B6B", fullText: "Free Trial Class" },
                { text: "Free creative Assessment", color: "#4ECDC4", fullText: "Free Creative Assessment" },
                { text: "Free mini Clay Kit", color: "#FFD166", fullText: "Free Mini Clay Kit" },
                { text: "₹500 Off on Course Fee", color: "#06D6A0", fullText: "₹500 Off on Course Fee" },
                { text: "10% Off on Any Course", color: "#118AB2", fullText: "10% Off on Any Course" },
                { text: "15% Off on Full Batch", color: "#073B4C", fullText: "15% Off on Full Batch" },
                { text: "Free Workshop Pass", color: "#7209B7", fullText: "Free Workshop Pass" },
                { text: "₹300 + Goodie Bag", color: "#F72585", fullText: "₹300 Off + Free Goodie Bag" },
                { text: "Parent-Child Session", color: "#3A86FF", fullText: "Parent-Child Session" }
            ];

            // State Variables
            let spinning = false;
            let selectedPrizeIndex = -1;
            let currentRotation = 0;
            const ctx = wheel.getContext('2d');

            // Initialize Wheel
            function initWheel() {
                scaleCanvas();
                createWheel();
            }

            // Scale Canvas for High DPI Displays
            function scaleCanvas() {
                const rect = wheel.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                wheel.width = Math.round(rect.width * dpr);
                wheel.height = Math.round(rect.height * dpr);
                ctx.scale(dpr, dpr);
            }

            // Create Wheel Slices
            function createWheel() {
                const width = wheel.getBoundingClientRect().width;
                const center = width / 2;
                const radius = center - 10;
                const slices = prizes.length;
                const sliceAngle = (2 * Math.PI) / slices;

                ctx.clearRect(0, 0, width, width);

                // Draw slices
                for (let i = 0; i < slices; i++) {
                    const startAngle = i * sliceAngle;
                    const endAngle = startAngle + sliceAngle;

                    ctx.beginPath();
                    ctx.moveTo(center, center);
                    ctx.arc(center, center, radius, startAngle, endAngle);
                    ctx.closePath();
                    ctx.fillStyle = prizes[i].color;
                    ctx.fill();

                    // Draw borders
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Draw text
                    ctx.save();
                    ctx.translate(center, center);
                    ctx.rotate(startAngle + sliceAngle / 2);
                    ctx.textAlign = 'right';
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 16px Arial';
                    ctx.fillText(prizes[i].text, radius - 20, 5);
                    ctx.restore();
                }

                // Draw center circle
                ctx.beginPath();
                ctx.arc(center, center, 20, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fill();
            }

            // Spin Animation
            function spin() {
                if (spinning) return;
                
                spinning = true;
                spinBtn.disabled = true;

                // Select random prize
                selectedPrizeIndex = Math.floor(Math.random() * prizes.length);
                
                // Calculate rotation for selected prize
                const slices = prizes.length;
                const sliceAngle = 360 / slices;
                const targetAngle = selectedPrizeIndex * sliceAngle + sliceAngle / 2;
                const fullRotations = 5;
                const totalRotation = fullRotations * 360 + (360 - targetAngle) + 270;

                currentRotation += totalRotation;

                // Apply animation
                wheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
                wheel.style.transform = `rotate(${currentRotation}deg)`;

                // Handle animation end
                setTimeout(() => {
                    showWinner();
                }, 4200);
            }

            // Show Winner
            function showWinner() {
                spinning = false;
                spinBtn.disabled = false;
                
                const prize = prizes[selectedPrizeIndex];
                
                createConfetti();
                
                // Show winner popup after delay
                setTimeout(() => {
                    winnerText.textContent = `You won: ${prize.fullText}`;
                    winnerPopup.classList.add('active');
                }, 1000);
            }

            // Create Confetti Effect
            function createConfetti() {
                const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                
                for (let i = 0; i < 100; i++) {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = Math.random() * 100 + 'vw';
                    confetti.style.top = '-20px';
                    confetti.style.width = Math.random() * 12 + 6 + 'px';
                    confetti.style.height = Math.random() * 12 + 6 + 'px';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                    document.body.appendChild(confetti);

                    const animation = confetti.animate([
                        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                        { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
                    ], {
                        duration: Math.random() * 2000 + 1500,
                        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
                        delay: Math.random() * 300
                    });

                    animation.onfinish = () => confetti.remove();
                }
            }

            // Close Spinner Popup
            function closeSpinnerPopup() {
                spinnerPopup.classList.remove('active');
                winnerPopup.classList.remove('active');
                
                // Reset wheel
                wheel.style.transition = 'none';
                wheel.style.transform = 'rotate(0deg)';
                currentRotation = 0;
                spinning = false;
                spinBtn.disabled = false;
            }

            // Event Listeners
            closePopup.addEventListener('click', closeSpinnerPopup);
            spinBtn.addEventListener('click', spin);
            
            claimBtn.addEventListener('click', function() {
                window.location.href = 'contact.html';
            });
            
            closeWinner.addEventListener('click', function() {
                winnerPopup.classList.remove('active');
            });

            // Keyboard controls
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeSpinnerPopup();
                }
            });

            // Handle window resize
            window.addEventListener('resize', function() {
                initWheel();
            });

            // Initialize with a slight delay to show the animation
            setTimeout(() => {
                initWheel();
            }, 100);
        });
  
function initCarousel() {
    // ... (Your existing console.logs for initial script loading) ...

    const carouselContainers = document.querySelectorAll('.carousel-container');
    // ... (Your existing console.log for containers found) ...

    carouselContainers.forEach(container => {
        // ... (Your existing console.logs for elements found inside container) ...

        const carouselTrack = container.querySelector('.carousel-track');
        // ... (null checks and initial logs for track, slides, buttons, dots) ...

        let slides = Array.from(container.querySelectorAll('.carousel-slide'));
        let prevBtn = container.querySelector('.carousel-prev-btn');
        let nextBtn = container.querySelector('.carousel-next-btn');
        let dotsContainer = container.querySelector('.carousel-dots');
        let dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.dot')) : [];


        let currentIndex = 0;
        let slideWidth = 0;
        if (slides.length > 0) {
             slideWidth = slides[0].offsetWidth;
        }
        // ... (initial slideWidth logs) ...

        window.addEventListener('resize', () => {
            slideWidth = slides[0] ? slides[0].offsetWidth : 0;
            // IMPORTANT: If you resize during a drag animation, stop it
            cancelAnimationFrame(animationID);
            isDragging = false; // Reset drag state
            updateCarousel();
        });

        // --- Core Carousel Update Function ---
        function updateCarousel() {
            console.log('updateCarousel called. Current index:', currentIndex);
            if (slides.length === 0) {
                console.warn('No slides to update. Exiting updateCarousel.');
                return;
            }

            const containerWidth = container.offsetWidth;
            const activeSlide = slides[currentIndex];

            if (!activeSlide) {
                console.error("Active slide not found for index:", currentIndex, "in updateCarousel.");
                return;
            }

            const activeSlideRect = activeSlide.getBoundingClientRect();
            const currentSlideRelativeLeft = activeSlide.offsetLeft;
            const desiredActiveSlideLeftInView = (containerWidth / 2) - (activeSlideRect.width / 2);

            let targetOffset = -(currentSlideRelativeLeft - desiredActiveSlideLeftInView);

            const trackWidth = carouselTrack.scrollWidth;
            const maxScroll = trackWidth - containerWidth;
            targetOffset = Math.max(-maxScroll, Math.min(0, targetOffset));

            // ALWAYS enable transition for programmatic moves (arrows, dots, snap)
            carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            carouselTrack.style.transform = `translateX(${targetOffset}px)`;
            console.log('  Track transform set to:', carouselTrack.style.transform);

            slides.forEach((slide, index) => {
                slide.classList.remove('active');
            });
            slides[currentIndex].classList.add('active');
            // ... (active dot updates) ...
            dots.forEach((dot, index) => {
                dot.classList.remove('active');
            });
            if (dots[currentIndex]) {
                dots[currentIndex].classList.add('active');
            }
        }

        // --- Navigation Functions (goToSlide, etc. - UNCHANGED) ---
        function goToSlide(index) {
            console.log('goToSlide called with index:', index);
            if (index < 0 || index >= slides.length) {
                console.warn("Attempted to go to an invalid slide index:", index);
                return;
            }
            currentIndex = index;
            updateCarousel();
        }

        // --- Event Listeners for Buttons and Dots (UNCHANGED) ---
        if (prevBtn) { prevBtn.addEventListener('click', () => { console.log('Prev button clicked.'); goToSlide((currentIndex === 0) ? slides.length - 1 : currentIndex - 1); }); }
        if (nextBtn) { nextBtn.addEventListener('click', () => { console.log('Next button clicked.'); goToSlide((currentIndex === slides.length - 1) ? 0 : currentIndex + 1); }); }
        if (dots.length > 0) {
            dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    console.log('Dot clicked. Data index:', e.target.dataset.index);
                    const index = parseInt(e.target.dataset.index);
                    goToSlide(index);
                });
            });
        }
        if (slides.length > 0) {
            slides.forEach(slide => {
                slide.addEventListener('click', () => {
                    const clickedIndex = parseInt(slide.dataset.index);
                    console.log('Slide clicked! Data index:', clickedIndex);
                    goToSlide(clickedIndex);
                });
            });
        }

        // --- DRAG / MOUSE SCROLL FUNCTIONALITY ---
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;
        let velocity = 0;
        let lastPosition = 0;
        let lastTime = 0;
        const friction = 0.99; // Adjust: Higher = slower deceleration. Try 0.94-0.98
        const minVelocity = 0.1; // Reduced this, as it might be stopping too early. Try 0.1-0.5


        // Helper to get current transform X value
        function getTranslateX(element) {
            const style = window.getComputedStyle(element);
            const matrix = new DOMMatrixReadOnly(style.transform);
            return matrix.m41;
        }

        function touchStart(event) {
            console.log('Drag started');
            carouselTrack.style.transition = 'none'; // CRUCIAL: Disable CSS transition
            isDragging = true;
            startPos = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
            prevTranslate = getTranslateX(carouselTrack);
            lastPosition = startPos;
            lastTime = Date.now();
            velocity = 0;
            cancelAnimationFrame(animationID); // Stop any ongoing animation
        }

        function touchMove(event) {
            if (!isDragging) return;
            event.preventDefault(); // Prevent default browser scroll/drag
            // If dragging, prevent click events from firing (for image clicks after drag)
            container.classList.add('is-dragging'); // Add class to manage drag state (can also be for cursor style)


            const currentPosition = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
            const currentTime = Date.now();
            const deltaX = currentPosition - startPos;
            currentTranslate = prevTranslate + deltaX;

            const moveDelta = currentPosition - lastPosition;
            const timeDelta = currentTime - lastTime;
            if (timeDelta > 0) {
                 velocity = moveDelta / timeDelta; // Pixels per millisecond
            }

            lastPosition = currentPosition;
            lastTime = currentTime;

            const trackWidth = carouselTrack.scrollWidth;
            const containerWidth = container.offsetWidth;
            const maxTranslateX = 0;
            const minTranslateX = containerWidth - trackWidth;

            // Apply a "pull-back" effect if dragging past ends
            if (currentTranslate > maxTranslateX + 50) {
                currentTranslate = maxTranslateX + 50 + (currentTranslate - (maxTranslateX + 50)) * 0.1;
            } else if (currentTranslate < minTranslateX - 50) {
                currentTranslate = minTranslateX - 50 + (currentTranslate - (minTranslateX - 50)) * 0.1;
            }

            carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
        }

        function touchEnd(event) {
            console.log('Drag ended. Final velocity:', velocity);
            isDragging = false;
            // Remove the is-dragging class
            setTimeout(() => { // Small timeout to allow potential click event to be suppressed
                container.classList.remove('is-dragging');
            }, 50);


            const trackWidth = carouselTrack.scrollWidth;
            const containerWidth = container.offsetWidth;
            const maxTranslateX = 0;
            const minTranslateX = containerWidth - trackWidth;

            // Handle immediate snap if overshot
            if (currentTranslate > maxTranslateX) {
                currentTranslate = maxTranslateX;
                velocity = 0;
                carouselTrack.style.transition = 'transform 0.3s ease-out'; // Smooth snap back
                carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
                snapToNearestSlide();
                return;
            } else if (currentTranslate < minTranslateX) {
                currentTranslate = minTranslateX;
                velocity = 0;
                carouselTrack.style.transition = 'transform 0.3s ease-out'; // Smooth snap back
                carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
                snapToNearestSlide();
                return;
            }

            // If within bounds, start deceleration
            if (Math.abs(velocity) > minVelocity) {
                animationID = requestAnimationFrame(animation);
            } else {
                snapToNearestSlide(); // If very slow, just snap
            }
        }

        function animation() {
            if (isDragging) {
                cancelAnimationFrame(animationID); // Ensure it stops if drag starts during animation
                return;
            }

            currentTranslate += velocity * 16.66; // Pixels per frame (velocity is px/ms, 16.66ms/frame)
            velocity *= friction; // Apply friction

            const trackWidth = carouselTrack.scrollWidth;
            const containerWidth = container.offsetWidth;
            const maxTranslateX = 0;
            const minTranslateX = containerWidth - trackWidth;

            // Constrain during deceleration
            if (currentTranslate > maxTranslateX) {
                currentTranslate = maxTranslateX;
                velocity = 0; // Stop
            }
            if (currentTranslate < minTranslateX) {
                currentTranslate = minTranslateX;
                velocity = 0; // Stop
            }

            // Stop animation if velocity is too low or we hit boundaries
            if (Math.abs(velocity) < minVelocity) {
                cancelAnimationFrame(animationID);
                snapToNearestSlide();
                return;
            }

            // CRUCIAL: Ensure transition is 'none' during deceleration
            carouselTrack.style.transition = 'none';
            carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
            animationID = requestAnimationFrame(animation);
        }

        function snapToNearestSlide() {
            console.log('Snapping to nearest slide...');
            // This function will eventually call updateCarousel, which enables transition
            // So we don't need to enable transition here immediately
            // carouselTrack.style.transition = 'transform 0.3s ease-out'; // This was potentially conflicting

            const currentTrackTranslateX = getTranslateX(carouselTrack);

            let closestIndex = currentIndex;
            let minDiff = Infinity;

            slides.forEach((slide, index) => {
                const slideRect = slide.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect(); // Get container's rect for consistent center

                const slideCenterRelativeToTrack = slide.offsetLeft + (slideRect.width / 2);

                const desiredTranslateX = (containerRect.width / 2) - slideCenterRelativeToTrack;

                const diff = Math.abs(currentTrackTranslateX - desiredTranslateX);

                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = index;
                }
            });

            if (closestIndex !== currentIndex) {
                goToSlide(closestIndex);
            } else {
                 updateCarousel(); // Re-center current slide, will apply transition
            }
        }


        // Attach Mouse and Touch listeners
        carouselTrack.addEventListener('mousedown', touchStart);
        document.addEventListener('mouseup', touchEnd); // Listen on document
        carouselTrack.addEventListener('mouseleave', (event) => {
            if (isDragging) touchEnd(event);
        });
        carouselTrack.addEventListener('mousemove', touchMove);

        carouselTrack.addEventListener('touchstart', touchStart);
        carouselTrack.addEventListener('touchend', touchEnd);
        carouselTrack.addEventListener('touchcancel', touchEnd);
        carouselTrack.addEventListener('touchmove', touchMove);

        // Prevent dragging images from starting native drag behavior / prevent clicks immediately after drag
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) img.ondragstart = () => false;
            // Prevent click event on slide if it was a drag
            slide.addEventListener('click', (e) => {
                // If a drag just happened (checked via a class), prevent click
                if (container.classList.contains('is-dragging')) {
                    e.preventDefault();
                    e.stopPropagation(); // Stop propagation to prevent parent clicks
                } else {
                    const clickedIndex = parseInt(slide.dataset.index);
                    console.log('Slide clicked! Data index:', clickedIndex);
                    goToSlide(clickedIndex);
                }
            }, true); // Use capture phase for the click event
        });


        // Initial carousel update
        updateCarousel();
    });
};
document.addEventListener('DOMContentLoaded', () => {

    const carouselContainer = document.querySelector('.carousel-container');
    const track = document.querySelector('.carousel-track');
    const nextButton = document.querySelector('.next-arrow');
    const prevButton = document.querySelector('.prev-arrow');
    const nav = document.querySelector('.carousel-nav');

    // --- STATE MANAGEMENT ---
    let slides = Array.from(track.children);
    let slideOffsets;
    let totalPages;
    const slidesPerPage = 3; // Or your desired number
    let currentPage = 0;
    
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    
    let activeSlide = null;
    let isLandscape = false;
    
    // --- CORE SETUP ---
    const initializeCarousel = () => {
        // Clear any previous state
        nav.innerHTML = '';
        track.style.transition = 'none';
        track.style.transform = 'translate(0, 0)';
        currentPage = 0;
        currentTranslate = 0;
        prevTranslate = 0;

        checkOrientation();
        slides = Array.from(track.children); // Re-query slides
        
        waitForImages().then(() => {
            calculateDimensions();
            // Total pages calculation is simpler now
            totalPages = Math.ceil(slides.length / slidesPerPage);
            
            createNavDots();
            updateNav();
            updateButtonStates(); // Set initial button state
            setupIntersectionObserver();
            addEventListeners();
        }).catch(err => {
            console.error("Error waiting for images:", err);
        });
    };

    const checkOrientation = () => {
        isLandscape = window.matchMedia("(orientation: landscape)").matches;
        prevButton.innerHTML = isLandscape ? prevButton.dataset.verticalIcon : prevButton.dataset.horizontalIcon;
        nextButton.innerHTML = isLandscape ? nextButton.dataset.verticalIcon : nextButton.dataset.horizontalIcon;
    };

    const calculateDimensions = () => {
        let offset = 0;
        slideOffsets = slides.map(slide => {
            const currentOffset = offset;
            const rect = slide.getBoundingClientRect();
            const margin = isLandscape ? 4 : 20;
            offset += (isLandscape ? rect.height : rect.width) + margin;
            return currentOffset;
        });
    };

    // --- NAVIGATION & MOVEMENT ---
    const moveToPage = (pageIndex) => {
        // Boundary check: Do not move if the page is out of bounds
        if (pageIndex < 0 || pageIndex >= totalPages) {
            return;
        }

        currentPage = pageIndex;
        // Find the offset of the first slide of the target page
        const targetIndex = currentPage * slidesPerPage;
        if (targetIndex >= slideOffsets.length) return; // Safeguard

        currentTranslate = -slideOffsets[targetIndex];
        setTrackPositionWithAnimation();
        updateNav();
        updateButtonStates();
    };
    
    // NEW: Function to disable/enable arrow buttons
    const updateButtonStates = () => {
        prevButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage === totalPages - 1;
    };

    const setTrackPosition = () => {
        const transformValue = isLandscape ? `translateY(${currentTranslate}px)` : `translateX(${currentTranslate}px)`;
        track.style.transform = transformValue;
    };

    const setTrackPositionWithAnimation = () => {
        track.style.transition = 'transform 0.5s ease-out';
        setTrackPosition();
    };

    const updateNav = () => {
        Array.from(nav.children).forEach((dot, index) => {
            dot.classList.toggle('is-active', index === currentPage);
        });
    };
    
    const createNavDots = () => {
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.addEventListener('click', () => moveToPage(i));
            nav.appendChild(dot);
        }
    };
    
    // --- DRAG/SWIPE LOGIC ---
    const getPosition = (e) => isLandscape 
        ? (e.type.includes('mouse') ? e.pageY : e.touches[0].clientY)
        : (e.type.includes('mouse') ? e.pageX : e.touches[0].clientX);

    const dragStart = (e) => {
        isDragging = true;
        startPos = getPosition(e);
        prevTranslate = currentTranslate;
        animationID = requestAnimationFrame(animation);
        track.style.transition = 'none';
    };

    const dragMove = (e) => {
        if (isDragging) {
            const currentPosition = getPosition(e);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    };

    const dragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animationID);
        const movedBy = currentTranslate - prevTranslate;

        // Snap to the next or previous page, respecting boundaries
        if (movedBy < -100 && currentPage < totalPages - 1) {
            moveToPage(currentPage + 1);
        } else if (movedBy > 100 && currentPage > 0) {
            moveToPage(currentPage - 1);
        } else {
            // Snap back to the current page if not dragged far enough
            moveToPage(currentPage);
        }
    };

    const animation = () => {
        setTrackPosition();
        if (isDragging) requestAnimationFrame(animation);
    };

    // --- EVENT HANDLERS & OBSERVERS ---
    const addEventListeners = () => {
        prevButton.onclick = () => moveToPage(currentPage - 1);
        nextButton.onclick = () => moveToPage(currentPage + 1);
        track.onmousedown = dragStart;
        track.ontouchstart = dragStart;
        track.onmousemove = dragMove;
        track.ontouchmove = dragMove;
        document.onmouseup = dragEnd;
        document.ontouchend = dragEnd;
        track.onmouseleave = () => isDragging && dragEnd();
        
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) img.addEventListener('click', handleSlideClick);
        });
    };

    const handleSlideClick = (e) => {
        e.stopPropagation(); 
        const clickedSlide = e.currentTarget.closest('.carousel-slide');
        if(activeSlide) activeSlide.classList.remove('is-active');
        activeSlide = (activeSlide === clickedSlide) ? null : clickedSlide;
        if(activeSlide) activeSlide.classList.add('is-active');
    };

    const setupIntersectionObserver = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('is-visible', entry.isIntersecting);
                if (activeSlide && entry.target === activeSlide && !entry.isIntersecting) {
                    activeSlide.classList.remove('is-active');
                    activeSlide = null;
                }
            });
        }, { root: carouselContainer, threshold: 0.1 });
        slides.forEach(slide => observer.observe(slide));
    };
    
    // --- START & RESIZE ---
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        // A full rebuild is still the most reliable way to handle orientation changes
        resizeTimer = setTimeout(initializeCarousel, 250);
    });

    const waitForImages = () => {
        const images = Array.from(track.querySelectorAll('img'));
        const promises = images.map(img => {
            return new Promise((resolve, reject) => {
                if (img.complete) return resolve();
                img.onload = resolve;
                img.onerror = reject;
            });
        });
        return Promise.all(promises);
    };

    // Initial call to set everything up
    initializeCarousel();
});
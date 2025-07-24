(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", () => {
    const carouselContainers = document.querySelectorAll(".carousel-container");
    carouselContainers.forEach((container) => {
      const carouselTrack = container.querySelector(".carousel-track");
      let slides = Array.from(container.querySelectorAll(".carousel-slide"));
      let prevBtn = container.querySelector(".carousel-prev-btn");
      let nextBtn = container.querySelector(".carousel-next-btn");
      let dotsContainer = container.querySelector(".carousel-dots");
      let dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll(".dot")) : [];
      let currentIndex = 0;
      let slideWidth = 0;
      if (slides.length > 0) {
        slideWidth = slides[0].offsetWidth;
      }
      window.addEventListener("resize", () => {
        slideWidth = slides[0] ? slides[0].offsetWidth : 0;
        cancelAnimationFrame(animationID);
        isDragging = false;
        updateCarousel();
      });
      function updateCarousel() {
        console.log("updateCarousel called. Current index:", currentIndex);
        if (slides.length === 0) {
          console.warn("No slides to update. Exiting updateCarousel.");
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
        const desiredActiveSlideLeftInView = containerWidth / 2 - activeSlideRect.width / 2;
        let targetOffset = -(currentSlideRelativeLeft - desiredActiveSlideLeftInView);
        const trackWidth = carouselTrack.scrollWidth;
        const maxScroll = trackWidth - containerWidth;
        targetOffset = Math.max(-maxScroll, Math.min(0, targetOffset));
        carouselTrack.style.transition = "transform 0.5s ease-in-out";
        carouselTrack.style.transform = `translateX(${targetOffset}px)`;
        console.log("  Track transform set to:", carouselTrack.style.transform);
        slides.forEach((slide, index) => {
          slide.classList.remove("active");
        });
        slides[currentIndex].classList.add("active");
        dots.forEach((dot, index) => {
          dot.classList.remove("active");
        });
        if (dots[currentIndex]) {
          dots[currentIndex].classList.add("active");
        }
      }
      function goToSlide(index) {
        console.log("goToSlide called with index:", index);
        if (index < 0 || index >= slides.length) {
          console.warn("Attempted to go to an invalid slide index:", index);
          return;
        }
        currentIndex = index;
        updateCarousel();
      }
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          console.log("Prev button clicked.");
          goToSlide(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          console.log("Next button clicked.");
          goToSlide(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
        });
      }
      if (dots.length > 0) {
        dots.forEach((dot) => {
          dot.addEventListener("click", (e) => {
            console.log("Dot clicked. Data index:", e.target.dataset.index);
            const index = parseInt(e.target.dataset.index);
            goToSlide(index);
          });
        });
      }
      if (slides.length > 0) {
        slides.forEach((slide) => {
          slide.addEventListener("click", () => {
            const clickedIndex = parseInt(slide.dataset.index);
            console.log("Slide clicked! Data index:", clickedIndex);
            goToSlide(clickedIndex);
          });
        });
      }
      let isDragging = false;
      let startPos = 0;
      let currentTranslate = 0;
      let prevTranslate = 0;
      let animationID = 0;
      let velocity = 0;
      let lastPosition = 0;
      let lastTime = 0;
      const friction = 0.99;
      const minVelocity = 0.1;
      function getTranslateX(element) {
        const style = window.getComputedStyle(element);
        const matrix = new DOMMatrixReadOnly(style.transform);
        return matrix.m41;
      }
      function touchStart(event) {
        console.log("Drag started");
        carouselTrack.style.transition = "none";
        isDragging = true;
        startPos = event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;
        prevTranslate = getTranslateX(carouselTrack);
        lastPosition = startPos;
        lastTime = Date.now();
        velocity = 0;
        cancelAnimationFrame(animationID);
      }
      function touchMove(event) {
        if (!isDragging) return;
        event.preventDefault();
        container.classList.add("is-dragging");
        const currentPosition = event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;
        const currentTime = Date.now();
        const deltaX = currentPosition - startPos;
        currentTranslate = prevTranslate + deltaX;
        const moveDelta = currentPosition - lastPosition;
        const timeDelta = currentTime - lastTime;
        if (timeDelta > 0) {
          velocity = moveDelta / timeDelta;
        }
        lastPosition = currentPosition;
        lastTime = currentTime;
        const trackWidth = carouselTrack.scrollWidth;
        const containerWidth = container.offsetWidth;
        const maxTranslateX = 0;
        const minTranslateX = containerWidth - trackWidth;
        if (currentTranslate > maxTranslateX + 50) {
          currentTranslate = maxTranslateX + 50 + (currentTranslate - (maxTranslateX + 50)) * 0.1;
        } else if (currentTranslate < minTranslateX - 50) {
          currentTranslate = minTranslateX - 50 + (currentTranslate - (minTranslateX - 50)) * 0.1;
        }
        carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
      }
      function touchEnd(event) {
        console.log("Drag ended. Final velocity:", velocity);
        isDragging = false;
        setTimeout(() => {
          container.classList.remove("is-dragging");
        }, 50);
        const trackWidth = carouselTrack.scrollWidth;
        const containerWidth = container.offsetWidth;
        const maxTranslateX = 0;
        const minTranslateX = containerWidth - trackWidth;
        if (currentTranslate > maxTranslateX) {
          currentTranslate = maxTranslateX;
          velocity = 0;
          carouselTrack.style.transition = "transform 0.3s ease-out";
          carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
          snapToNearestSlide();
          return;
        } else if (currentTranslate < minTranslateX) {
          currentTranslate = minTranslateX;
          velocity = 0;
          carouselTrack.style.transition = "transform 0.3s ease-out";
          carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
          snapToNearestSlide();
          return;
        }
        if (Math.abs(velocity) > minVelocity) {
          animationID = requestAnimationFrame(animation);
        } else {
          snapToNearestSlide();
        }
      }
      function animation() {
        if (isDragging) {
          cancelAnimationFrame(animationID);
          return;
        }
        currentTranslate += velocity * 16.66;
        velocity *= friction;
        const trackWidth = carouselTrack.scrollWidth;
        const containerWidth = container.offsetWidth;
        const maxTranslateX = 0;
        const minTranslateX = containerWidth - trackWidth;
        if (currentTranslate > maxTranslateX) {
          currentTranslate = maxTranslateX;
          velocity = 0;
        }
        if (currentTranslate < minTranslateX) {
          currentTranslate = minTranslateX;
          velocity = 0;
        }
        if (Math.abs(velocity) < minVelocity) {
          cancelAnimationFrame(animationID);
          snapToNearestSlide();
          return;
        }
        carouselTrack.style.transition = "none";
        carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
        animationID = requestAnimationFrame(animation);
      }
      function snapToNearestSlide() {
        console.log("Snapping to nearest slide...");
        const currentTrackTranslateX = getTranslateX(carouselTrack);
        let closestIndex = currentIndex;
        let minDiff = Infinity;
        slides.forEach((slide, index) => {
          const slideRect = slide.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const slideCenterRelativeToTrack = slide.offsetLeft + slideRect.width / 2;
          const desiredTranslateX = containerRect.width / 2 - slideCenterRelativeToTrack;
          const diff = Math.abs(currentTrackTranslateX - desiredTranslateX);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = index;
          }
        });
        if (closestIndex !== currentIndex) {
          goToSlide(closestIndex);
        } else {
          updateCarousel();
        }
      }
      carouselTrack.addEventListener("mousedown", touchStart);
      document.addEventListener("mouseup", touchEnd);
      carouselTrack.addEventListener("mouseleave", (event) => {
        if (isDragging) touchEnd(event);
      });
      carouselTrack.addEventListener("mousemove", touchMove);
      carouselTrack.addEventListener("touchstart", touchStart);
      carouselTrack.addEventListener("touchend", touchEnd);
      carouselTrack.addEventListener("touchcancel", touchEnd);
      carouselTrack.addEventListener("touchmove", touchMove);
      slides.forEach((slide) => {
        const img = slide.querySelector("img");
        if (img) img.ondragstart = () => false;
        slide.addEventListener("click", (e) => {
          if (container.classList.contains("is-dragging")) {
            e.preventDefault();
            e.stopPropagation();
          } else {
            const clickedIndex = parseInt(slide.dataset.index);
            console.log("Slide clicked! Data index:", clickedIndex);
            goToSlide(clickedIndex);
          }
        }, true);
      });
      updateCarousel();
    });
  });
})();

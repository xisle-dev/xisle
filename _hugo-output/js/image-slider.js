(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", () => {
    const carouselContainers = document.querySelectorAll(".carousel-container");
    carouselContainers.forEach((container) => {
      const carouselTrack = container.querySelector(".carousel-track");
      const slides = Array.from(container.querySelectorAll(".carousel-slide"));
      const prevBtn = container.querySelector(".carousel-prev-btn");
      const nextBtn = container.querySelector(".carousel-next-btn");
      const dotsContainer = container.querySelector(".carousel-dots");
      const dots = Array.from(dotsContainer.querySelectorAll(".dot"));
      let currentIndex = 0;
      let slideWidth = slides[0].offsetWidth;
      window.addEventListener("resize", () => {
        slideWidth = slides[0].offsetWidth;
        updateCarousel();
      });
      function updateCarousel() {
        let offset = 0;
        if (window.innerWidth <= 1024) {
          offset = -currentIndex * slideWidth;
        } else {
          const containerWidth = container.offsetWidth;
          const activeSlide = slides[currentIndex];
          const activeSlideLeft = activeSlide.offsetLeft;
          const activeSlideWidth = activeSlide.offsetWidth;
          offset = -(activeSlideLeft - containerWidth / 2 + activeSlideWidth / 2);
        }
        carouselTrack.style.transform = `translateX(${offset}px)`;
        slides.forEach((slide, index) => {
          slide.classList.remove("active");
        });
        slides[currentIndex].classList.add("active");
        dots.forEach((dot, index) => {
          dot.classList.remove("active");
        });
        dots[currentIndex].classList.add("active");
      }
      function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
      }
      prevBtn.addEventListener("click", () => {
        currentIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
        updateCarousel();
      });
      nextBtn.addEventListener("click", () => {
        currentIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
        updateCarousel();
      });
      dots.forEach((dot) => {
        dot.addEventListener("click", (e) => {
          const index = parseInt(e.target.dataset.index);
          goToSlide(index);
        });
      });
      updateCarousel();
    });
  });
})();

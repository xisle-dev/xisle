(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", () => {
    const sliderTrack = document.querySelector(".slider-track");
    const sliderImages = document.querySelectorAll(".slider-image");
    const leftArrow = document.querySelector(".slider-arrow-left");
    const rightArrow = document.querySelector(".slider-arrow-right");
    const dotsContainer = document.querySelector(".slider-dots");
    const imageWidth = 300;
    const updateActiveDot = () => {
      const currentScroll = sliderTrack.scrollLeft;
      const index = Math.round(currentScroll / imageWidth);
      document.querySelectorAll(".dot").forEach((dot, i) => {
        if (i === index) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    };
    updateActiveDot();
    sliderTrack.addEventListener("scroll", () => {
      updateActiveDot();
    });
    leftArrow.addEventListener("click", () => {
      sliderTrack.scrollBy({
        left: -imageWidth,
        behavior: "smooth"
      });
    });
    rightArrow.addEventListener("click", () => {
      sliderTrack.scrollBy({
        left: imageWidth,
        behavior: "smooth"
      });
    });
    if (dotsContainer) {
      dotsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("dot")) {
          const index = parseInt(event.target.dataset.index);
          sliderTrack.scrollTo({
            left: index * imageWidth,
            behavior: "smooth"
          });
        }
      });
    }
    sliderImages.forEach((image) => {
      image.addEventListener("click", (event) => {
        const imageIndex = parseInt(event.target.dataset.index);
        const scrollLeftPosition = imageIndex * imageWidth;
        const viewportCenter = sliderTrack.offsetWidth / 2;
        const imageCenter = imageWidth / 2;
        const scrollOffset = scrollLeftPosition - viewportCenter + imageCenter;
        sliderTrack.scrollTo({
          left: scrollOffset,
          behavior: "smooth"
        });
      });
    });
  });
})();

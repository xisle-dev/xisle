import type { FC } from 'hono/jsx'

export const NavView: FC<{ areas: { id: string, title: string, image: string }[] }> = (props: { areas: { id: string, title: string, image: string }[] }) => {
  return (
    <div class="swiper mySwiper bg-blue bg-opacity-90 backdrop-blur-sm p-1"  >
      <div id="nav" class="swiper-wrapper" hx-get="/areas/slides.html" hx-swap="innerHTML" hx-trigger="load">
      </div>
      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
      <div class="swiper-scrollbar"></div>
    </div>
  )
};

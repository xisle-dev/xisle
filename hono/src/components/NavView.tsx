import type { FC } from 'hono/jsx'

export const NavView: FC<{ areas: { id: string, title: string, image: string }[] }> = (props: { areas: { id: string, title: string, image: string }[] }) => {
  return (
    <div class="glide bg-blue bg-opacity-90 backdrop-blur-sm p-1">
      <div class="glide__track" data-glide-el="track">
        <ul id="nav" class="glide__slides" hx-get="/areas/slides.html" hx-swap="innerHTML" hx-trigger="load" >
        </ul>
      </div>
      <div class="glide__arrows" data-glide-el="controls">
        <button class="glide__arrow glide__arrow--left" data-glide-dir="<">prev</button>
        <button class="glide__arrow glide__arrow--right" data-glide-dir=">">next</button>
      </div>
    </div>
  )
};

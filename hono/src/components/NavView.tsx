import type { FC } from 'hono/jsx'

export const NavView: FC<{ areas: { id: string, title: string, image: string }[] }> = (props: { areas: { id: string, title: string, image: string }[] }) => {
  return (
    <div class="glide bg-blue bg-opacity-90 backdrop-blur-sm p-1">
      <div class="glide__track" data-glide-el="track">
        <ul class="glide__slides">
        {props.areas.map((area) => {
            var image =  "/images/" + area.image;
            var summary =  "/areas/" + area.id + "/summary.html"
            console.log( summary );
            console.log( image );
            return (<li class="glide__slide" hx-get={ summary } hx-target="#htmlSummaryContainer">
              <div class="image-container">
                <img src={ image } alt={ area.title }/>
                <div class="image-label">{ area.title }</div>
              </div>
            </li>)
          })

          }
        </ul>
      </div>
      <div class="glide__arrows" data-glide-el="controls">
        <button class="glide__arrow glide__arrow--left" data-glide-dir="<">prev</button>
        <button class="glide__arrow glide__arrow--right" data-glide-dir=">">next</button>
      </div>
    </div>
  )
};

import type { FC } from 'hono/jsx'
import { InfoView } from './InfoView'
import { NavView } from './NavView';

export const MapView: FC<{ pin: string }> = (props: { pin: string }) => {
    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Cesium Map with Floating Info Div</title>
                <script src="https://cesium.com/downloads/cesiumjs/releases/1.117/Build/Cesium/Cesium.js"></script>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://cesium.com/downloads/cesiumjs/releases/1.117/Build/Cesium/Widgets/widgets.css" rel="stylesheet" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>
                <link href="/css/custom.css" rel="stylesheet" />
                <script src="https://unpkg.com/htmx.org@1.9.12"></script>
                <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
                <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/Glide.js/3.6.0/glide.min.js"></script>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
                />
                <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Glide.js/3.6.0/css/glide.core.min.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Glide.js/3.6.0/css/glide.theme.min.css" />
                <script src="/js/map.js"></script>

            </head>
            <body class="bg-gray-100 flex items-center justify-center min-h-screen">
            <div class="relative w-full h-screen">
                <div id="cesiumContainer" class="absolute inset-0"></div>
                    {/* { a = [ 
                            {  id: "stinky-fish",  title: "Stinky Fish", image: "place-holder.jpg"}, 
                            {  id: "mount-prevost",  title: "Mount Prevost", image: "place-holder.jpg" },
                            {  id: "hill-60",  title: "Hill 60", image: "place-holder.jpg" },
                            {  id: "malahat",  title: "Malahat", image: "Malahat/malahat-1.jpg" },
                            {  id: "alberni",  title: "Port Alberni", image: "place-holder.jpg" },
                            {  id: "comox-lake",  title: "Comox Lake", image: "place-holder.jpg"},
                            {  id: "comox-bluffs",  title: "Comox Bluffs", image: "place-holder.jpg" },
                            {  id: "vic-peak",  title: "Victoria Peak", image: "Victoria Peak/vic-peak-1.jpg" },
                            {  id: "forbidden",  title: "Forbidden Plateau", image: "Forbidden Plateau/forbidden-1.jpg" },
                            {  id: "kitchener",  title: "Mount Kitchener", image: "place-holder.jpg" },
                            {  id: "bluff-mountain",  title: "Bluff Mountain", image: "place-holder.jpg" },
                            {  id: "dallas-road",  title: "Bluff Mountain", image: "place-holder.jpg" },
                            {  id: "kinsol",  title: "Lois Lake", image: "place-holder.jpg" }
                        ]
                    } */}
            <NavView areas={[]} />
            <div class="absolute top-10 left-4 md:top-40 md:left-8 bg-white bg-opacity-90 backdrop-blur-sm
                        p-4 md:p-6 rounded-lg shadow-xl
                        max-w-xs md:max-w-sm lg:max-w-md
                        z-10
                        border border-gray-200
                        transform transition-all duration-300 ease-in-out
                        hover:scale-[1.01]" hx-history-elt hx-get="/pin" hx-target="#list" hx-trigger="load">
                        <div class="text-lg font-semibold mb-2">Pin List</div>
                        <div id="list" class="space-y-2" hx-boost="true" hx-target="#info">
                        </div>
                        <div id="htmlSummaryContainer" class="mt-4">
                            <div id="htmlSummary" class="text-sm text-gray-600"></div>

                        </div>
                        <div class="mt-4 text-xs md:text-sm text-gray-600">
                            <p><strong>Latitude:</strong> <span id="latitude">N/A</span></p>
                            <p><strong>Longitude:</strong> <span id="longitude">N/A</span></p>
                            <p><strong>Altitude:</strong> <span id="altitude">N/A</span></p>
                        </div>
                    </div>
                </div>

                <script>
                </script>
            </body>
        </html >
    )
};
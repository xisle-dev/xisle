import type { FC } from 'hono/jsx'
import { InfoView } from './InfoView'

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
                <link href="/css/custom.css" rel="stylesheet" />
                <script src="https://unpkg.com/htmx.org@1.9.12"></script>
                <script src="/js/map.js"></script>
            </head>
            <body class="bg-gray-100 flex items-center justify-center min-h-screen">
                <div class="relative w-full h-screen">
                    <div id="cesiumContainer" class="absolute inset-0"></div>
                    <div class="absolute top-4 left-4 md:top-8 md:left-8 bg-white bg-opacity-90 backdrop-blur-sm
                        p-4 md:p-6 rounded-lg shadow-xl
                        max-w-xs md:max-w-sm lg:max-w-md
                        z-10
                        border border-gray-200
                        transform transition-all duration-300 ease-in-out
                        hover:scale-[1.01]" hx-history-elt hx-get="/proxy/pin" hx-target="#list" hx-trigger="load">
                        <div class="text-lg font-semibold mb-2">Pin List</div>
                        <div id="list" class="space-y-2" hx-boost="true" hx-target="#info">
                        </div>
                        <div id="info" >
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
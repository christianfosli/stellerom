import { PageProps } from "fresh";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>app</title>
        <link rel="stylesheet" href="/styles.css" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@2.0.0-alpha/dist/leaflet.css"
          crossorigin=""
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.fullscreen@4.0.0/Control.FullScreen.css"
        />
        {
          // ^ Currently (Apr 25) fresh doesn't support importing (css) resources
          // from npm packages, therefore the above two links uses different sources
          // than the packages as specified in deno.json
          // See https://github.com/denoland/fresh/issues/2115
        }
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}

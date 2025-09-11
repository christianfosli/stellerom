import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

// Note: The above imports error on Deno 2.5.x, but they work with Vite.
// work-around: add to excludes in deno.json

import { Icon } from "leaflet";

/**
 * Make leaflet marker icons work with Vite x Fresh
 */
export function fixMarkerIcons() {
  // @ts-ignore: adjusting private fn to fix error related to SSR
  delete Icon.Default.prototype._getIconUrl;

  Icon.Default.mergeOptions({
    iconRetinaUrl: markerIconRetinaUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
  });
}

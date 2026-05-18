import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import AttributePopup from "./AttributePopup.jsx";
import {
  buildGetFeatureInfoUrl,
  buildWmsTileOptions,
  buildWmsUrl,
} from "../config/geoserver.js";
import { INITIAL_VIEW } from "../config/layers.js";

function getMapBbox(map) {
  const bounds = map.getBounds();
  const southWest = map.options.crs.project(bounds.getSouthWest());
  const northEast = map.options.crs.project(bounds.getNorthEast());
  return [southWest.x, southWest.y, northEast.x, northEast.y];
}

function GeoServerWmsLayer({ layer, onLayerError }) {
  const map = useMap();

  useEffect(() => {
    if (!layer.visible) return undefined;

    const wmsLayer = L.tileLayer.wms(buildWmsUrl(layer), {
      ...buildWmsTileOptions(layer),
      opacity: layer.opacity,
      pane: "overlayPane",
    });

    wmsLayer.on("tileerror", () => {
      onLayerError(layer.id, "No se pudo cargar desde GeoServer.");
    });

    wmsLayer.addTo(map);

    return () => {
      wmsLayer.off("tileerror");
      map.removeLayer(wmsLayer);
    };
  }, [layer, map, onLayerError]);

  return null;
}

function FeatureInfoHandler({ layers }) {
  const [popup, setPopup] = useState(null);
  const queryableLayers = useMemo(
    () => layers.filter((layer) => layer.visible && layer.service === "wms" && layer.queryable),
    [layers],
  );

  const map = useMapEvents({
    click: async (event) => {
      if (queryableLayers.length === 0) {
        setPopup(null);
        return;
      }

      const point = map.latLngToContainerPoint(event.latlng);
      const size = map.getSize();
      const url = buildGetFeatureInfoUrl({
        layers: queryableLayers,
        bbox: getMapBbox(map),
        width: size.x,
        height: size.y,
        x: point.x,
        y: point.y,
      });

      if (!url) return;

      setPopup({ position: event.latlng, loading: true, error: "", features: [] });

      try {
        const response = await fetch(url);
        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(`GeoServer respondió con estado ${response.status}.`);
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error("GeoServer no devolvió JSON para GetFeatureInfo.");
        }

        setPopup({
          position: event.latlng,
          loading: false,
          error: "",
          features: Array.isArray(data.features) ? data.features : [],
        });
      } catch (error) {
        setPopup({
          position: event.latlng,
          loading: false,
          error: error.message || "No se pudo consultar la información.",
          features: [],
        });
      }
    },
  });

  return <AttributePopup popup={popup} />;
}

export default function Map2D({ layers, onLayerError }) {
  const baseLayers = layers.filter((layer) => layer.service === "tile" && layer.visible);
  const wmsLayers = layers.filter((layer) => layer.service === "wms");

  return (
    <MapContainer
      className="map-canvas"
      center={INITIAL_VIEW.center}
      zoom={INITIAL_VIEW.zoom}
      zoomControl
      preferCanvas
    >
      {baseLayers.map((layer) => (
        <TileLayer
          key={layer.id}
          url={layer.url}
          attribution={layer.attribution}
          opacity={layer.opacity}
        />
      ))}

      {wmsLayers.map((layer) => (
        <GeoServerWmsLayer key={layer.id} layer={layer} onLayerError={onLayerError} />
      ))}

      <FeatureInfoHandler layers={layers} />
    </MapContainer>
  );
}

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

function getNiceScaleDistance(rawKilometers) {
  if (!Number.isFinite(rawKilometers) || rawKilometers <= 0) return 0;

  const exponent = Math.floor(Math.log10(rawKilometers));
  const magnitude = 10 ** exponent;
  const normalized = rawKilometers / magnitude;

  if (normalized >= 5) return 5 * magnitude;
  if (normalized >= 2) return 2 * magnitude;
  return magnitude;
}

function formatScaleLabel(kilometers) {
  if (kilometers < 1) return `${kilometers.toFixed(1)} km`;
  return `${Math.round(kilometers)} km`;
}

function getMapScale(map) {
  const maxWidth = 120;
  const size = map.getSize();
  const anchorY = Math.max(size.y - 24, 0);
  const start = map.containerPointToLatLng([0, anchorY]);
  const end = map.containerPointToLatLng([maxWidth, anchorY]);
  const rawKilometers = start.distanceTo(end) / 1000;
  const kilometers = getNiceScaleDistance(rawKilometers);

  if (!kilometers || !Number.isFinite(rawKilometers) || rawKilometers <= 0) {
    return { width: 80, label: "0 km" };
  }

  return {
    width: Math.max(36, Math.round((kilometers / rawKilometers) * maxWidth)),
    label: formatScaleLabel(kilometers),
  };
}

function MapScale() {
  const [scale, setScale] = useState({ width: 100, label: "0 km" });

  const map = useMapEvents({
    moveend: () => setScale(getMapScale(map)),
    resize: () => setScale(getMapScale(map)),
    zoomend: () => setScale(getMapScale(map)),
  });

  useEffect(() => {
    setScale(getMapScale(map));
  }, [map]);

  return (
    <div className="map-scale" aria-label={`Escala ${scale.label}`}>
      <span>{scale.label}</span>
      <div style={{ width: `${scale.width}px` }} />
    </div>
  );
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
    <div className="map-perspective">
      <MapContainer
        className="map-canvas"
        center={INITIAL_VIEW.center}
        zoom={INITIAL_VIEW.zoom}
        zoomControl
        preferCanvas
      >
        {baseLayers.map((layer) => {
          const tileOptions = {
            attribution: layer.attribution,
            opacity: layer.opacity,
          };

          if (layer.subdomains) tileOptions.subdomains = layer.subdomains;
          if (layer.maxZoom) tileOptions.maxZoom = layer.maxZoom;

          return <TileLayer key={layer.id} url={layer.url} {...tileOptions} />;
        })}

        {wmsLayers.map((layer) => (
          <GeoServerWmsLayer key={layer.id} layer={layer} onLayerError={onLayerError} />
        ))}

        <MapScale />
        <FeatureInfoHandler layers={layers} />
      </MapContainer>
    </div>
  );
}

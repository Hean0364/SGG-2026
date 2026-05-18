import { useEffect, useMemo, useRef } from "react";
import {
  Cartesian3,
  EllipsoidTerrainProvider,
  Ion,
  UrlTemplateImageryProvider,
  Viewer,
  WebMapServiceImageryProvider,
  createWorldTerrainAsync,
} from "cesium";
import { buildWmsTileOptions, buildWmsUrl } from "../config/geoserver.js";
import { INITIAL_VIEW } from "../config/layers.js";

export default function Map3D({ layers, onLayerError }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const baseImageryLayerRef = useRef(null);
  const imageryLayerRefs = useRef(new Map());

  const baseTileLayer = useMemo(() => layers.find((layer) => layer.service === "tile"), [layers]);
  const visibleWmsLayers = useMemo(
    () => layers.filter((layer) => layer.service === "wms" && layer.visible),
    [layers],
  );

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return undefined;

    const baseLayer = new UrlTemplateImageryProvider({
      url:
        baseTileLayer?.url ||
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maximumLevel: 19,
      credit: baseTileLayer?.attribution || "Tiles &copy; Esri",
    });

    const viewer = new Viewer(containerRef.current, {
      imageryProvider: baseLayer,
      terrainProvider: new EllipsoidTerrainProvider(),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      timeline: false,
      animation: false,
      fullscreenButton: false,
      navigationHelpButton: false,
      selectionIndicator: false,
      infoBox: false,
    });

    baseImageryLayerRef.current = viewer.imageryLayers.get(0);

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        INITIAL_VIEW.cesiumDestination.longitude,
        INITIAL_VIEW.cesiumDestination.latitude,
        INITIAL_VIEW.cesiumDestination.height,
      ),
      duration: 0,
    });

    viewerRef.current = viewer;

    // El globo funciona sin token. Si hay token de Cesium Ion, se activa terreno real.
    const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
    if (ionToken) {
      Ion.defaultAccessToken = ionToken;
      createWorldTerrainAsync()
        .then((terrainProvider) => {
          if (!viewer.isDestroyed()) {
            viewer.terrainProvider = terrainProvider;
          }
        })
        .catch(() => {
          // Se conserva el terreno elipsoidal si Ion no responde o el token no es válido.
        });
    }

    return () => {
      imageryLayerRefs.current.clear();
      baseImageryLayerRef.current = null;
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [baseTileLayer]);

  useEffect(() => {
    const baseImageryLayer = baseImageryLayerRef.current;
    if (!baseImageryLayer || !baseTileLayer) return;

    baseImageryLayer.show = baseTileLayer.visible;
    baseImageryLayer.alpha = baseTileLayer.opacity;
  }, [baseTileLayer]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const activeLayerIds = new Set(visibleWmsLayers.map((layer) => layer.id));

    imageryLayerRefs.current.forEach((imageryLayer, layerId) => {
      if (!activeLayerIds.has(layerId)) {
        viewer.imageryLayers.remove(imageryLayer, true);
        imageryLayerRefs.current.delete(layerId);
      }
    });

    visibleWmsLayers.forEach((layer) => {
      const existingLayer = imageryLayerRefs.current.get(layer.id);

      if (existingLayer) {
        existingLayer.alpha = layer.opacity;
        return;
      }

      try {
        const provider = new WebMapServiceImageryProvider({
          url: buildWmsUrl(layer),
          layers: buildWmsTileOptions(layer).layers,
          parameters: {
            transparent: true,
            format: layer.format || "image/png",
            tiled: true,
          },
        });

        provider.errorEvent.addEventListener(() => {
          onLayerError(layer.id, "No se pudo cargar en la vista 3D.");
        });

        const imageryLayer = viewer.imageryLayers.addImageryProvider(provider);
        imageryLayer.alpha = layer.opacity;
        imageryLayerRefs.current.set(layer.id, imageryLayer);
      } catch {
        onLayerError(layer.id, "La capa no pudo agregarse a Cesium.");
      }
    });
  }, [visibleWmsLayers, onLayerError]);

  return (
    <div className="cesium-map-wrapper">
      <div ref={containerRef} className="cesium-container" />
    </div>
  );
}

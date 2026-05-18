import { useCallback, useMemo, useState } from "react";
import { Box, Map as MapIcon } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Map2D from "../components/Map2D.jsx";
import Map3D from "../components/Map3D.jsx";
import { MAP_LAYERS } from "../config/layers.js";

function cloneInitialLayers() {
  return MAP_LAYERS.map((layer) => ({ ...layer }));
}

export default function MapView() {
  const [viewMode, setViewMode] = useState("2d");
  const [layers, setLayers] = useState(cloneInitialLayers);
  const [selectedLegendLayerId, setSelectedLegendLayerId] = useState("departamentos");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [layerErrors, setLayerErrors] = useState({});
  const [compareState, setCompareState] = useState({
    layerAId: "velocidad_viento",
    layerBId: "idoneidad_eolica",
  });

  const visibleLayerCount = useMemo(
    () => layers.filter((layer) => layer.visible && layer.service === "wms").length,
    [layers],
  );

  const updateLayer = useCallback((layerId, updater) => {
    setLayers((currentLayers) =>
      currentLayers.map((layer) => (layer.id === layerId ? updater(layer) : layer)),
    );
  }, []);

  const handleToggleLayer = useCallback(
    (layerId) => {
      updateLayer(layerId, (layer) => ({ ...layer, visible: !layer.visible }));
      setLayerErrors((current) => {
        const next = { ...current };
        delete next[layerId];
        return next;
      });
    },
    [updateLayer],
  );

  const handleOpacityChange = useCallback(
    (layerId, opacity) => {
      updateLayer(layerId, (layer) => ({ ...layer, opacity }));
    },
    [updateLayer],
  );

  const handleShowLegend = useCallback((layerId) => {
    if (!layerId) return;
    setSelectedLegendLayerId(layerId);
  }, []);

  const handleCompareLayerChange = useCallback((slot, layerId) => {
    setCompareState((current) => ({ ...current, [slot]: layerId }));
    if (!layerId) return;

    setLayers((currentLayers) =>
      currentLayers.map((layer) => (layer.id === layerId ? { ...layer, visible: true } : layer)),
    );
  }, []);

  const handleLayerError = useCallback((layerId, message) => {
    setLayerErrors((current) => (current[layerId] ? current : { ...current, [layerId]: message }));
  }, []);

  return (
    <section className="map-page">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        layers={layers}
        selectedLegendLayerId={selectedLegendLayerId}
        compareState={compareState}
        layerErrors={layerErrors}
        onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
        onToggleLayer={handleToggleLayer}
        onOpacityChange={handleOpacityChange}
        onShowLegend={handleShowLegend}
        onCompareLayerChange={handleCompareLayerChange}
      />

      <div className="map-workspace">
        <div className="map-toolbar">
          <div>
            <span className="toolbar-label">Vista activa</span>
            <strong>{viewMode === "2d" ? "Leaflet 2D" : "CesiumJS 3D"}</strong>
          </div>

          <div className="segmented-control" role="group" aria-label="Cambiar vista">
            <button
              type="button"
              className={viewMode === "2d" ? "active" : ""}
              onClick={() => setViewMode("2d")}
            >
              <MapIcon size={16} aria-hidden="true" />
              <span>2D</span>
            </button>
            <button
              type="button"
              className={viewMode === "3d" ? "active" : ""}
              onClick={() => setViewMode("3d")}
            >
              <Box size={16} aria-hidden="true" />
              <span>3D</span>
            </button>
          </div>

          <span className="active-layer-counter">{visibleLayerCount} WMS activas</span>
        </div>

        <div className="map-frame">
          {viewMode === "2d" ? (
            <Map2D layers={layers} onLayerError={handleLayerError} />
          ) : (
            <Map3D layers={layers} onLayerError={handleLayerError} />
          )}
        </div>
      </div>
    </section>
  );
}

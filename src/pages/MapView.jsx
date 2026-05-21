import { useCallback, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Map2D from "../components/Map2D.jsx";
import { MAP_LAYERS } from "../config/layers.js";

function cloneInitialLayers() {
  return MAP_LAYERS.map((layer) => ({ ...layer }));
}

export default function MapView() {
  const [layers, setLayers] = useState(cloneInitialLayers);
  const [selectedLegendLayerId, setSelectedLegendLayerId] = useState("departamentos");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [layerErrors, setLayerErrors] = useState({});
  const [compareState, setCompareState] = useState({
    layerAId: "velocidad_viento",
    layerBId: "idoneidad_eolica",
  });

  const updateLayer = useCallback((layerId, updater) => {
    setLayers((currentLayers) =>
      currentLayers.map((layer) => (layer.id === layerId ? updater(layer) : layer)),
    );
  }, []);

  const handleToggleLayer = useCallback(
    (layerId) => {
      setLayers((currentLayers) => {
        const selectedLayer = currentLayers.find((layer) => layer.id === layerId);

        return currentLayers.map((layer) => {
          if (selectedLayer?.service === "tile" && layer.service === "tile") {
            return { ...layer, visible: layer.id === layerId };
          }

          return layer.id === layerId ? { ...layer, visible: !layer.visible } : layer;
        });
      });
      setLayerErrors((current) => {
        const next = { ...current };
        delete next[layerId];
        return next;
      });
    },
    [],
  );

  const handleOpacityChange = useCallback(
    (layerId, opacity) => {
      updateLayer(layerId, (layer) => ({ ...layer, opacity }));
    },
    [updateLayer],
  );

  const handleDisableAllLayers = useCallback(() => {
    setLayers((currentLayers) =>
      currentLayers.map((layer) =>
        layer.service === "tile" ? layer : { ...layer, visible: false },
      ),
    );
    setLayerErrors({});
  }, []);

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
        onDisableAllLayers={handleDisableAllLayers}
        onShowLegend={handleShowLegend}
        onCompareLayerChange={handleCompareLayerChange}
      />

      <div className="map-workspace">
        <div className="map-frame">
          <Map2D layers={layers} onLayerError={handleLayerError} />
        </div>
      </div>
    </section>
  );
}

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import CompareLayers from "./CompareLayers.jsx";
import LayerPanel from "./LayerPanel.jsx";
import LegendPanel from "./LegendPanel.jsx";

export default function Sidebar({
  isCollapsed,
  layers,
  selectedLegendLayerId,
  compareState,
  layerErrors,
  onToggleCollapsed,
  onToggleLayer,
  onOpacityChange,
  onDisableAllLayers,
  onShowLegend,
  onCompareLayerChange,
}) {
  return (
    <aside className={isCollapsed ? "sidebar collapsed" : "sidebar"} aria-label="Panel GIS">
      <button
        className="sidebar-collapse-button"
        type="button"
        onClick={onToggleCollapsed}
        title={isCollapsed ? "Abrir panel" : "Cerrar panel"}
      >
        {isCollapsed ? (
          <PanelLeftOpen size={18} aria-hidden="true" />
        ) : (
          <PanelLeftClose size={18} aria-hidden="true" />
        )}
      </button>

      {!isCollapsed ? (
        <div className="sidebar-content">
          <LayerPanel
            layers={layers}
            layerErrors={layerErrors}
            onToggleLayer={onToggleLayer}
            onOpacityChange={onOpacityChange}
            onDisableAllLayers={onDisableAllLayers}
          />
          <LegendPanel
            layers={layers}
            selectedLayerId={selectedLegendLayerId}
            onSelectLayer={onShowLegend}
          />
          <CompareLayers
            layers={layers}
            compareState={compareState}
            onCompareLayerChange={onCompareLayerChange}
            onOpacityChange={onOpacityChange}
          />
        </div>
      ) : null}
    </aside>
  );
}

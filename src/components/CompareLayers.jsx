import { GitCompareArrows } from "lucide-react";
import LayerOpacityControl from "./LayerOpacityControl.jsx";

export default function CompareLayers({
  layers,
  compareState,
  onCompareLayerChange,
  onOpacityChange,
}) {
  const comparableLayers = layers.filter((layer) => layer.service === "wms");
  const layerA = layers.find((layer) => layer.id === compareState.layerAId);
  const layerB = layers.find((layer) => layer.id === compareState.layerBId);

  return (
    <section className="panel-section" aria-labelledby="compare-heading">
      <div className="section-title-row">
        <h2 id="compare-heading">Comparar</h2>
        <GitCompareArrows size={18} aria-hidden="true" />
      </div>

      <div className="compare-grid">
        <div>
          <label className="field-label" htmlFor="compare-a">
            Capa 1
          </label>
          <select
            id="compare-a"
            className="select-input"
            value={compareState.layerAId}
            onChange={(event) => onCompareLayerChange("layerAId", event.target.value)}
          >
            <option value="">Seleccionar</option>
            {comparableLayers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
          {layerA ? (
            <LayerOpacityControl
              layerId={layerA.id}
              opacity={layerA.opacity}
              onOpacityChange={onOpacityChange}
            />
          ) : null}
        </div>

        <div>
          <label className="field-label" htmlFor="compare-b">
            Capa 2
          </label>
          <select
            id="compare-b"
            className="select-input"
            value={compareState.layerBId}
            onChange={(event) => onCompareLayerChange("layerBId", event.target.value)}
          >
            <option value="">Seleccionar</option>
            {comparableLayers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
          {layerB ? (
            <LayerOpacityControl
              layerId={layerB.id}
              opacity={layerB.opacity}
              onOpacityChange={onOpacityChange}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

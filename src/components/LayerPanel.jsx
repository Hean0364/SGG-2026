import { Image, Layers, SearchX } from "lucide-react";
import { LAYER_CATEGORIES } from "../config/layers.js";
import LayerOpacityControl from "./LayerOpacityControl.jsx";

const typeLabels = {
  base: "Base",
  vector: "Vector",
  raster: "Ráster",
  analysis: "Análisis",
};

export default function LayerPanel({
  layers,
  onToggleLayer,
  onOpacityChange,
  onShowLegend,
  layerErrors = {},
}) {
  const groupedLayers = LAYER_CATEGORIES.map((category) => ({
    ...category,
    layers: layers.filter((layer) => layer.category === category.id),
  }));

  return (
    <section className="panel-section" aria-labelledby="layers-heading">
      <div className="section-title-row">
        <h2 id="layers-heading">Capas</h2>
        <Layers size={18} aria-hidden="true" />
      </div>

      <div className="layer-groups">
        {groupedLayers.map((group) => (
          <details className="layer-group" key={group.id} open>
            <summary>{group.name}</summary>
            <div className="layer-list">
              {group.layers.length === 0 ? (
                <p className="empty-state">Sin capas configuradas.</p>
              ) : (
                group.layers.map((layer) => {
                  const hasLegend = layer.service === "wms";
                  const hasError = Boolean(layerErrors[layer.id]);

                  return (
                    <article className="layer-item" key={layer.id}>
                      <div className="layer-main-row">
                        <label className="layer-toggle">
                          <input
                            type="checkbox"
                            checked={layer.visible}
                            onChange={() => onToggleLayer(layer.id)}
                          />
                          <span>{layer.name}</span>
                        </label>
                        <span className={`layer-type ${layer.type}`}>{typeLabels[layer.type]}</span>
                      </div>

                      <div className="layer-actions-row">
                        <LayerOpacityControl
                          layerId={layer.id}
                          opacity={layer.opacity}
                          disabled={!layer.visible}
                          onOpacityChange={onOpacityChange}
                        />
                        <button
                          className="icon-button"
                          type="button"
                          title={hasLegend ? "Ver leyenda" : "Sin leyenda WMS"}
                          disabled={!hasLegend}
                          onClick={() => onShowLegend(layer.id)}
                        >
                          <Image size={16} aria-hidden="true" />
                        </button>
                      </div>

                      {hasError ? (
                        <p className="layer-warning">
                          <SearchX size={14} aria-hidden="true" />
                          {layerErrors[layer.id]}
                        </p>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

import { useState } from "react";
import { EyeOff, Image, Layers, SearchX } from "lucide-react";
import { buildLegendUrl } from "../config/geoserver.js";
import { LAYER_CATEGORIES } from "../config/layers.js";
import LayerOpacityControl from "./LayerOpacityControl.jsx";

const typeLabels = {
  base: "Base",
  vector: "Vector",
  raster: "Ráster",
  analysis: "Análisis",
};

function LayerLegendDropdown({ layer, failed, onLegendError }) {
  const legendUrl = buildLegendUrl(layer);

  return (
    <details className="layer-legend">
      <summary>
        <span className="layer-legend-title">
          <Image size={15} aria-hidden="true" />
          Leyenda
        </span>
      </summary>

      <div className="layer-legend-content">
        {failed || !legendUrl ? (
          <p className="empty-state">La leyenda no esta disponible para esta capa.</p>
        ) : (
          <img
            src={legendUrl}
            alt={`Leyenda de ${layer.name}`}
            loading="lazy"
            onError={() => onLegendError(layer.id)}
          />
        )}
      </div>
    </details>
  );
}

export default function LayerPanel({
  layers,
  onToggleLayer,
  onOpacityChange,
  onDisableAllLayers,
  layerErrors = {},
}) {
  const [failedLegends, setFailedLegends] = useState({});
  const hasVisibleWmsLayers = layers.some((layer) => layer.service === "wms" && layer.visible);

  const groupedLayers = LAYER_CATEGORIES.map((category) => ({
    ...category,
    layers: layers.filter((layer) => layer.category === category.id),
  }));

  const handleLegendError = (layerId) => {
    setFailedLegends((current) => (current[layerId] ? current : { ...current, [layerId]: true }));
  };

  return (
    <section className="panel-section" aria-labelledby="layers-heading">
      <div className="section-title-row">
        <h2 id="layers-heading">Capas</h2>
        <div className="section-title-actions">
          <button
            className="text-icon-button"
            type="button"
            disabled={!hasVisibleWmsLayers}
            onClick={onDisableAllLayers}
          >
            <EyeOff size={15} aria-hidden="true" />
            <span>Desactivar todas</span>
          </button>
          <Layers size={18} aria-hidden="true" />
        </div>
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
                  const isBaseLayer = layer.service === "tile";

                  return (
                    <article
                      className={layer.visible ? "layer-item visible" : "layer-item"}
                      key={layer.id}
                    >
                      <div className="layer-main-row">
                        <label className="layer-toggle">
                          <input
                            type={isBaseLayer ? "radio" : "checkbox"}
                            name={isBaseLayer ? "base-layer" : undefined}
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
                      </div>

                      {hasLegend ? (
                        <LayerLegendDropdown
                          layer={layer}
                          failed={Boolean(failedLegends[layer.id])}
                          onLegendError={handleLegendError}
                        />
                      ) : null}

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

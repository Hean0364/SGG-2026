import { useMemo, useState } from "react";
import { ListTree } from "lucide-react";
import { buildLegendUrl } from "../config/geoserver.js";

export default function LegendPanel({ layers, selectedLayerId, onSelectLayer }) {
  const [failedLegends, setFailedLegends] = useState({});

  const wmsLayers = useMemo(() => layers.filter((layer) => layer.service === "wms"), [layers]);
  const selectedLayer =
    wmsLayers.find((layer) => layer.id === selectedLayerId) ||
    wmsLayers.find((layer) => layer.visible) ||
    wmsLayers[0];

  return (
    <section className="panel-section" aria-labelledby="legend-heading">
      <div className="section-title-row">
        <h2 id="legend-heading">Simbología</h2>
        <ListTree size={18} aria-hidden="true" />
      </div>

      <label className="field-label" htmlFor="legend-layer">
        Capa
      </label>
      <select
        id="legend-layer"
        className="select-input"
        value={selectedLayer?.id || ""}
        onChange={(event) => onSelectLayer(event.target.value)}
      >
        {wmsLayers.map((layer) => (
          <option key={layer.id} value={layer.id}>
            {layer.name}
          </option>
        ))}
      </select>

      <div className="legend-preview">
        {selectedLayer ? (
          failedLegends[selectedLayer.id] ? (
            <p className="empty-state">La simbología no está disponible para esta capa.</p>
          ) : (
            <>
              <strong>{selectedLayer.name}</strong>
              <img
                src={buildLegendUrl(selectedLayer)}
                alt={`Simbología de ${selectedLayer.name}`}
                onError={() =>
                  setFailedLegends((current) => ({ ...current, [selectedLayer.id]: true }))
                }
              />
            </>
          )
        ) : (
          <p className="empty-state">No hay capas WMS configuradas.</p>
        )}
      </div>
    </section>
  );
}

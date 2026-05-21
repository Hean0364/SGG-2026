import { Popup } from "react-leaflet";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "Sin dato";
  if (typeof value === "number") return Number.isInteger(value) ? value : value.toFixed(3);
  return String(value);
}

export default function AttributePopup({ popup }) {
  if (!popup?.position) return null;

  return (
    <Popup position={popup.position} maxWidth={360} className="attribute-popup">
      <div className="popup-content">
        <strong>Consulta de atributos</strong>

        {popup.loading ? <p>Consultando GeoServer...</p> : null}
        {popup.error ? <p className="popup-error">{popup.error}</p> : null}

        {!popup.loading && !popup.error && popup.features?.length === 0 ? (
          <p>No se encontraron atributos en las capas visibles.</p>
        ) : null}

        {!popup.loading && !popup.error
          ? popup.features?.slice(0, 4).map((feature, index) => {
              const properties = Object.entries(feature.properties || {}).slice(0, 10);

              return (
                <div className="feature-table" key={feature.id || index}>
                  <span className="feature-title">{feature.id || `Elemento ${index + 1}`}</span>
                  {properties.length === 0 ? (
                    <p>Sin atributos disponibles.</p>
                  ) : (
                    <table>
                      <tbody>
                        {properties.map(([key, value]) => (
                          <tr key={key}>
                            <th>{key}</th>
                            <td>{formatValue(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })
          : null}
      </div>
    </Popup>
  );
}

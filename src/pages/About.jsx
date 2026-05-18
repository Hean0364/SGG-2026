import { GEOSERVER_CONFIG, buildWfsUrl, buildWmsUrl } from "../config/geoserver.js";

export default function About() {
  return (
    <section className="about-page">
      <div className="content-panel">
        <span className="eyebrow">Configuración inicial</span>
        <h1>Aplicación GIS web para GeoServer</h1>
        <p>
          Esta aplicación consume capas WMS desde GeoServer, consulta atributos con
          GetFeatureInfo y deja preparada la integración WFS para selección de entidades.
        </p>

        <div className="config-table">
          <div>
            <span>GeoServer</span>
            <strong>{GEOSERVER_CONFIG.baseUrl}</strong>
          </div>
          <div>
            <span>Workspace</span>
            <strong>{GEOSERVER_CONFIG.defaultWorkspace}</strong>
          </div>
          <div>
            <span>Servicio WMS</span>
            <strong>{buildWmsUrl()}</strong>
          </div>
          <div>
            <span>Servicio WFS</span>
            <strong>{buildWfsUrl()}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

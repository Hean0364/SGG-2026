import { ArrowRight } from "lucide-react";

export default function Home({ navigate }) {
  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="hero-copy">
          <h1>GIS Energía Eólica</h1>
          <button className="primary-action" type="button" onClick={() => navigate("map")}>
            <span>Entrar al mapa</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, Home as HomeIcon, Map } from "lucide-react";
import Home from "./pages/Home.jsx";
import MapView from "./pages/MapView.jsx";

const routes = {
  home: Home,
  map: MapView,
};

function getRouteFromHash() {
  const currentHash = window.location.hash.replace("#/", "");
  return routes[currentHash] ? currentHash : "home";
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromHash);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((nextRoute) => {
    window.location.hash = `/${nextRoute}`;
    setRoute(nextRoute);
  }, []);

  const CurrentPage = useMemo(() => routes[route] ?? Home, [route]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand-button"
          type="button"
          onClick={() => navigate("home")}
          aria-label="Ir al inicio"
        >
          <Database size={21} aria-hidden="true" />
          <span>GIS Energía Eólica</span>
        </button>

        <nav className="topbar-nav" aria-label="Navegación principal">
          <button
            className={route === "home" ? "nav-button active" : "nav-button"}
            type="button"
            onClick={() => navigate("home")}
          >
            <HomeIcon size={17} aria-hidden="true" />
            <span>Inicio</span>
          </button>
          <button
            className={route === "map" ? "nav-button active" : "nav-button"}
            type="button"
            onClick={() => navigate("map")}
          >
            <Map size={17} aria-hidden="true" />
            <span>Mapa</span>
          </button>
        </nav>
      </header>

      <main className="app-main">
        <CurrentPage navigate={navigate} />
      </main>
    </div>
  );
}

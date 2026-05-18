# GIS Web GeoServer

Aplicación GIS web académica construida con React + Vite para visualizar, consultar y comparar capas geográficas publicadas desde GeoServer mediante WMS. La vista 2D usa Leaflet y la vista 3D usa CesiumJS.

## Requisitos

- Node.js 20.19 o superior, o Node.js 22.12 o superior.
- GeoServer disponible en `http://localhost:8083/geoserver`.
- Workspace inicial: `energia_eolica`.
- Capas publicadas por WMS en `http://localhost:8083/geoserver/energia_eolica/wms`.

## Instalación

```bash
npm install
npm run dev
```

Luego abre la URL que muestra Vite, normalmente:

```text
http://localhost:5173
```

## Configuración de GeoServer

La configuración general está en `src/config/geoserver.js`:

```js
export const GEOSERVER_CONFIG = {
  baseUrl: "http://localhost:8083/geoserver",
  defaultWorkspace: "energia_eolica",
};
```

Si cambias de servidor o workspace, actualiza esos valores. Las funciones del archivo construyen automáticamente las URLs WMS, WFS, GetLegendGraphic y GetFeatureInfo.

## Vista 3D y terreno

La vista 3D muestra el globo de CesiumJS sin configuración adicional. Para activar terreno real de Cesium World Terrain, crea un archivo `.env.local` con:

```text
VITE_CESIUM_ION_TOKEN=tu_token_de_cesium_ion
```

## Configuración de capas

Todas las capas editables están en `src/config/layers.js`. Para agregar una capa de GeoServer, añade un objeto con esta estructura:

```js
{
  id: "mi_capa",
  name: "Mi capa visible",
  technicalName: "mi_capa_en_geoserver",
  workspace: "energia_eolica",
  type: "vector",
  category: "vector",
  service: "wms",
  visible: false,
  opacity: 0.8,
  queryable: true,
  legendUrl: null,
}
```

Campos principales:

- `id`: identificador único usado por la aplicación.
- `name`: nombre visible en la interfaz.
- `technicalName`: nombre técnico publicado en GeoServer.
- `workspace`: workspace de GeoServer.
- `type`: `base`, `vector`, `raster` o `analysis`.
- `category`: `base`, `vector`, `raster` o `analysis`.
- `service`: usa `wms` para capas de GeoServer.
- `visible`: define si inicia activa.
- `opacity`: opacidad inicial entre `0` y `1`.
- `queryable`: permite consultar atributos con GetFeatureInfo.
- `legendUrl`: puede ser `null` para generar la leyenda automáticamente o una URL personalizada.

## Notas de operación

- La visualización usa WMS.
- La consulta de atributos usa WMS GetFeatureInfo en la vista 2D.
- La estructura deja preparado el consumo WFS para selección de entidades en futuras fases.
- Si el navegador bloquea GetFeatureInfo por CORS, habilita CORS en GeoServer o configura un proxy de desarrollo.
- La aplicación tolera capas no disponibles: los errores de teselas o consultas se muestran sin bloquear el resto del mapa.

## Estructura

```text
src/
  components/
    Sidebar.jsx
    LayerPanel.jsx
    LegendPanel.jsx
    Map2D.jsx
    Map3D.jsx
    LayerOpacityControl.jsx
    CompareLayers.jsx
    AttributePopup.jsx
  config/
    geoserver.js
    layers.js
  pages/
    Home.jsx
    MapView.jsx
    About.jsx
  styles/
    main.css
  App.jsx
  main.jsx
```

export const GEOSERVER_CONFIG = {
  baseUrl: "http://localhost:8083/geoserver",
  defaultWorkspace: "energia_eolica",
  defaultWmsVersion: "1.1.1",
  defaultCrs: "EPSG:3857",
  defaultFeatureInfoFormat: "application/json",
};

const trimSlashes = (value = "") => String(value).replace(/^\/+|\/+$/g, "");

export function getLayerWorkspace(layer) {
  return layer?.workspace || GEOSERVER_CONFIG.defaultWorkspace;
}

export function getQualifiedLayerName(layer) {
  if (!layer?.technicalName) return "";
  if (layer.technicalName.includes(":")) return layer.technicalName;
  return `${getLayerWorkspace(layer)}:${layer.technicalName}`;
}

export function buildWorkspaceServiceUrl(service, workspace = GEOSERVER_CONFIG.defaultWorkspace) {
  const baseUrl = trimSlashes(GEOSERVER_CONFIG.baseUrl);
  const cleanWorkspace = trimSlashes(workspace);
  const cleanService = trimSlashes(service).toLowerCase();

  return `${baseUrl}/${cleanWorkspace}/${cleanService}`;
}

export function buildWmsUrl(layerOrWorkspace = GEOSERVER_CONFIG.defaultWorkspace) {
  const workspace =
    typeof layerOrWorkspace === "string" ? layerOrWorkspace : getLayerWorkspace(layerOrWorkspace);
  return buildWorkspaceServiceUrl("wms", workspace);
}

export function buildWfsUrl(layerOrWorkspace = GEOSERVER_CONFIG.defaultWorkspace) {
  const workspace =
    typeof layerOrWorkspace === "string" ? layerOrWorkspace : getLayerWorkspace(layerOrWorkspace);
  return buildWorkspaceServiceUrl("wfs", workspace);
}

function buildLegendOptions(layer, options) {
  if (options.legendOptions) return options.legendOptions;
  if (layer.legendOptions) return layer.legendOptions;
  if (options.forceLegendLabels || layer.forceLegendLabels) {
    return "forceLabels:on;fontAntiAliasing:true";
  }

  return "";
}

export function buildLegendUrl(layer, options = {}) {
  if (!layer || layer.service !== "wms") return "";
  if (layer.legendUrl) return layer.legendUrl;

  const params = new URLSearchParams({
    service: "WMS",
    request: "GetLegendGraphic",
    version: GEOSERVER_CONFIG.defaultWmsVersion,
    format: options.format || "image/png",
    layer: getQualifiedLayerName(layer),
    transparent: "true",
  });

  const legendOptions = buildLegendOptions(layer, options);
  if (legendOptions) params.set("LEGEND_OPTIONS", legendOptions);
  if (layer.style) params.set("style", layer.style);
  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));

  return `${buildWmsUrl(layer)}?${params.toString()}`;
}

export function buildWmsTileOptions(layer) {
  return {
    layers: getQualifiedLayerName(layer),
    styles: layer.style || "",
    format: layer.format || "image/png",
    transparent: true,
    version: GEOSERVER_CONFIG.defaultWmsVersion,
    tiled: true,
  };
}

export function buildGetFeatureInfoUrl({
  layers,
  bbox,
  width,
  height,
  x,
  y,
  crs = GEOSERVER_CONFIG.defaultCrs,
  featureCount = 10,
}) {
  // GetFeatureInfo usa las mismas dimensiones y BBOX del mapa visible para ubicar el pixel consultado.
  const queryLayers = layers
    .filter((layer) => layer.service === "wms" && layer.queryable !== false)
    .map(getQualifiedLayerName)
    .filter(Boolean);

  if (queryLayers.length === 0) return "";

  const firstLayer = layers.find((layer) => layer.service === "wms");
  const params = new URLSearchParams({
    service: "WMS",
    version: GEOSERVER_CONFIG.defaultWmsVersion,
    request: "GetFeatureInfo",
    layers: queryLayers.join(","),
    query_layers: queryLayers.join(","),
    styles: "",
    bbox: bbox.join(","),
    width: String(width),
    height: String(height),
    srs: crs,
    x: String(Math.round(x)),
    y: String(Math.round(y)),
    info_format: GEOSERVER_CONFIG.defaultFeatureInfoFormat,
    feature_count: String(featureCount),
  });

  return `${buildWmsUrl(firstLayer)}?${params.toString()}`;
}

export function buildWfsFeatureUrl(layer, options = {}) {
  const params = new URLSearchParams({
    service: "WFS",
    version: options.version || "2.0.0",
    request: "GetFeature",
    typeNames: getQualifiedLayerName(layer),
    outputFormat: options.outputFormat || "application/json",
  });

  if (options.count) params.set("count", String(options.count));
  if (options.cqlFilter) params.set("cql_filter", options.cqlFilter);

  return `${buildWfsUrl(layer)}?${params.toString()}`;
}

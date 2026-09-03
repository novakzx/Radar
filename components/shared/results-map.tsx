"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { BusinessListItem } from "@/types/business";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// Almada / margem sul de Lisboa — centro inicial default (a busca aceita
// qualquer localização; isto é só o enquadramento inicial do mapa vazio).
const DEFAULT_CENTER: [number, number] = [-9.16, 38.68];
const DEFAULT_ZOOM = 10;

interface ResultsMapProps {
  businesses: BusinessListItem[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function ResultsMap({ businesses, selectedId, hoveredId, onSelect, onHover }: ResultsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const callbacksRef = useRef({ onSelect, onHover });

  useEffect(() => {
    callbacksRef.current = { onSelect, onHover };
  }, [onSelect, onHover]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !MAPBOX_TOKEN) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.addSource("businesses", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "businesses",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#a78bfa",
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 30, 28],
          "circle-opacity": 0.85,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "businesses",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": "#0a0a0a" },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "businesses",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match",
            ["get", "websiteFound"],
            "true",
            "#4ade80",
            "#f87171",
          ],
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#0a0a0a",
        },
      });

      map.addLayer({
        id: "highlighted-point",
        type: "circle",
        source: "businesses",
        filter: ["==", ["get", "id"], "__none__"],
        paint: {
          "circle-radius": 11,
          "circle-color": "transparent",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "clusters", (event) => {
        const features = map.queryRenderedFeatures(event.point, { layers: ["clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource("businesses") as mapboxgl.GeoJSONSource;
        if (clusterId == null) return;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const geometry = features[0].geometry;
          if (geometry.type !== "Point") return;
          map.easeTo({ center: geometry.coordinates as [number, number], zoom: zoom ?? undefined });
        });
      });

      map.on("click", "unclustered-point", (event) => {
        const id = event.features?.[0]?.properties?.id as string | undefined;
        if (id) callbacksRef.current.onSelect(id);
      });

      map.on("mousemove", "unclustered-point", (event) => {
        const id = event.features?.[0]?.properties?.id as string | undefined;
        if (id) callbacksRef.current.onHover(id);
      });
      map.on("mouseleave", "unclustered-point", () => callbacksRef.current.onHover(null));

      for (const layer of ["clusters", "unclustered-point"]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Atualiza os dados (GeoJSON) quando a lista filtrada muda.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateData = () => {
      const source = map.getSource("businesses") as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      const features = businesses
        .filter((business) => business.lat != null && business.lng != null)
        .map((business) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [business.lng as number, business.lat as number],
          },
          properties: {
            id: business.id,
            websiteFound: String(business.websiteVerification.found),
          },
        }));

      source.setData({ type: "FeatureCollection", features });

      if (features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        for (const feature of features) {
          bounds.extend(feature.geometry.coordinates as [number, number]);
        }
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 });
      }
    };

    if (map.isStyleLoaded()) {
      updateData();
    } else {
      map.once("load", updateData);
    }
  }, [businesses]);

  // Espelha a seleção/hover no mapa (destaque + fly-to na seleção).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("highlighted-point")) return;

    const highlightId = selectedId ?? hoveredId ?? "__none__";
    map.setFilter("highlighted-point", ["==", ["get", "id"], highlightId]);

    if (selectedId) {
      const business = businesses.find((b) => b.id === selectedId);
      if (business?.lat != null && business?.lng != null) {
        map.flyTo({
          center: [business.lng, business.lat],
          zoom: Math.max(map.getZoom(), 14),
          duration: 600,
        });
      }
    }
  }, [selectedId, hoveredId, businesses]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Configure NEXT_PUBLIC_MAPBOX_TOKEN para exibir o mapa.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[500px] w-full overflow-hidden rounded-lg border border-border"
    />
  );
}

// Suggested code may be subject to a license. Learn more: ~LicenseLog:712360560.

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const zoom = 15;
  const API_KEY = '8gD2qhMPVyFZdLIz6SMW';
  const style = `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`;
  const lng = -6.925144553657702;
  const lat = 33.91463173855965;
  const [position, setPosition] = useState({lng, lat})

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: style,
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    const marker = new maplibregl.Marker({color: "#FF0000"})
      .setLngLat([lng, lat])
      .addTo(map.current).setDraggable(true);
      marker.on('dragend', () => {
        setPosition(marker.getLngLat());
        console.log(position);
      });
    // return () => map.current?.remove();
  }, [API_KEY, lng, lat, zoom]);

  return <div ref={mapContainer} style={{ height: "70vh" }} ></div>;
};

export default MapView;

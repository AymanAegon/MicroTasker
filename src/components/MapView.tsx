// Suggested code may be subject to a license. Learn more: ~LicenseLog:712360560.

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Task } from "@/app/interfaces";
import { makePopup, makeCostumMarker } from "@/lib/utils";

interface MapViewProps {
  position: { lng: number, lat: number },
  setPosition: ({ lng, lat }: { lng: number, lat: number }) => void,
  draggable?: boolean,
  tasks?: Task[];
}
const MapView: React.FC<MapViewProps> = ({ position, setPosition, draggable = false, tasks = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const map = useRef<maplibregl.Map | null>(null);
  const zoom = 15;
  const API_KEY = '8gD2qhMPVyFZdLIz6SMW';
  const style = `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`;
  // const lng = -6.9219939;
  // const lat = 33.9121200;
  const [lng, setLng] = useState(position.lng);
  const [lat, setLat] = useState(position.lat);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: style,
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }).on('geolocate', (e) => {
        setLng(e.coords.longitude);
        setLat(e.coords.latitude);
      })
    );
    if (draggable) {
      const marker = new maplibregl.Marker({ color: "#FF0000" })
        .setLngLat([lng, lat])
        .addTo(map.current).setDraggable(draggable);
      marker.on('dragend', () => {
        setLng(marker.getLngLat().lng);
        setLat(marker.getLngLat().lat);
      });
    }
    // Create a popup, but don't add it to the map yet.
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    tasks.forEach(task => {
      if (!map.current || !task.position) return;

      const marker = new maplibregl.Marker({element: makeCostumMarker(task)})
        .setLngLat([task.position.lng, task.position.lat])
        .addTo(map.current);
      marker.getElement().addEventListener('click', () => {
        window.location.href = `/task/${task.id}`;
      });
      marker.getElement().addEventListener('mouseenter', () => {
        popup.setLngLat([task.position.lng, task.position.lat]).setHTML(makePopup(task)).addTo(map.current!);
      });
      marker.getElement().addEventListener('mouseleave', () => {
        popup.remove();
      });
    })
    // return () => map.current?.remove();
  }, [API_KEY, lng, lat, zoom]);
  useEffect(() => {
    if (!map.current) return;
    setPosition({ lng, lat });
  }, [lng, lat]);
  // console.log(lng, lat);

  return <div ref={mapContainer} style={{ height: "70vh" }} ></div>;
};

export default MapView;

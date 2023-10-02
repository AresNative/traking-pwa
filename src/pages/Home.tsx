import React, { useEffect, useRef, useState } from 'react';
import { Geolocation } from "@capacitor/geolocation";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents } from '@ionic-native/background-geolocation';

declare global {
  interface Window {
    google: any;
  }
}

const MapContainer: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsSdkLoaded, setGoogleMapsSdkLoaded] = useState<boolean>(
    typeof window.google === "object"
  );
  const [locations, setLocations] = useState<any[]>([]); // Almacenar ubicaciones registradas
  function loadLocations() {
    const location = localStorage.getItem("saveBackgroundGeolocation");
    const updatedLocations = [...locations, location];
    setLocations(updatedLocations);
  }
  useEffect(() => {
    const initMap = async () => {
      loadLocations()
      const coords: any = await Geolocation.getCurrentPosition();
      const position = { lat: coords.coords.latitude, lng: coords.coords.longitude };
      // Request needed libraries.
      const { Map } = await window.google.maps.importLibrary("maps");
      const { Marker } = await window.google.maps.importLibrary("marker");
      // The map, centered at the specified position
      const map = new Map(mapRef.current, {
        zoom: 17,
        center: position,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: false,
        streetViewControl: false,
        mapId: "MAP",
      });
      new Marker({
        map: map,
        position: position,
      });
      // Agregar marcadores para todas las ubicaciones registradas
      locations.forEach((location, index) => {
        new window.google.maps.Marker({
          map: map,
          position: { lat: location.latitude, lng: location.longitude },
          title: `Ubicación ${index + 1}`,
        });
      });

    };

    if (googleMapsSdkLoaded) {
      initMap();
    }
  }, [googleMapsSdkLoaded]);

  useEffect(() => {
    // Configuración del seguimiento de ubicación en segundo plano
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: false,
      stopOnTerminate: false, // Continuar ejecutándolo en segundo plano
    };

    // Iniciar el seguimiento de ubicación en segundo plano
    BackgroundGeolocation.configure(config).then(() => {
      BackgroundGeolocation.start();

      // Manejar eventos de ubicación
      const location = BackgroundGeolocationEvents.location;
      console.log(location)
    });

    // Detener el seguimiento cuando el componente se desmonte
    return () => {
      BackgroundGeolocation.stop();
    };
  }, []);

  return googleMapsSdkLoaded ? (
    <div
      id="map"
      ref={mapRef}
      className="MapView"
      style={{ height: "100%", width: "100%" }}
    />
  ) : (
    <div style={{ padding: 10 }}>
      <h4>No se pudo cargar el SDK de JavaScript de Google Maps</h4>
      <ul>
        <li>Por favor, verifique si tiene una conexión a Internet.</li>
      </ul>
    </div>
  );
};

export default MapContainer;

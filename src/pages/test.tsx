import React, { useEffect, useRef, useState } from 'react';
import { Geolocation } from "@capacitor/geolocation";
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

    useEffect(() => {
        const initMap = async () => {
            const coords: any = await Geolocation.getCurrentPosition();
            const position = { lat: coords.coords.latitude, lng: coords.coords.longitude };
            // Request needed libraries.
            const { Map } = await window.google.maps.importLibrary("maps");

            // The map, centered at the specified position
            const map = new Map(mapRef.current, {
                zoom: 14,
                center: position,
                mapTypeControl: false,
                fullscreenControl: false,
                zoomControl: false,
                streetViewControl: false,
                mapId: "map",
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
    }, [googleMapsSdkLoaded, locations]);
    
      useEffect(() => {
        // Configuración del seguimiento de ubicación en segundo plano
    
        const config: BackgroundGeolocationConfig = {
          desiredAccuracy: 10,
          stationaryRadius: 20,
          stopOnTerminate: false,
          startOnBoot: true,
          distanceFilter: 30,
          debug: false,
          notificationTitle: "App de registro de ubicacion",
        };
    
        // Iniciar el seguimiento de ubicación en segundo plano
        BackgroundGeolocation.configure(config).then(() => {
          BackgroundGeolocation.start();
    
          // Manejar eventos de ubicación
          const location = BackgroundGeolocationEvents.location;
    
          // Almacenar la ubicación registrada
          const updatedLocations = [...locations, location];
          setLocations(updatedLocations);
    
          localStorage.setItem("saveBackgroundGeolocation", JSON.stringify(location));
          console.log(location);
        });
    
        // Detener el seguimiento cuando el componente se desmonte
        return () => {
          BackgroundGeolocation.stop();
        };
      }, [locations]);

    return googleMapsSdkLoaded ? (
        <div
            id="map"
            ref={mapRef}
            className="MapView"
        />
    ) : (
        <div>
            <h4>No se pudo cargar el SDK de JavaScript de Google Maps</h4>
            <ul>
                <li>Por favor, verifique si tiene una conexión a Internet.</li>
            </ul>
        </div>
    );
};

export default MapContainer;

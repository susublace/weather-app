import React, { useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  MarkerF,
  useGoogleMap,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 25.0478,
  lng: 121.5319,
};

function GoogleMapTool({ panToCenter, cityData }) {
  const MarkerList = () => {
    const map = useGoogleMap();

    useEffect(() => {
      if (map) {
        map.panTo(panToCenter);
      }
    }, []);

    return cityData.map((data, idx) => (
      <MarkerF
        position={{ lat: data.coord.lat, lng: data.coord.lon }}
        key={idx}
      />
    ));
  };

  return (
    <div className="map-style">
      <LoadScript googleMapsApiKey="AIzaSyA9IS45ez87QR8Llb8aY6wAfL_2hPU0fdc">
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={9}>
          <MarkerList />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default GoogleMapTool;

import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapContainer = (location) => {
  const mapStyles = {
    height: '50vh',
    width: '100%'
  };

  const getLatlng = location?.location?.location || [-6.23827, 106.975571];

  const defaultCenter = {
    lat: getLatlng[0],
    lng: getLatlng[1]
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyBs6wa9O1w5GDUNYbTzYlq0cuIE7cHPO0Y">
      <GoogleMap mapContainerStyle={mapStyles} zoom={13} center={defaultCenter}>
        <Marker position={defaultCenter} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapContainer;


import { Text, View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import 'mapbox-gl/dist/mapbox-gl.css';
import Navbar from '../components/navigation/NavBar';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native';

MapboxGL.setAccessToken('pk.eyJ1IjoibWVrbGEiLCJhIjoiY20zNHI0ZnB4MDE5aDJyb2U2OG8yY2ZlOSJ9.cB-Hl3hsHMampZTCal54Mg');


const getMapStyle = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 16) {
        return 'mapbox://styles/mapbox/streets-v11';
    } else {
        return 'mapbox://styles/mapbox/dark-v10';
    }
};

export default function Map() {
    const [mapStyle, setMapStyle] = useState(getMapStyle());

    useEffect(() => {
        const interval = setInterval(() => {
            setMapStyle(getMapStyle());
        }, 3600000); 

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>scrapmap</Text>
            
            {/* Mapbox Map */}
            <MapboxGL.MapView style={styles.map} styleURL={mapStyle}>
                <MapboxGL.Camera
                    zoomLevel={10}
                    centerCoordinate={[40.4194, 37.7749]}
                />
            </MapboxGL.MapView>
            <View style={styles.buttonContainer}>
                <Button title="Day" onPress={() => setMapStyle('mapbox://styles/mapbox/streets-v11')} />
                <Button title="Night" onPress={() => setMapStyle('mapbox://styles/mapbox/dark-v10')} />
            </View>
            <Navbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    text: {
        color: '#fff',
        marginBottom: 10,
    },
    map: {
        width: '100%',
        height: '70%'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
});
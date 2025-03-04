import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  interface Station {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    name: string;
    vicinity: string;
  }

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocationAndStations = async () => {
      setLoading(true);
      try {
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          if (newStatus !== 'granted') {
            console.log('Permission denied');
            return;
          }
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(coords);

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.latitude},${coords.longitude}&rankby=distance&keyword=EV+charging|electric+charging|Tesla+charger|fast+charging&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`
        );
        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
        setStations(data.results);
        console.log('Charging Stations:', JSON.stringify(data, null, 2));
      } catch (error) {
        console.log('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    };

    getLocationAndStations();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        <MapView
          key={location ? `${location.latitude}-${location.longitude}` : 'default'}
          style={{ flex: 1 }}
          region={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : {
                  latitude: 37.78825,
                  longitude: -122.4324,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }
          }>
          {location && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              pinColor="green"
            />
          )}
          {stations.map((station, index) => (
            <Marker
              coordinate={{
                latitude: station.geometry.location.lat,
                longitude: station.geometry.location.lng,
              }}
              title={station.name}
              description={station.vicinity}
              pinColor="red"
            />
          ))}
        </MapView>
      </SafeAreaView>
      <StatusBar style="light" />
    </View>
  );
}

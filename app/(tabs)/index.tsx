import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getLocationPermission = async () => {
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

        if (isMounted) {
          setLocation(coords);
          console.log('Updated location:', coords);
        }
      } catch (error) {
        console.log('Error fetching location:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getLocationPermission();

    return () => {
      isMounted = false;
    };
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
        </MapView>
      </SafeAreaView>
      <StatusBar style="light" />
    </View>
  );
}

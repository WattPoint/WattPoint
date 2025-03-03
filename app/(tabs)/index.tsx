import { SafeAreaView, View } from 'react-native';
import MapView from 'react-native-maps';

export default function Home() {
  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        <MapView style={{ flex: 1 }} />
      </SafeAreaView>
    </View>
  );
}

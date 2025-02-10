import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen name="mapsme" options={{headerShown: false}}/>
      <Stack.Screen name="mapsfeed" options={{headerShown: false}}/>
    </Stack>
  );
}
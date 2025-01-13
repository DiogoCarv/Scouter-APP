import { Tabs, Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack>
        <Stack.Screen name="login" options={{headerShown: false, title:"LOGIN"}}/>
        <Stack.Screen name="cadastrar" options={{headerShown: false, title:"CADASTRAR"}}/>
        <Stack.Screen name="(auth)" options={{headerShown: false, title:"AUTH"}}/>
    </Stack>
  );
}
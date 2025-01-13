import { Stack, Tabs } from 'expo-router';

export default function configLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false, title:"CADASTRAR"}}/>
    </Stack>
  );
}

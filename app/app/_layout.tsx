import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { AuthProvider } from "../context/AuthProvider";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false, title:"PRINCIPAL"}}/>
        <Stack.Screen name="(cadastrar)" options={{headerShown: false, title:"PRINCIPAL"}}/>
        <Stack.Screen name="(auth)" options={{headerShown: false, title:"PRINCIPAL"}}/>
      </Stack>
    </AuthProvider>
  );
}

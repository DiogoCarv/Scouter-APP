import { Link } from 'expo-router';
import { View, Text, StyleSheet, Image, Pressable, Button, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { useAuth } from "../../../context/AuthProvider";
import axios from 'axios';
import * as Location from 'expo-location';

interface IndexProps {
  onPress: () => void;
  title?: string;
}

export default function Index({ onPress, title = 'PUBLICAR' }: IndexProps) {
  const { logout, setLocation } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permissão para acessar a localização foi negada.');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        await setLocation(latitude, longitude);
      } catch (error) {
        console.error("Erro ao obter localização:", error);
        setErrorMsg('Não foi possível obter a localização. Verifique se o GPS está ativado.');
      }
    })();
  }, []);

  return (
    <SafeAreaView style={safe.container}>
      <Text style={styles.header}>FAÇA SUA PUBLICAÇÃO</Text>
      <View>
        <Pressable style={botao.button} onPress={onPress}>
          <Link href="/modal" style={texto.text}>{title}</Link>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const safe = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1C1C1C',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const botao = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#191970',
    marginTop: 10,
  },
});

const texto = StyleSheet.create({
  tituloCampo: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 12,
    marginBottom: -8,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  valorCampo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginTop: -3,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
    fontWeight: 'bold',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, Alert, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthProvider";
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function Login() {
  const router = useRouter();
  axios.defaults.baseURL = "http://3.209.65.64:3002/";
  const { setUser, setLocation, getLocation } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const alternarVisibilidadeSenha = () => {
    setSenhaVisivel(!senhaVisivel);
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha e-mail e senha!");
      return;
    }

    const jsonBody = { email_usuario: email, senha_usuario: senha };

    try {
      const response = await axios.post("login", jsonBody);
      console.log("Resposta da API:", response.data);

      if (response.data.mensagem === "Login realizado com sucesso!") {
        let { token, id_usuario, nome_usuario, latitude, longitude } = response.data;

        if (latitude === undefined || longitude === undefined) {
          console.log("Localização não definida, obtendo novamente...");
          const location = await Location.getCurrentPositionAsync({});
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
          await setLocation(latitude, longitude);
        }

        setUser({
          name: nome_usuario,
          id: id_usuario,
          token: token,
          latitude: latitude,
          longitude: longitude,
        });

        console.log("Localização do usuário:", { latitude, longitude });
        router.push("../../(tabs)/(feed)");
      } else {
        Alert.alert("Erro", "Credenciais inválidas! Verifique seu e-mail e senha.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Erro", error.response?.data?.mensagem || "Erro ao fazer a requisição.");
      } else if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Ocorreu um erro inesperado.");
      }
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>LOGIN</Text>
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="EMAIL"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            secureTextEntry={!senhaVisivel}
            onChangeText={setSenha}
            value={senha}
            placeholder="SENHA"
          />
          <Pressable onPress={alternarVisibilidadeSenha} style={styles.iconWrapper}>
            <Ionicons name={senhaVisivel ? 'eye' : 'eye-off'} size={24} color="#888" />
          </Pressable>
        </View>
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.text}>ENTRAR</Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    width: '80%',
    height: 40,
  },
  iconWrapper: {
    marginLeft: 8,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#191970',
  },
  text: {
    color: 'white',
  },
});
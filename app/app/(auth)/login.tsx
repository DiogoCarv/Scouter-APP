import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, Alert, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthProvider";
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function Login() {
  const router = useRouter();
  axios.defaults.baseURL = "http://192.168.1.5:3002/";
  const { setUser, setLocation, getLocation } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
      } else {
        Alert.alert("Permissão negada", "Permissão para acessar a localização foi negada.");
      }
    })();
  }, []);

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
          if (!locationPermission) {
            Alert.alert("Erro", "Permissão para acessar a localização é necessária.");
            return;
          }

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.container}>
            <Text style={styles.title}>LOGIN</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="EMAIL"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

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

            <Pressable style={botao.button} onPress={handleLogin}>
              <Text style={styles.text}>ENTRAR</Text>
            </Pressable>

            <Pressable style={botao.button} onPress={() => router.push('./cadastrar')}>
              <Text style={styles.text}>NÃO TENHO CONTA</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const texto = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
});

const safe = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 20,
    width: 300,
  },
});

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 12,
    height: 40,
    width: '80%',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#000',
    width: '100%',
  },
  iconWrapper: {
    marginLeft: 8,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});
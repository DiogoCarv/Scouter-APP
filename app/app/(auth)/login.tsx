import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, Alert, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useAuth } from "../../context/AuthProvider";
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();
  axios.defaults.baseURL = "http://3.209.65.64:3002/";
  const { setUser } = useAuth();
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
        const { token, id_usuario, nome_usuario } = response.data;

        await setUser({
          name: nome_usuario,
          id: id_usuario,
          token: token,
        });

        router.push("../../(tabs)/(feed)");
      } else {
        Alert.alert("Erro", "Credenciais inválidas! Verifique seu e-mail e senha.");
      }
    } catch (error: unknown) {
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
      <SafeAreaView style={safe.container}>
        <Text style={styles.title}>LOGIN</Text>

        <TextInput
          style={texto.input}
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
            placeholderTextColor="#888"
          />
          <Pressable onPress={alternarVisibilidadeSenha} style={styles.iconWrapper}>
            <Ionicons
              name={senhaVisivel ? 'eye' : 'eye-off'}
              size={24}
              color="#888"
            />
          </Pressable>
        </View>

        <Pressable style={botao.button} onPress={handleLogin}>
          <Text style={styles.text}>ENTRAR</Text>
        </Pressable>

        <Pressable style={botao.button} onPress={() => router.push('./cadastrar')}>
          <Text style={styles.text}>NÃO TENHO CONTA</Text>
        </Pressable>
      </SafeAreaView>
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
});

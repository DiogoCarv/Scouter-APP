import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { useAuth } from "../../../context/AuthProvider";
import axios from 'axios';

export default function UserSettings() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("Usuário atual:", user);

  const formatarCPF = (cpf: string): string => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const [usuario, setUsuario] = useState({
    id_usuario: '',
    imagem_usuario: '',
    nome_usuario: '',
    sobrenome_usuario: '',
    email_usuario: '',
    cpf_usuario: '',
    estado_usuario: '',
    cidade_usuario: '',
    senha_usuario: '',
  });

  useEffect(() => {

    const fetchUsuario = async () => {
      try {
        if (!user?.id) {
          setError("ID do usuário não encontrado.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://3.209.65.64:3002/usuarios/${user.id}`, {
          headers: {
            Authorization: user.token
          }
        }); `
        `
        setUsuario(response.data);
      } catch (err) {
        console.error(err);
        console.error("Erro ao carregar dados do usuário:", err);
        setError("Erro ao carregar os dados do usuário.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={safe.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={safe.container}>
        <Text style={titulo.title}>{error}</Text>
        <Pressable
          style={botao.button}
          onPress={async () => {
            await logout();
          }}
        >
          <Text style={texto.text}>LOGOUT</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
    <SafeAreaView style={safe.container}>
      <ScrollView
        style={safe.scroll}
        contentContainerStyle={safe.scrollContent}
      >
        <View style={styles.wrapper}>
          <Text style={titulo.header}>CONFIGURAÇÕES</Text>
          <View style={styles.contentBox}>
            <Image
              source={{ uri: usuario.imagem_usuario || 'https://via.placeholder.com/150' }}
              style={imagens.image}
            />

            <View style={styles.campo}>
              <Text style={texto.tituloCampo}>NOME</Text>
              <View style={styles.divider} />
              <Text style={texto.valorCampo}>{usuario.nome_usuario}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={texto.tituloCampo}>SOBRENOME</Text>
              <View style={styles.divider} />
              <Text style={texto.valorCampo}>{usuario.sobrenome_usuario}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={texto.tituloCampo}>CPF</Text>
              <View style={styles.divider} />
              <Text style={texto.valorCampo}>{formatarCPF(usuario.cpf_usuario)}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={texto.tituloCampo}>CIDADE</Text>
              <View style={styles.divider} />
              <Text style={texto.valorCampo}>{usuario.cidade_usuario}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={texto.tituloCampo}>ESTADO</Text>
              <View style={styles.divider} />
              <Text style={texto.valorCampo}>{usuario.estado_usuario}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={texto.tituloCampo}>EMAIL</Text>
              <View style={styles.divider} />
              <Text style={texto.valorCampo}>{usuario.email_usuario}</Text>
            </View>
          </View>
        </View>
        <Pressable
          style={botao.button}
          onPress={async () => {
            await logout();
          }}
        >
          <Text style={texto.text}>LOGOUT</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  </SafeAreaProvider>
  );
}
const safe = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
});

const titulo = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    marginBottom: 5,
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
    width: 300,
  },
});

const imagens = StyleSheet.create({
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75,
  },
});

const texto = StyleSheet.create({
  tituloCampo: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 12,
    marginBottom: -8,
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
  },
});

const styles = StyleSheet.create({
  contentBox: {
    backgroundColor: '#A9A9A9',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: 300,
  },
  campo: {
    backgroundColor: '#929cad',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    width: '90%',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 8,
  },
  wrapper: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
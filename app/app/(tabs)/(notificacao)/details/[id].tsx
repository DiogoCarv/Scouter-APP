import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { useAuth } from "../../../../context/AuthProvider";
import axios from 'axios';


interface IndexProps {
  onPress: () => void;
  title?: string;
}

export default function SecondDetailsScreen({ onPress, title = 'VOLTAR' }: IndexProps) {
  const { user, logout } = useAuth();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [publicacao, setPublicacao] = useState({
    titulo_publicacao: '',
    imagem_publicacao: '',
    descricao_publicacao: '',
    estado_publicacao: '',
    cidade_publicacao: '',
    nome_usuario: '',
    sobrenome_usuario: '',
  });

  useEffect(() => {
    const fetchPublicacao = async () => {
      try {
        
        const response = await axios.get(`http://54.173.126.116:3002/publicacao/${id}`, {
          headers: {
            Authorization: user?.token
          }
        });

        setPublicacao(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPublicacao();
  }, [id]);

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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={safe.container}>
      <Text style={titulo.title}>DETALHES DA PUBLICAÇÃO</Text>

      <View style={styles.contentBox}>

        <Image
          source={{
            uri: publicacao.imagem_publicacao
              ? publicacao.imagem_publicacao
              : 'https://via.placeholder.com/300',
          }}
          style={image.image}
        />

        <View style={styles.campo}>
          <Text style={texto.tituloCampo}>Título</Text>
          <View style={styles.divider} />
          <Text style={texto.valorCampo}>{publicacao.titulo_publicacao}</Text>
        </View>

        <View style={styles.campo}>
          <Text style={texto.tituloCampo}>Cidade</Text>
          <View style={styles.divider} />
          <Text style={texto.valorCampo}>{publicacao.cidade_publicacao}</Text>
        </View>

        <View style={styles.campo}>
          <Text style={texto.tituloCampo}>Estado</Text>
          <View style={styles.divider} />
          <Text style={texto.valorCampo}>{publicacao.estado_publicacao}</Text>
        </View>

        <View style={styles.campo}>
          <Text style={texto.tituloCampo}>Descrição</Text>
          <View style={styles.divider} />
          <Text style={texto.valorCampo}>{publicacao.descricao_publicacao}</Text>
        </View>
      </View>

      <Pressable style={botao.button}>
        <Link href="/" style={texto.text}>VOLTAR</Link>
      </Pressable>
    </SafeAreaView>
  );
}

const safe = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
});

const titulo = StyleSheet.create({
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
  },
});

const image = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    marginBottom: 10,
    borderRadius: 15,
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
    width: '100%',
    maxWidth: 350,
  },
  campo: {
    backgroundColor: '#929cad',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 8,
  },
});
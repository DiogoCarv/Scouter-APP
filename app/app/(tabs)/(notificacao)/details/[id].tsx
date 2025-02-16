import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, ScrollView } from 'react-native';
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
  const [error, setError] = useState<string | null>(null);

  const [publicacao, setPublicacao] = useState({
    titulo_publicacao: '',
    imagem_publicacao: '',
    descricao_publicacao: '',
    estado_publicacao: '',
    cidade_publicacao: '',
    nome_usuario: '',
    sobrenome_usuario: '',
    date_publicacao: '',
    hora_publicacao: '',
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchPublicacao = async () => {
      try {
        const response = await axios.get(`http://192.168.1.5:3002/publicacao/${id}`, {
          headers: {
            Authorization: user?.token
          }
        });

        setPublicacao(response.data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar a publicação.");
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
      <ScrollView
        style={safe.scroll}
        contentContainerStyle={safe.scrollContent}
      >
        <View style={styles.wrapper}>
          <Text style={titulo.title}>DETALHES DA PUBLICAÇÃO</Text>

          <View style={styles.contentBox}>
            <Image
              source={{
                uri: publicacao.imagem_publicacao
                  ? publicacao.imagem_publicacao
                  : 'https://cokimoveis.com.br/img/sem_foto.png',
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

            <View style={styles.campo}>
              <Text style={texto.tituloCampo}>Data</Text>
              <View style={styles.divider} />
              <Text style={texto.valorCampo}>{formatDate(publicacao.date_publicacao)}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={texto.tituloCampo}>Hora</Text>
              <View style={styles.divider} />
              <Text style={texto.valorCampo}>{publicacao.hora_publicacao}</Text>
            </View>
          </View>

          <Pressable style={botao.button}>
            <Link href="/" style={texto.text}>VOLTAR</Link>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const safe = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});

const titulo = StyleSheet.create({
  title: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    marginBottom: 20,
    position: 'absolute',
    top: 20,
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
    marginBottom: 10,
    marginTop: 10,
    width: 300,
  },
});

const image = StyleSheet.create({
  image: {
    width: '90%',
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
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  valorCampo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginTop: -3,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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

const styles = StyleSheet.create({
  contentBox: {
    backgroundColor: '#D3D3D3',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
    marginTop: 100,
    flex: 1,
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
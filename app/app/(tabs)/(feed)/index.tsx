import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../../../context/AuthProvider";
import axios from 'axios';

export default function Index() {
  const { user, logout } = useAuth();
  const [data, setData] = useState([]);

  const userId = user?.id;

  useEffect(() => {
    const buscar = async () => {
      console.log(user?.token);
      try {
        const response = await axios.get('publicacao', {
          headers: {
            Authorization: user?.token,
          
          },
        });

        if (response.data) {
          // Filtrar apenas as publicações de outros usuários
          const otherUserPosts = response.data.filter((item: ItemData) => item.id_usuario !== userId);
          setData(otherUserPosts);
        }
      } catch (error) {
        console.error('ERROR', error);
      }
    };

    buscar();
  }, [userId]);

  type ItemProps = {
    item: ItemData;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
  };

  type ItemData = {
    id_publicacao: string;
    titulo_publicacao: string;
    imagem_publicacao: string;
    descricao_publicacao: string;
    estado_publicacao: string;
    cidade_publicacao: string;
    id_usuario: string;
    nome_usuario: string;
    sobrenome_usuario: string;
  };

  const Item = ({ item }: { item: ItemData }) => {
    const defaultImageUri = 'https://cokimoveis.com.br/img/sem_foto.png';
    const imageUri = item.imagem_publicacao || defaultImageUri;
  
    return (
      <TouchableOpacity style={styles.feedItem}>
        <Image source={{ uri: imageUri }} style={imagem.notificationImage} />
        <View style={styles.textContainer}>
          <Link href={`/details/${item.id_publicacao}`} style={texto.feedTitle}>
            {item.titulo_publicacao}
          </Link>
          <Text style={texto.feedDescription}>{item.descricao_publicacao}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ItemData }) => {
    return <Item item={item} />;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={safe.container}>
        <Text style={titulo.header}>FEED</Text>

        <View style={safe.quadrado}>

          {data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.id_publicacao}
            />
          ) : (
            <Text style={texto.noPosts}>Você ainda não tem publicações.</Text>
          )}

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const safe = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  quadrado: {
    width: '95%',
    overflow: 'hidden',
  }
});

const texto = StyleSheet.create({
  feedDescription: {
    fontSize: 14,
    color: '#F5F5F5',
    marginTop: 1,
    marginBottom: 1,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8F8FF',
    marginBottom: 1,
    marginTop: 1,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },  
  noPosts: {
    fontSize: 16,
    color: '#696969',
    textAlign: 'center',
    marginTop: 20,
  },
});

const titulo = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1C1C1C',
    marginTop: 20,
  },
});

const styles = StyleSheet.create({
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 8,
    backgroundColor: '#000080',
    borderRadius: 8,
    height: 120,
    overflow: 'hidden',
    width: '95%',
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
});

const imagem = StyleSheet.create({
  notificationImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
});

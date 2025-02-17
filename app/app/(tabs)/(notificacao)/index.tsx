import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView, Pressable } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../../../context/AuthProvider";
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as Location from 'expo-location';

// Função para calcular a distância entre duas coordenadas usando a fórmula de Haversine
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const R = 6371; // Raio da Terra em km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Index() {
  const router = useRouter();
  const { user, logout, setLocation, getLocation } = useAuth();
  const [data, setData] = useState([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    const buscar = async () => {
      try {
        const response = await axios.get('publicacao', {
          headers: {
            Authorization: user?.token,
          },
        });

        const userPosts = response.data.filter((item: ItemData) => item.id_usuario === userId);

        setData(userPosts);
      } catch (error) {
        console.error('ERROR', error);
      }
    };

    buscar();
  }, [userId]);

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
    latitude_publicacao: number;
    longitude_publicacao: number;
  };

  const Item = ({ item }: { item: ItemData }) => {
    const defaultImageUri = 'https://cokimoveis.com.br/img/sem_foto.png';
    const imageUri = item.imagem_publicacao || defaultImageUri;
  
    // Função para truncar o texto
    const truncateText = (text: string, maxLength: number) => {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + '-';
      }
      return text;
    };
  
    // Calcular a distância entre o usuário e a postagem
    const userLat = user?.latitude;
    const userLon = user?.longitude;
    const postLat = item.latitude_publicacao;
    const postLon = item.longitude_publicacao;
  
    let distance = null;
    if (userLat && userLon && postLat && postLon) {
      distance = haversineDistance(userLat, userLon, postLat, postLon);
    }
  
    return (
      <TouchableOpacity style={styles.feedItem}>
        <Image source={{ uri: imageUri }} style={imagem.notificationImage} />
        <View style={styles.textContainer}>
          <View style={styles.box}>
            <View style={styles.altoBox}>
              <Link href={`/details/${item.id_publicacao}`} style={texto.feedTitle}>
                {item.titulo_publicacao}
              </Link>
              <View style={styles.divider} />
              <Text style={texto.feedDescription}>
                {truncateText(item.descricao_publicacao, 33)}
              </Text>
            </View>
            <View style={styles.baixoBox}>
              {distance !== null && (
                <Text style={texto.distanceText}>{`Distância: ${distance.toFixed(2)} km`}</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const [selectedId, setSelectedId] = useState<string>();

  const renderItem = ({ item }: { item: ItemData }) => {
    return <Item item={item} />;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={safe.container}>
        <Text style={titulo.header}>MINHAS PUBLICAÇÕES</Text>

        <Pressable style={botao.button} onPress={() => router.push('../(maps)/mapsfeed')}>
          <Text style={styles.text}>VER O MAPA</Text>
        </Pressable>

        <View style={safe.quadrado}>

          {data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.id_publicacao}
              extraData={selectedId}
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
    textAlign: 'center',
  },
  noPosts: {
    fontSize: 16,
    color: '#696969',
    textAlign: 'center',
    marginTop: 20,
  },
  distanceText: {
    fontSize: 14,
    color: '#F5F5F5',
    marginTop: 5,
    textAlign: 'center',
  },
});

const titulo = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1C1C1C',
    marginTop: 20,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
    height: 150,
    overflow: 'hidden',
    width: '95%',
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 8,
  },
  altoBox: {
    backgroundColor: '#2F4F4F',
    borderRadius: 8,
    padding: 10,
    flex: 1,
  },
  baixoBox: {
    backgroundColor: '#2F4F4F',
    borderRadius: 8,
    padding: 10,
    flexShrink: 1,
    marginTop: 10,
  },
  box: {
    flex: 1,
    borderRadius: 8,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
});

const imagem = StyleSheet.create({
  notificationImage: {
    width: 100,
    height: 130,
    borderRadius: 8,
    resizeMode: 'cover',
    overflow: 'hidden',
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
    marginBottom: 10,
  },
});
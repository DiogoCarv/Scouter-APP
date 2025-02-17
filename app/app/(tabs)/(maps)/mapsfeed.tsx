import React, { useEffect, useState } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native';
import { useAuth } from "../../../context/AuthProvider";
import axios from 'axios';

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
  latitude: string;
  longitude: string;
};

export default function App() {
  const { user, getLocation } = useAuth();
  const [region, setRegion] = useState<Region | null>(null);
  const [otherUsersPosts, setOtherUsersPosts] = useState<ItemData[]>([]);

  useEffect(() => {
    const fetchLocationAndPosts = async () => {
      const location = await getLocation();
      if (location) {
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });

        try {
          const response = await axios.get('publicacao', {
            headers: {
              Authorization: user?.token,
            },
          });

          // Filtra as publicações de outros usuários (exclui as do usuário logado)
          const filteredPosts = response.data.filter((item: ItemData) => item.id_usuario !== user?.id);
          console.log('Publicações de outros usuários:', filteredPosts); // Verifique os dados aqui
          setOtherUsersPosts(filteredPosts);
        } catch (error) {
          console.error('ERROR', error);
        }
      }
    };

    fetchLocationAndPosts();
  }, [getLocation, user]);

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
        >
          {otherUsersPosts.map((post) => {
            const latitude = parseFloat(post.latitude);
            const longitude = parseFloat(post.longitude);

            // Verifica se as coordenadas são válidas
            if (isNaN(latitude) || isNaN(longitude)) {
              console.warn(`Coordenadas inválidas para a publicação ${post.id_publicacao}:`, post.latitude, post.longitude);
              return null;
            }

            return (
              <Marker
                key={post.id_publicacao}
                coordinate={{ latitude, longitude }}
                title={post.titulo_publicacao}
                description={post.descricao_publicacao}
              />
            );
          })}
        </MapView>
      ) : (
        <Text>Carregando mapa...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
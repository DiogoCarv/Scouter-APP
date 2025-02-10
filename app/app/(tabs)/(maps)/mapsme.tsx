import React, { useEffect, useState } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
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
  const [userPosts, setUserPosts] = useState<ItemData[]>([]); // Especifique o tipo como ItemData[]

  useEffect(() => {
    const fetchLocationAndPosts = async () => {
      const location = await getLocation();
      if (location) {
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        try {
          const response = await axios.get('publicacao', {
            headers: {
              Authorization: user?.token,
            },
          });

          // Filtra as publicações do usuário conectado
          const filteredPosts = response.data.filter((item: ItemData) => item.id_usuario === user?.id);
          setUserPosts(filteredPosts);
        } catch (error) {
          console.error('ERROR', error);
        }
      }
    };

    fetchLocationAndPosts();
  }, [getLocation, user]);

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
        >
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
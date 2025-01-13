import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../../../context/AuthProvider";
import axios from 'axios';

export default function Index() {
  const { user, logout } = useAuth();
  const [data, setData] = useState([]);

  const userId = user?.id;

  useEffect(() => {
    const buscar = async () => {
      try {
        const response = await axios.get('publicacao', {
          headers: {
            Authorization: user?.token,
          },
        });

        // Filtrar publicações do usuário logado com o tipo explícito
        const userPosts = response.data.filter((item: ItemData) => item.id_usuario === userId);

        setData(userPosts);
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

  const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => {

    return (
      <TouchableOpacity onPress={onPress} style={[styles.feedItem, { backgroundColor }]}>
        <View style={styles.textContainer}>
          <Link
            href={`/details/${item.id_publicacao}`}
            style={{ ...texto.feedTitle, color: textColor }}
          >
            {item.titulo_publicacao}
          </Link>
          <Text style={texto.feedDescription}>{item.descricao_publicacao}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const [selectedId, setSelectedId] = useState<string>();

  const renderItem = ({ item }: { item: ItemData }) => {
    const backgroundColor = item.id_publicacao === selectedId ? '#0000FF' : '#000080';
    const color = item.id_publicacao === selectedId ? 'white' : '#F8F8FF';

    return (
      <Item
        item={item}
        onPress={() => setSelectedId(item.id_publicacao)}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={safe.container}>
        <Text style={titulo.header}>MINHAS PUBLICAÇÕES</Text>

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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const safe = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});

const texto = StyleSheet.create({
  feedDescription: {
    fontSize: 14,
    color: '#F5F5F5',
    marginTop: 1,
    marginBottom: 1,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8F8FF',
    marginBottom: 1,
    marginTop: 1,
  },
  noPosts: {
    fontSize: 16,
    color: '#696969',
    textAlign: 'center',
    marginTop: 20,
  },
});

const imagem = StyleSheet.create({
  feedImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginTop: 1,
    marginBottom: 1,
    marginLeft: 1,
    marginRight: 2,
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
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: '#000080',
    borderRadius: 8,
    width: '90%',
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
});

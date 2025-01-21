import { Pressable, StyleSheet, Text, View, TextInput, Alert, Button, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from "../../../context/AuthProvider";
import { Link, router, useRouter } from 'expo-router';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

interface IndexProps {
  onPress: () => void;
  title?: string;
}

export default function Model({ onPress, title = 'VOLTAR' }: IndexProps) {
  axios.defaults.baseURL = "http://3.209.65.64:3002/";

  const { user, logout } = useAuth();

  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);

  type Estado =
    | 'Acre'
    | 'Alagoas'
    | 'Amapá'
    | 'Amazonas'
    | 'Bahia'
    | 'Ceará'
    | 'Distrito Federal'
    | 'Espírito Santo'
    | 'Goiás'
    | 'Maranhão'
    | 'Mato Grosso'
    | 'Mato Grosso do Sul'
    | 'Minas Gerais'
    | 'Pará'
    | 'Paraíba'
    | 'Paraná'
    | 'Pernambuco'
    | 'Piauí'
    | 'Rio de Janeiro'
    | 'Rio Grande do Norte'
    | 'Rio Grande do Sul'
    | 'Rondônia'
    | 'Roraima'
    | 'Santa Catarina'
    | 'São Paulo'
    | 'Sergipe'
    | 'Tocantins';

  const estadosECidades: Record<Estado, string[]> = {
    'Acre': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
    'Alagoas': ['Maceió', 'Arapiraca', 'Palmeira dos Índios'],
    'Amapá': ['Macapá', 'Santana', 'Oiapoque'],
    'Amazonas': ['Manaus', 'Parintins', 'Itacoatiara'],
    'Bahia': ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
    'Ceará': ['Fortaleza', 'Juazeiro do Norte', 'Sobral'],
    'Distrito Federal': ['Brasília'],
    'Espírito Santo': ['Vitória', 'Vila Velha', 'Serra'],
    'Goiás': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'],
    'Maranhão': ['São Luís', 'Imperatriz', 'Caxias'],
    'Mato Grosso': ['Cuiabá', 'Várzea Grande', 'Rondonópolis'],
    'Mato Grosso do Sul': ['Campo Grande', 'Dourados', 'Três Lagoas'],
    'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Ouro Preto'],
    'Pará': ['Belém', 'Ananindeua', 'Santarém'],
    'Paraíba': ['João Pessoa', 'Campina Grande', 'Patos'],
    'Paraná': ['Curitiba', 'Londrina', 'Maringá'],
    'Pernambuco': ['Recife', 'Olinda', 'Jaboatão dos Guararapes'],
    'Piauí': ['Teresina', 'Parnaíba', 'Picos'],
    'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Petrópolis'],
    'Rio Grande do Norte': ['Natal', 'Mossoró', 'Parnamirim'],
    'Rio Grande do Sul': ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
    'Rondônia': ['Porto Velho', 'Ji-Paraná', 'Ariquemes'],
    'Roraima': ['Boa Vista', 'Rorainópolis', 'Caracaraí'],
    'Santa Catarina': ['Florianópolis', 'Joinville', 'Blumenau'],
    'São Paulo': ['São Paulo', 'Campinas', 'Santos'],
    'Sergipe': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto'],
    'Tocantins': ['Palmas', 'Araguaína', 'Gurupi'],
  };

  const handleEstadoChange = (value: string) => {
    if (value in estadosECidades) {
      setEstado(value as Estado);
      setCidadesDisponiveis(estadosECidades[value as Estado]);
      setCidade('');
    } else {
      setEstado('');
      setCidadesDisponiveis([]);
    }
  };

  const idUsuario = user?.id;

  const handleSubmit = async () => {
    if (!titulo || !descricao || !cidade || !estado) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos.');
      return;
    }

    try {
      const response = await axios.post(
        'http://3.209.65.64:3002/publicacao',
        {
          titulo_publicacao: titulo,
          descricao_publicacao: descricao,
          cidade_publicacao: cidade,
          estado_publicacao: estado,
          id_usuario: idUsuario,
        },
        {
          headers: {
            Authorization: user?.token,
          },
        }
      );

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Publicação cadastrada com sucesso!');
        router.replace("/(tabs)/(feed)");
      } else {
        Alert.alert('Erro', response.data.mensagem || 'Erro ao cadastrar a publicação.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível cadastrar a publicação. Tente novamente.');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000040',
      }}
    >
      <Link href={'/'} asChild>
        <Pressable style={StyleSheet.absoluteFill} />
      </Link>
      <View
        style={{
          width: '90%',
          height: '80%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
        }}
      >
        <Text style={styles.title}>PUBLICAR</Text>

        <Pressable onPress={pickImage}>
          <Image
            source={{
              uri: image || 'https://cokimoveis.com.br/img/sem_foto.png',
            }}
            style={styles.image}
          />
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="TÍTULO"
          onChangeText={setTitulo}
          value={titulo}
          maxLength={100}
        />
        <TextInput
          style={styles.input}
          placeholder="DESCRIÇÃO"
          onChangeText={setDescricao}
          value={descricao}
          maxLength={100}
        />

        <Picker
          selectedValue={estado}
          style={texto.input}
          onValueChange={handleEstadoChange}
        >
          <Picker.Item label="Selecione o Estado" value="" />
          {Object.keys(estadosECidades).map((uf) => (
            <Picker.Item key={uf} label={uf} value={uf} />
          ))}
        </Picker>

        <Picker
          selectedValue={cidade}
          style={texto.input}
          onValueChange={setCidade}
          enabled={cidadesDisponiveis.length > 0}
        >
          <Picker.Item label="Selecione a Cidade" value="" />
          {cidadesDisponiveis.map((city) => (
            <Picker.Item key={city} label={city} value={city} />
          ))}
        </Picker>


        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.text}>PUBLICAR</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onPress}>
          <Link href="/" style={styles.text}>{title}</Link>
        </Pressable>
      </View>
    </View>
  );
}

const texto = StyleSheet.create({
  input: {
    height: 50,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 5,
  },
});

const galeria = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});

const camerastyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    marginBottom: 5,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  input: {
    height: 40,
    width: '80%',
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
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
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75,
  },
});

import { Pressable, StyleSheet, Text, View, TextInput, Alert, Button, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from "../../../context/AuthProvider";
import { Link, router, useRouter } from 'expo-router';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function Model() {
  axios.defaults.baseURL = "http://3.209.65.64:3002/";

  const { user, logout } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);

  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setFile(result.assets[0].base64);
    }
  };

  const onFileUpload = async () => {
    if (!file) {
      alert("Nenhuma imagem selecionada!");
      return;
    }

    setLoading(true);

    const clientId = "d00263d36872f0e";
    const auth = "Client-ID " + clientId;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", "base64");

    try {
      const response = await fetch("https://api.imgur.com/3/image/", {
        method: "POST",
        headers: {
          Authorization: auth,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert("Upload bem-sucedido!");
        console.log("Imgur Response:", data);
      } else {
        alert(`Erro no upload: ${data.data.error}`);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Erro ao fazer upload. Tente novamente.");
    }
  };

  const Cadastrar = async () => {
    if (!titulo || !descricao || !cidade || !estado) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos.');
      return;
    }
  };

  const estadosECidades = {
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

  const handleEstadoChange = (value) => {
    if (value in estadosECidades) {
      setEstado(value);
      setCidadesDisponiveis(estadosECidades[value]);
      setCidade('');
    } else {
      setEstado('');
      setCidadesDisponiveis([]);
    }
  };

  const idUsuario = user?.id;

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


        <Pressable style={styles.button} onPress={Cadastrar}>
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
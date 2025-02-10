import { Pressable, StyleSheet, Text, View, TextInput, Alert, Button, Image, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../context/AuthProvider";
import { Link, router, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

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

  // Estados para armazenar a latitude e longitude
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Função para capturar a localização
  useEffect(() => {
    (async () => {
      // Solicita permissão para acessar a localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão para acessar a localização foi negada.');
        return;
      }

      try {
        // Captura a localização atual
        let location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      } catch (error) {
        console.error("Erro ao obter localização:", error);
        setErrorMsg('Não foi possível obter a localização. Verifique se o GPS está ativado.');
      }
    })();
  }, []);

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
        console.log(data.data.link);
        return data.data.link;
      } else {
        alert(`Erro no upload: ${data.data.error}`);
        throw new Error(data.data.error);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Erro ao fazer upload. Tente novamente.");
      throw err;
    }
  };

  const Cadastrar = async () => {
    if (!titulo || !descricao || !cidade || !estado) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos.');
      return;
    }
  
    if (!file) {
      Alert.alert('Erro', 'Por favor, selecione uma imagem.');
      return;
    }
  
    if (!latitude || !longitude) {
      Alert.alert('Erro', 'Não foi possível obter a localização.');
      return;
    }
  
    setLoading(true);
  
    try {
      const imageUrl = await onFileUpload();
  
      console.log(user.id);
  
      const agora = new Date();
      const datePublicacao = agora.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const horaPublicacao = agora.toTimeString().split(' ')[0]; // Formato HH:MM:SS
  
      const publicacao = {
        imagem_publicacao: imageUrl,
        titulo_publicacao: titulo,
        descricao_publicacao: descricao,
        estado_publicacao: estado,
        cidade_publicacao: cidade,
        id_usuario: user.id,
        date_publicacao: datePublicacao, // Data da publicação
        hora_publicacao: horaPublicacao, // Hora da publicação
        latitude_publicacao: latitude, // Latitude
        longitude_publicacao: longitude, // Longitude
      };
  
      console.log("Dados da publicação:", publicacao); // Verifique se os dados estão corretos
  
      const response = await axios.post('/publicacao', publicacao, {
        headers: {
          'Authorization': `${user.token}`,
          'Content-Type': 'application/json',
        }
      });
  
      if (response.status === 201) {
        Alert.alert('Sucesso', 'Publicação cadastrada com sucesso!');
        router.push("/(feed)");
      } else {
        Alert.alert('Erro', 'Erro ao cadastrar publicação.');
      }
    } catch (error) {
      console.error("Erro ao cadastrar publicação:", error);
      if (error.response && error.response.status === 400) {
        Alert.alert('Erro', 'Usuário associado não encontrado!');
      } else {
        Alert.alert('Erro', 'Erro ao cadastrar publicação. Tente novamente.');
      }
    } finally {
      setLoading(false);
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

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    marginBottom: 5,
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
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75,
  },
});
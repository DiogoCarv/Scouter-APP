import { Pressable, StyleSheet, Text, View, TextInput, Alert, Button, Image, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../context/AuthProvider";
import { Link, router, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function Model() {
  axios.defaults.baseURL = "http://192.168.1.5:3002/";

  const { user, logout, getLocation } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);

  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getLocation();
      if (location) {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
      }
    };

    fetchLocation();
  }, [getLocation]);

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

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
      const datePublicacao = agora.toISOString().split('T')[0];
      const horaPublicacao = agora.toTimeString().split(' ')[0];
  
      const publicacao = {
        imagem_publicacao: imageUrl,
        titulo_publicacao: titulo,
        descricao_publicacao: descricao,
        estado_publicacao: estado,
        cidade_publicacao: cidade,
        id_usuario: user.id,
        date_publicacao: datePublicacao,
        hora_publicacao: horaPublicacao,
        latitude_publicacao: latitude,
        longitude_publicacao: longitude,
      };
  
      console.log("Dados da publicação:", publicacao);
  
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>PUBLICAR</Text>

          <Pressable onPress={pickImage}>
            <Image
              source={{
                uri: image || 'https://cokimoveis.com.br/img/sem_foto.png',
              }}
              style={styles.image}
            />
          </Pressable>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="TÍTULO"
              onChangeText={(value) => {
                const capitalizedValue = capitalizeFirstLetter(value);
                setTitulo(capitalizedValue);
              }}
              value={titulo}
              maxLength={100}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="DESCRIÇÃO"
              onChangeText={(value) => {
                const capitalizedValue = capitalizeFirstLetter(value);
                setDescricao(capitalizedValue);
              }}
              value={descricao}
              maxLength={100}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Picker
              selectedValue={estado}
              style={{ height: 50, width: '100%', color: '#000' }}
              onValueChange={handleEstadoChange}
            >
              <Picker.Item label="Selecione o Estado" value="" />
              {Object.keys(estadosECidades).map((uf) => (
                <Picker.Item key={uf} label={uf} value={uf} />
              ))}
            </Picker>
          </View>

          <View style={styles.inputWrapper}>
            <Picker
              selectedValue={cidade}
              style={{ height: 50, width: '100%', color: '#000' }}
              onValueChange={setCidade}
              enabled={cidadesDisponiveis.length > 0}
            >
              <Picker.Item label="Selecione a Cidade" value="" />
              {cidadesDisponiveis.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>

          <Pressable style={styles.button} onPress={Cadastrar}>
            <Text style={styles.text}>PUBLICAR</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 12,
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#000',
    width: '100%',
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
    width: '100%',
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
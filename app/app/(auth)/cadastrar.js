import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, Image, View, Alert, TextInput, ScrollView, Button, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from "../../context/AuthProvider";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export default function Login() {
  axios.defaults.baseURL = "http://192.168.1.5:3002/";

  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const [email, setEmail] = useState('');
  const [cpf, setCPF] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [senha, setSenha] = useState('');
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
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
    if (!email || !cpf || !cidade || !estado || !nome || !sobrenome || !senha) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos.');
      return;
    }

    if (!file) {
      Alert.alert('Erro', 'Por favor, selecione uma imagem.');
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await onFileUpload();

      const usuario = {
        imagem_usuario: imageUrl,
        nome_usuario: nome,
        sobrenome_usuario: sobrenome,
        email_usuario: email,
        cpf_usuario: cpf.replace(/\D/g, ''),
        estado_usuario: estado,
        cidade_usuario: cidade,
        senha_usuario: senha,
      };

      console.log(usuario);
      const response = await axios.post('/usuarios', usuario);
      console.log("Resposta do servidor:", response);

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
        router.push("/(auth)/login");
      } else {
        Alert.alert('Erro', 'Erro ao cadastrar usuário.');
      }
    } catch (error) {
      console.error("Erro completo:", error);
      if (error.response && error.response.status === 409) {
        Alert.alert('Erro', 'E-mail ou CPF já cadastrados!');
      } else {
        Alert.alert('Erro', 'Erro ao cadastrar usuário. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const alternarVisibilidadeSenha = () => {
    setSenhaVisivel(!senhaVisivel);
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

  const irParaLogin = () => {
    router.push("/(auth)/login");
  };

  const formatCPF = (value) => {
    const numericValue = value.replace(/\D/g, '');
    const limitedValue = numericValue.slice(0, 11);

    if (limitedValue.length <= 3) {
      return limitedValue;
    } else if (limitedValue.length <= 6) {
      return `${limitedValue.slice(0, 3)}.${limitedValue.slice(3)}`;
    } else if (limitedValue.length <= 9) {
      return `${limitedValue.slice(0, 3)}.${limitedValue.slice(3, 6)}.${limitedValue.slice(6)}`;
    } else {
      return `${limitedValue.slice(0, 3)}.${limitedValue.slice(3, 6)}.${limitedValue.slice(6, 9)}-${limitedValue.slice(9)}`;
    }
  };

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={safe.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.wrapper}>
            <Text style={styles.title}>CADASTRAR</Text>

            <View style={styles.contentBox}>
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
                  onChangeText={setEmail}
                  placeholder={'EMAIL'}
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  onChangeText={(value) => {
                    const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                    const capitalizedValue = capitalizeFirstLetter(filteredValue);
                    setNome(capitalizedValue);
                  }}
                  value={nome}
                  placeholder={'NOME'}
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  onChangeText={(value) => {
                    const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                    const capitalizedValue = capitalizeFirstLetter(filteredValue);
                    setSobrenome(capitalizedValue);
                  }}
                  value={sobrenome}
                  placeholder={'SOBRENOME'}
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  onChangeText={(value) => {
                    const formattedCPF = formatCPF(value);
                    setCPF(formattedCPF);
                  }}
                  value={cpf}
                  placeholder={'CPF'}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Picker
                  selectedValue={estado}
                  style={{ height: 50, width: '100%', color: '#000' }} // Ajuste no estilo do Picker
                  onValueChange={handleEstadoChange}
                >
                  <Picker.Item label="Estado" value="" />
                  {Object.keys(estadosECidades).map((uf) => (
                    <Picker.Item key={uf} label={uf} value={uf} />
                  ))}
                </Picker>
              </View>

              <View style={styles.inputWrapper}>
                <Picker
                  selectedValue={cidade}
                  style={{ height: 50, width: '100%', color: '#000' }} // Ajuste no estilo do Picker
                  onValueChange={setCidade}
                >
                  <Picker.Item label="Cidade" value="" />
                  {cidadesDisponiveis.map((city) => (
                    <Picker.Item key={city} label={city} value={city} />
                  ))}
                </Picker>
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!senhaVisivel}
                  onChangeText={setSenha}
                  value={senha}
                  placeholder="SENHA"
                />
                <Pressable onPress={alternarVisibilidadeSenha} style={styles.iconWrapper}>
                  <Ionicons
                    name={senhaVisivel ? 'eye' : 'eye-off'}
                    size={24}
                    color="#888"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable style={botao.button} onPress={Cadastrar}>
              <Text style={styles.text}>CADASTRAR</Text>
            </Pressable>
            <Pressable style={botao.button} onPress={irParaLogin}>
              <Text style={styles.text}>JÁ TENHO CONTA</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
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

const safe = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
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

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    marginBottom: 20,
    position: 'absolute',
    top: 20,
  },
  contentBox: {
    backgroundColor: '#D3D3D3',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
    marginTop: 100,
    flex: 1,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 12,
    height: 40,
    width: '80%',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#000',
    width: '100%',
  },
  iconWrapper: {
    marginLeft: 8,
  },
  wrapper: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
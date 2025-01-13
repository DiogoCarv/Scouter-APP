import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, Image, View, Alert, TextInput } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from "../../context/AuthProvider";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface IndexProps {
  onPress?: () => void;
  title?: string;
}

export default function Login({ onPress, title = 'VOLTAR' }: IndexProps) {
  axios.defaults.baseURL = "http://localhost:3000/";

  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [cpf, setCPF] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [senha, setSenha] = useState('');
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);

  const alternarVisibilidadeSenha = () => {
    setSenhaVisivel(!senhaVisivel);
  };

  const Cadastrar = async () => {
    const cleanedCPF = cpf.replace(/\D/g, '');
    
    const jsonBody = {
      email_usuario: email,
      nome_usuario: nome,
      cpf_usuario: cleanedCPF,
      cidade_usuario: cidade,
      estado_usuario: estado,
      senha_usuario: senha,
      sobrenome_usuario: sobrenome,
    };
  
    try {
      const response = await axios.post("usuarios", jsonBody);
      if (response.status === 201) {
        Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
        router.push("/(auth)/login");
      } else {
        Alert.alert("Erro", response.data.mensagem || "Erro ao cadastrar o usuário.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Erro", "Não foi possível realizar o cadastro.");
    }
  };

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

  const irParaLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={safe.container}>
        <Text style={styles.title}>CADASTRAR</Text>

        <View style={styles.contentBox}>

          <TextInput
            style={texto.input}
            onChangeText={setEmail}
            placeholder={'EMAIL'}
          />

          <TextInput
            style={texto.input}
            onChangeText={(value) => {
              const sanitizedValue = value.replace(/[^a-zA-Zà-úÀ-Ú\s]/g, '').slice(0, 100);
              setNome(sanitizedValue);
            }}
            value={nome}
            placeholder={'NOME'}
            maxLength={100}
          />

          <TextInput
            style={texto.input}
            onChangeText={(value) => {
              const sanitizedValue = value.replace(/[^a-zA-Zà-úÀ-Ú\s]/g, '').slice(0, 100);
              setSobrenome(sanitizedValue);
            }}
            value={sobrenome}
            placeholder={'SOBRENOME'}
            maxLength={100}
          />

          <TextInput
            style={texto.input}
            onChangeText={(value) => {
              const numericValue = value.replace(/\D/g, '');

              let formattedCPF = numericValue;
              if (numericValue.length > 3) {
                formattedCPF = numericValue.slice(0, 3) + '.' + numericValue.slice(3);
              }
              if (numericValue.length > 6) {
                formattedCPF =
                  formattedCPF.slice(0, 7) + '.' + numericValue.slice(6);
              }
              if (numericValue.length > 9) {
                formattedCPF =
                  formattedCPF.slice(0, 11) + '-' + numericValue.slice(9, 11);
              }

              setCPF(formattedCPF);
            }}
            value={cpf}
            placeholder={'CPF'}
            maxLength={14}
            keyboardType="numeric"
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

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!senhaVisivel}
              onChangeText={setSenha}
              value={senha}
              placeholder="SENHA"
              placeholderTextColor="#888"
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const texto = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
});

const safe = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
    width: '90%',
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
});

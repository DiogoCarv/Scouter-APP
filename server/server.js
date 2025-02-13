const express = require('express');
const app = express();
const port = 3002;
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use(bodyParser.json());
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

var cors = require('cors');
app.use(express.static("public"));
app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.get('/', (req, res) => res.json({ message: 'Funcionando!' }));

const privateKey = process.env.JWT_SECRET || "defaultSecret";

const cloudinary = require('./cloudinary'); // Importa a configuração do Cloudinary
const path = require('path');
const fs = require('fs');

const uploadImage = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: 'uploads', // Opcional: organiza imagens em uma pasta específica no Cloudinary
        });

        console.log('Upload bem-sucedido:', result.secure_url);
        return result.secure_url; // Retorna o link da imagem hospedada
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        throw error;
    }
};

const jwt = require("jsonwebtoken");
//const privateKey = "xxxyyyzzz123";

const middlewareValidarJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];
    if (!token) {
        return res.status(401).json({ mensagem: "Token não fornecido." });
    }
    jwt.verify(token, privateKey, (err, userInfo) => {
        if (err) {
            return res.status(403).json({ mensagem: "Token inválido ou expirado." });
        }
        req.userInfo = userInfo;
        next();
    });
};

jwt.verify(jwtToken, privateKey, (err, userInfo) => {
    if (err) {
        return res.status(403).json({ mensagem: "Token inválido ou expirado." });
    }
    req.userInfo = userInfo;
    next();
});

const db = {
    host: '3.209.65.64',
    port: 3306,
    user: 'diogo',
    password: 'diogo',
    database: 'diogo'
};

const execSQLQuery = (sqlQry, id, res) => {
    const connection = mysql.createConnection(db);

    connection.query(sqlQry, id, (error, results, fields) => {
        if (error)
            res.json(error);
        else
            res.json(results);

        connection.end();
        console.log('executou!');
    });
};

async function resultSQLQuery(sqlQry, id) {
    const connection = await mysql.createConnection(db);

    let [result] = await connection.promise().query(sqlQry, id);
    try {
        return result;
    } catch (error) {
        console.log("error" + error);
        throw error;
    }
}

app.listen(port, () => {
    console.log(`API funcionando na porta ${port}!`);
});

//POST

app.post('/usuarios', async (req, res) => {
    const data = req.body;

    // Verifica se todos os campos obrigatórios estão presentes
    if (!data.nome_usuario || !data.sobrenome_usuario || !data.email_usuario ||
        !data.cpf_usuario || !data.estado_usuario || !data.cidade_usuario || !data.senha_usuario) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }

    // Verifica se o CPF tem exatamente 11 dígitos
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(data.cpf_usuario)) {
        return res.status(400).json({ mensagem: "O CPF deve conter exatamente 11 dígitos numéricos!" });
    }

    // Verifica o formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email_usuario)) {
        return res.status(400).json({ mensagem: "Formato de e-mail inválido!" });
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(data.senha_usuario, 10);

    const usuario = [
        data.imagem_usuario || null,
        data.nome_usuario,
        data.sobrenome_usuario,
        data.email_usuario,
        data.cpf_usuario,
        data.estado_usuario,
        data.cidade_usuario,
        senhaHash
    ];

    try {
        const query = `
            INSERT INTO usuarios (
                imagem_usuario, nome_usuario, sobrenome_usuario, 
                email_usuario, cpf_usuario, estado_usuario, cidade_usuario, senha_usuario
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await resultSQLQuery(query, usuario);

        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ mensagem: "E-mail ou CPF já cadastrados!" });
        } else {
            console.error(error);
            res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
        }
    }
});

app.post('/login', async (req, res) => {
    const data = req.body;
    const email = data.email_usuario;
    const senha = data.senha_usuario;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios." });
    }

    const query = 'SELECT * FROM usuarios WHERE email_usuario = ?';
    const id = [email];

    try {
        const [user] = await resultSQLQuery(query, id);

        if (!user) {
            return res.status(401).json({ mensagem: "Credenciais inválidas." });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha_usuario);
        if (!senhaValida) {
            return res.status(401).json({ mensagem: "Credenciais inválidas." });
        }

        jwt.sign({ email: user.email_usuario }, privateKey, (err, token) => {
            if (err) {
                res.status(500).json({ mensagem: "Erro ao gerar o JWT." });
                return;
            }

            res.set("x-access-token", token);
            res.status(200).json({
                mensagem: "Login realizado com sucesso!",
                token,
                id_usuario: user.id_usuario,
                nome_usuario: user.nome_usuario,
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro interno." });
    }
});

app.post('/publicacao', middlewareValidarJWT, async (req, res) => {
    const data = req.body;

    // Verifique se os campos estão presentes no corpo da requisição
    console.log("Dados recebidos no backend:", data);

    // Verificação dos campos obrigatórios
    const camposObrigatorios = [
        'imagem_publicacao',
        'titulo_publicacao',
        'descricao_publicacao',
        'estado_publicacao',
        'cidade_publicacao',
        'id_usuario',
        'date_publicacao',
        'hora_publicacao',
        'latitude_publicacao',
        'longitude_publicacao',
    ];

    for (const campo of camposObrigatorios) {
        if (data[campo] === undefined || data[campo] === null || data[campo] === '') {
            return res.status(400).json({ mensagem: `O campo ${campo} é obrigatório e não pode estar vazio.` });
        }
    }

    // Verificação adicional para latitude e longitude
    if (isNaN(data.latitude_publicacao) || isNaN(data.longitude_publicacao)) {
        return res.status(400).json({ mensagem: "Latitude e longitude devem ser números válidos." });
    }

    // Verificação do formato da data e hora
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date_publicacao)) {
        return res.status(400).json({ mensagem: "Formato de data inválido. Use YYYY-MM-DD." });
    }

    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRegex.test(data.hora_publicacao)) {
        return res.status(400).json({ mensagem: "Formato de hora inválido. Use HH:MM:SS." });
    }

    // Preparação dos dados para inserção
    const publicacao = [
        data.imagem_publicacao,
        data.titulo_publicacao,
        data.descricao_publicacao,
        data.estado_publicacao,
        data.cidade_publicacao,
        data.id_usuario,
        data.date_publicacao, // Formato YYYY-MM-DD
        data.hora_publicacao, // Formato HH:MM:SS
        parseFloat(data.latitude_publicacao), // Garante que é um número
        parseFloat(data.longitude_publicacao), // Garante que é um número
    ];

    try {
        const query = `
            INSERT INTO publicacao (
                imagem_publicacao, titulo_publicacao, descricao_publicacao, estado_publicacao, 
                cidade_publicacao, id_usuario, date_publicacao, hora_publicacao, latitude_publicacao, longitude_publicacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        console.log("Executando query:", query);
        console.log("Com os valores:", publicacao);

        await resultSQLQuery(query, publicacao);

        res.status(201).json({ mensagem: "Publicação criada com sucesso!" });
    } catch (error) {
        console.error("Erro ao executar a query:", error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(400).json({ mensagem: "Usuário associado não encontrado!" });
        } else {
            res.status(500).json({ mensagem: "Erro ao criar a publicação." });
        }
    }
});

app.post('/upload', middlewareValidarJWT, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ mensagem: "Nenhum arquivo enviado." });
    }
    try {
        const filePath = req.file.path; // Defina o caminho correto para o arquivo enviado
        const imageUrl = await uploadImage(filePath);
        res.status(200).json({ mensagem: "Upload bem-sucedido.", url: imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao fazer upload da imagem." });
    } finally {
        fs.unlinkSync(req.file.path); // Remove o arquivo local após o upload
    }
});

//DELETE

app.delete('/usuarios/:id_usuario', middlewareValidarJWT, async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const queryUsuarioExiste = 'SELECT * FROM usuarios WHERE id_usuario = ?';
        const [usuarioExistente] = await resultSQLQuery(queryUsuarioExiste, [id_usuario]);

        if (!usuarioExistente) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        const queryDelete = 'DELETE FROM usuarios WHERE id_usuario = ?';
        await resultSQLQuery(queryDelete, [id_usuario]);

        res.status(200).json({ mensagem: "Usuário deletado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao deletar o usuário." });
    }
});

app.delete('/publicacao/:id_publicacao', middlewareValidarJWT, async (req, res) => {
    const { id_publicacao } = req.params;

    try {
        const queryPublicacaoExiste = 'SELECT * FROM publicacao WHERE id_publicacao = ?';
        const [publicacaoExistente] = await resultSQLQuery(queryPublicacaoExiste, [id_publicacao]);

        if (!publicacaoExistente) {
            return res.status(404).json({ mensagem: "Publicação não encontrada." });
        }

        const queryDelete = 'DELETE FROM publicacao WHERE id_publicacao = ?';
        await resultSQLQuery(queryDelete, [id_publicacao]);

        res.status(200).json({ mensagem: "Publicação deletada com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao deletar a publicação." });
    }
});

//PUT

app.put('/usuarios/:id_usuario', middlewareValidarJWT, async (req, res) => {
    const { id_usuario } = req.params;
    const data = req.body;

    const queryUsuarioExiste = 'SELECT * FROM usuarios WHERE id_usuario = ?';
    try {
        const [usuarioExistente] = await resultSQLQuery(queryUsuarioExiste, [id_usuario]);

        if (!usuarioExistente) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        const camposPermitidos = [
            'imagem_usuario',
            'nome_usuario',
            'sobrenome_usuario',
            'email_usuario',
            'cpf_usuario',
            'estado_usuario',
            'cidade_usuario',
            'senha_usuario'
        ];

        const camposAtualizados = {};
        for (const campo of camposPermitidos) {
            if (data[campo] !== undefined) {
                camposAtualizados[campo] = data[campo];
            }
        }

        if (Object.keys(camposAtualizados).length === 0) {
            return res.status(400).json({ mensagem: "Nenhum campo válido fornecido para atualização." });
        }

        if (camposAtualizados.senha_usuario) {
            camposAtualizados.senha_usuario = await bcrypt.hash(camposAtualizados.senha_usuario, 10);
        }

        const setClause = Object.keys(camposAtualizados).map(campo => `${campo} = ?`).join(', ');
        const valores = Object.values(camposAtualizados);
        valores.push(id_usuario);

        const queryUpdate = `UPDATE usuarios SET ${setClause} WHERE id_usuario = ?`;

        await resultSQLQuery(queryUpdate, valores);

        res.status(200).json({ mensagem: "Usuário atualizado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao atualizar o usuário." });
    }
});

app.put('/publicacao/:id_publicacao', middlewareValidarJWT, async (req, res) => {
    const { id_publicacao } = req.params;
    const data = req.body;

    try {
        const queryPublicacaoExiste = 'SELECT * FROM publicacao WHERE id_publicacao = ?';
        const [publicacaoExistente] = await resultSQLQuery(queryPublicacaoExiste, [id_publicacao]);

        if (!publicacaoExistente) {
            return res.status(404).json({ mensagem: "Publicação não encontrada." });
        }

        const camposPermitidos = [
            'imagem_publicacao',
            'titulo_publicacao',
            'descricao_publicacao',
            'estado_publicacao',
            'cidade_publicacao',
        ];

        const camposAtualizados = {};
        for (const campo of camposPermitidos) {
            if (data[campo] !== undefined) {
                camposAtualizados[campo] = data[campo];
            }
        }

        if (Object.keys(camposAtualizados).length === 0) {
            return res.status(400).json({ mensagem: "Nenhum campo válido fornecido para atualização." });
        }

        const setClause = Object.keys(camposAtualizados).map(campo => `${campo} = ?`).join(', ');
        const valores = Object.values(camposAtualizados);
        valores.push(id_publicacao);

        const queryUpdate = `UPDATE publicacao SET ${setClause} WHERE id_publicacao = ?`;

        await resultSQLQuery(queryUpdate, valores);

        res.status(200).json({ mensagem: "Publicação atualizada com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao atualizar a publicação." });
    }
});

//GET

app.get('/publicacao/:id_publicacao', middlewareValidarJWT, async (req, res) => {
    const { id_publicacao } = req.params;

    try {
        const query = `
            SELECT 
                p.id_publicacao, 
                p.titulo_publicacao,
                p.imagem_publicacao, 
                p.descricao_publicacao, 
                p.estado_publicacao, 
                p.cidade_publicacao, 
                p.id_usuario,
                p.hora_publicacao, -- Novo campo para a hora
                p.date_publicacao, -- Novo campo para a data
                p.latitude_publicacao,
                p.longitude_publicacao,
                u.nome_usuario, 
                u.sobrenome_usuario 
            FROM publicacao p
            INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.id_publicacao = ?
        `;

        const publicacao = await resultSQLQuery(query, [id_publicacao]);

        if (!publicacao || publicacao.length === 0) {
            return res.status(404).json({ mensagem: "Publicação não encontrada." });
        }

        res.status(200).json(publicacao[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao buscar a publicação." });
    }
});

app.get('/usuarios/:id_usuario', middlewareValidarJWT, async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const query = `
            SELECT 
                u.id_usuario,
                u.nome_usuario,
                u.sobrenome_usuario,
                u.email_usuario,
                u.imagem_usuario,
                u.cpf_usuario,
                u.estado_usuario,
                u.cidade_usuario
            FROM usuarios u
            WHERE u.id_usuario = ?
        `;

        const usuario = await resultSQLQuery(query, [id_usuario]);

        if (!usuario || usuario.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        res.status(200).json(usuario[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao buscar o usuário." });
    }
});

app.get('/publicacao', middlewareValidarJWT, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id_publicacao, 
                p.titulo_publicacao,
                p.imagem_publicacao, 
                p.descricao_publicacao, 
                p.estado_publicacao, 
                p.cidade_publicacao,
                p.id_usuario,
                p.hora_publicacao, -- Novo campo para a hora
                p.date_publicacao, -- Novo campo para a data
                p.latitude_publicacao,
                p.longitude_publicacao,
                u.nome_usuario, 
                u.sobrenome_usuario 
            FROM publicacao p
            INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
        `;

        const publicacoes = await resultSQLQuery(query, []);

        res.status(200).json(publicacoes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao buscar as publicações." });
    }
});

app.get('/usuarios', middlewareValidarJWT, (req, res) => {
    const id = [];
    execSQLQuery('SELECT * FROM usuarios', id, res);
});


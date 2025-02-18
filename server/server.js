const port = 3002;

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const app = express();

app.use(cors());

// Configurações do Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const privateKey = process.env.JWT_SECRET || "defaultSecret";

// Middleware para validar JWT
const middlewareValidarJWT = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        console.error("Token não fornecido.");
        return res.status(401).json({ mensagem: "Token não fornecido." });
    }

    console.log("Token recebido:", token);

    jwt.verify(token, privateKey, (err, userInfo) => {
        if (err) {
            console.error("Erro ao verificar o token:", err);
            return res.status(403).json({ mensagem: "Token inválido ou expirado." });
        }
        console.log("Token válido para o usuário:", userInfo);
        req.userInfo = userInfo;
        next();
    });
};

const db = {
    host: '3.209.65.64',
    port: 3306,
    user: 'diogo',
    password: 'diogo',
    database: 'diogo'
};

const connection = mysql.createConnection(db);

connection.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
    } else {
        console.log("Conexão ao banco de dados bem-sucedida!");
    }
    connection.end();
});

// Função para executar queries SQL
const execSQLQuery = (sqlQry, id, res) => {
    const connection = mysql.createConnection(db);

    connection.query(sqlQry, id, (error, results, fields) => {
        if (error) {
            console.error("Erro na execução da query:", error);
            res.status(500).json({ mensagem: "Erro ao executar a query.", erro: error });
        } else {
            res.json(results);
        }
        connection.end();
        console.log('Query executada com sucesso.');
    });
};

// Função assíncrona para executar queries SQL
async function resultSQLQuery(sqlQry, id) {
    const connection = await mysql.createConnection(db);

    try {
        const [result] = await connection.promise().query(sqlQry, id);
        return result;
    } catch (error) {
        console.error("Erro na execução da query assíncrona:", error);
        throw error;
    } finally {
        connection.end();
    }
}

//POST

app.post('/usuarios', async (req, res) => {
    const data = req.body;
    console.log("Dados recebidos:", data);

    // Verifica se todos os campos obrigatórios estão presentes
    if (!data.nome_usuario || !data.sobrenome_usuario || !data.email_usuario ||
        !data.cpf_usuario || !data.estado_usuario || !data.cidade_usuario || !data.senha_usuario) {
        console.error("Campos obrigatórios faltando:", data);
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }

    // Verifica se o CPF tem exatamente 11 dígitos
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(data.cpf_usuario)) {
        console.error("CPF inválido:", data.cpf_usuario);
        return res.status(400).json({ mensagem: "O CPF deve conter exatamente 11 dígitos numéricos!" });
    }

    // Verifica o formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email_usuario)) {
        console.error("E-mail inválido:", data.email_usuario);
        return res.status(400).json({ mensagem: "Formato de e-mail inválido!" });
    }

    const usuario = [
        data.imagem_usuario || null,
        data.nome_usuario,
        data.sobrenome_usuario,
        data.email_usuario,
        data.cpf_usuario,
        data.estado_usuario,
        data.cidade_usuario,
        data.senha_usuario
    ];

    try {
        const query = `
            INSERT INTO usuarios (
                imagem_usuario, nome_usuario, sobrenome_usuario, 
                email_usuario, cpf_usuario, estado_usuario, cidade_usuario, senha_usuario
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        console.log("Query a ser executada:", query);
        console.log("Valores a serem inseridos:", usuario);

        await resultSQLQuery(query, usuario);

        console.log("Usuário cadastrado com sucesso:", usuario);

        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ mensagem: "E-mail ou CPF já cadastrados!" });
        } else {
            res.status(500).json({ mensagem: "Erro ao cadastrar usuário.", erro: error.message });
        }
    }
});

app.post('/login', async (req, res) => {
    const data = req.body;
    const email = data.email_usuario;
    const senha = data.senha_usuario;

    if (!email || !senha) {
        console.error("E-mail ou senha faltando:", data);
        return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios." });
    }

    const query = 'SELECT * FROM usuarios WHERE email_usuario = ?';
    const id = [email];

    try {
        const [user] = await resultSQLQuery(query, id);

        if (!user) {
            console.error("Usuário não encontrado:", email);
            return res.status(401).json({ mensagem: "Credenciais inválidas." });
        }

        // Verifica a senha em texto plano
        if (senha !== user.senha_usuario) {
            console.error("Senha incorreta para o usuário:", email);
            return res.status(401).json({ mensagem: "Credenciais inválidas." });
        }

        jwt.sign({ email: user.email_usuario }, privateKey, (err, token) => {
            if (err) {
                console.error("Erro ao gerar o JWT:", err);
                return res.status(500).json({ mensagem: "Erro ao gerar o JWT." });
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
        console.error("Erro no login:", error);
        res.status(500).json({ mensagem: "Erro interno.", erro: error.message });
    }
});

app.post('/publicacao', middlewareValidarJWT, async (req, res) => {
    const data = req.body;

    // Log dos dados recebidos
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
            console.error(`Campo obrigatório faltando ou vazio: ${campo}`);
            return res.status(400).json({ 
                mensagem: `O campo ${campo} é obrigatório e não pode estar vazio.`,
                campo: campo,
                valorRecebido: data[campo]
            });
        }
    }

    // Verificação adicional para latitude e longitude
    if (isNaN(data.latitude_publicacao) || isNaN(data.longitude_publicacao)) {
        console.error("Latitude ou longitude inválida:", {
            latitude: data.latitude_publicacao,
            longitude: data.longitude_publicacao
        });
        return res.status(400).json({ 
            mensagem: "Latitude e longitude devem ser números válidos.",
            latitude: data.latitude_publicacao,
            longitude: data.longitude_publicacao
        });
    }

    // Verificação do formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date_publicacao)) {
        console.error("Formato de data inválido:", data.date_publicacao);
        return res.status(400).json({ 
            mensagem: "Formato de data inválido. Use YYYY-MM-DD.",
            dataRecebida: data.date_publicacao
        });
    }

    // Verificação do formato da hora
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRegex.test(data.hora_publicacao)) {
        console.error("Formato de hora inválido:", data.hora_publicacao);
        return res.status(400).json({ 
            mensagem: "Formato de hora inválido. Use HH:MM:SS.",
            horaRecebida: data.hora_publicacao
        });
    }

    // Preparação dos dados para inserção
    const publicacao = [
        data.imagem_publicacao,
        data.titulo_publicacao,
        data.descricao_publicacao,
        data.estado_publicacao,
        data.cidade_publicacao,
        data.id_usuario,
        data.date_publicacao,
        data.hora_publicacao,
        parseFloat(data.latitude_publicacao),
        parseFloat(data.longitude_publicacao),
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

        console.log("Publicação criada com sucesso:", publicacao);
        res.status(201).json({ mensagem: "Publicação criada com sucesso!" });
    } catch (error) {
        console.error("Erro ao criar a publicação:", error);

        // Tratamento de erros específicos
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            console.error("Usuário associado não encontrado:", data.id_usuario);
            return res.status(400).json({ 
                mensagem: "Usuário associado não encontrado!",
                idUsuario: data.id_usuario
            });
        } else if (error.code === 'ER_DUP_ENTRY') {
            console.error("Publicação duplicada:", publicacao);
            return res.status(409).json({ 
                mensagem: "Publicação duplicada. Verifique os dados enviados.",
                dados: publicacao
            });
        } else if (error.code === 'ER_BAD_NULL_ERROR') {
            console.error("Campo obrigatório faltando no banco de dados:", error.sqlMessage);
            return res.status(400).json({ 
                mensagem: "Um campo obrigatório não foi fornecido.",
                erro: error.sqlMessage
            });
        } else {
            console.error("Erro desconhecido ao criar a publicação:", error);
            return res.status(500).json({ 
                mensagem: "Erro ao criar a publicação.",
                erro: error.message,
                codigo: error.code
            });
        }
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

app.listen(port, () => {
    console.log(`API funcionando na porta ${port}!`);
});
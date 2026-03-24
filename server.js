// =============================================================
// server.js — Servidor Principal da API do Haruy Sushi
// =============================================================
// Aula 6: API Middleware and Error Handling
//
// O que aprendemos nesta aula?
//   1. O que são Middlewares e para que servem
//   2. Criar um Middleware de Log (logger.js)
//   3. Criar um Middleware de Tratamento de Erros (errorHandler.js)
//   4. Tratar rotas não encontradas (Erro 404)
//   5. A ORDEM dos middlewares importa muito!
//
// Fluxo de uma Requisição (com Middlewares):
//
//  App Mobile
//     │
//     ▼
//  [cors()]              ← Middleware 1: Libera acesso de outras origens
//     │
//     ▼
//  [express.json()]      ← Middleware 2: Transforma o body em JSON
//     │
//     ▼
//  [logger]              ← Middleware 3: Anota a requisição no terminal
//     │
//     ▼
//  Rota correta          ← A requisição chega na rota certa
//  (ex: GET /api/produtos)
//     │
//     ▼ (se der erro)
//  [errorHandler]        ← Captura qualquer erro das rotas
//     │
//     ▼
//  Resposta enviada ao App Mobile
//
// =============================================================


// ─── 1. Importações das Dependências ─────────────────────────
// express: framework web para criar o servidor e as rotas
const express = require('express');

// cors: permite que o App Mobile (em outro domínio) acesse nossa API
// Sem CORS, o navegador bloquearia as requisições por segurança!
const cors = require('cors');


// ─── 2. Importação dos Middlewares Customizados ───────────────
// São os arquivos que criamos na pasta /middlewares

// Logger: registra no terminal toda requisição que chega
const logger = require('./middlewares/logger');

// ErrorHandler: captura qualquer erro não tratado nas rotas
const errorHandler = require('./middlewares/errorHandler');


// ─── 3. Criação da Aplicação Express ─────────────────────────
// app é o nosso "servidor". É nele que registramos middlewares e rotas.
const app = express();


// ─── 4. Middlewares Globais do Express ────────────────────────
// app.use() registra um middleware para TODAS as requisições.
// A ORDEM importa! Eles são executados de cima para baixo.

// Habilita CORS (Cross-Origin Resource Sharing).
// Sem isso, o browser bloquearia chamadas do App Mobile para nossa API.
app.use(cors());

// Habilita a leitura de JSON no corpo das requisições (req.body).
// Sem isso, req.body seria undefined em POST e PUT.
app.use(express.json());

// =============================================================
// ── NOVO NA AULA 6: Middleware de Log ─────────────────────────
// Vem APÓS os middlewares do Express, mas ANTES das rotas.
// Assim toda requisição passa pelo logger antes de chegar nas rotas.
// =============================================================
app.use(logger);


// ─── 5. Rota de Boas-Vindas ───────────────────────────────────
// Rota raiz — útil para verificar se o servidor está no ar.
// Acesse: http://localhost:3000
app.get('/', (req, res) => {
    res.json({ mensagem: '🍣 Bem-vindo à API do Haruy Sushi! (Aula 6)' });
});


// ─── 6. Importação e Registro das Rotas ───────────────────────
// Importamos os arquivos de rota da pasta /routes
const rotasCategorias = require('./routes/categorias');
const rotasProdutos = require('./routes/produtos');

// app.use('prefixo', router) registra o router com um prefixo de URL.
// Toda rota definida dentro de categorias.js ficará em /api/categorias/...
// Toda rota definida dentro de produtos.js ficará em /api/produtos/...
app.use('/api/categorias', rotasCategorias);
app.use('/api/produtos', rotasProdutos);


// =============================================================
// ── NOVO NA AULA 6: Tratamento de Rota não encontrada (404) ──
// Este middleware DEVE vir DEPOIS de todas as rotas registradas.
// Se a requisição chegou até aqui, nenhuma rota correspondeu.
// Isso é o nosso "rota não encontrada" personalizado.
//
// Exemplo: GET /api/batata → cai aqui!
// =============================================================
app.use((req, res, next) => {
    res.status(404).json({
        sucesso: false,
        mensagem: `Rota '${req.url}' não encontrada na API do Haruy Sushi.`
    });
});


// =============================================================
// ── NOVO NA AULA 6: Middleware de Erros Global ────────────────
// ⚠️ DEVE SER SEMPRE O ÚLTIMO middleware registrado!
// Ele só "acorda" quando uma rota chama next(err) ou joga throw new Error().
// Como tem 4 parâmetros (err, req, res, next), o Express sabe que é
// um middleware de erro e chama automaticamente em caso de problema.
// =============================================================
app.use(errorHandler);


// ─── 7. Iniciando o Servidor ──────────────────────────────────
// Definimos a porta como constante para facilitar a mudança depois.
const PORTA = process.env.PORT ||3000;

// app.listen() inicia o servidor na porta definida.
// O callback (função passada como parâmetro) é executado
// assim que o servidor está pronto para receber requisições.
app.listen(PORTA, () => {
    console.log('');
    console.log('🚀 ================================');
    console.log(`🚀 Servidor rodando!`);
    console.log(`🚀 Porta local: ${PORTA}`);
    console.log('🚀 ================================');
    console.log('');
    console.log('📋 Rotas disponíveis:');
    console.log(`   GET    /api/categorias`);
    console.log(`   POST   /api/categorias`);
    console.log(`   GET    /api/produtos`);
    console.log(`   GET    /api/produtos/:id`);
    console.log(`   POST   /api/produtos`);
    console.log(`   PUT    /api/produtos/:id`);
    console.log(`   DELETE /api/produtos/:id`);
    console.log('');
    console.log('💣 Rota de teste de erro:');
    console.log(`   GET    http://localhost:${PORTA}/api/produtos/erro-teste`);
    console.log('');
});
module.exports = app;
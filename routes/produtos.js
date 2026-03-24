const express = require('express');
const router = express.Router();
// Certifique-se de que o arquivo database.js exporta o cliente do supabase
const supabase = require('../data/database'); 

router.get('/erro-teste', (req, res) => {
    throw new Error("O servidor do Haruy Sushi tropeçou!");
});

// LISTAR PRODUTOS (COM FILTRO)
router.get('/', async (req, res, next) => {
    try {
        const { categoriaId } = req.query;
        let consulta = supabase.from('produtos').select('*');

        if (categoriaId) {
            consulta = consulta.eq('categoriaId', categoriaId);
        }

        // Correção: 'ascending' em vez de 'ascendir'
        const { data, error } = await consulta.order('id', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// BUSCAR POR ID
router.get('/:id', async (req, res, next) => { // Adicionado 'next' aqui
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        
        if (data) {
            res.json(data);
        } else {
            res.status(404).json({ mensagem: 'Não encontrado' });
        }
    } catch (err) {
        next(err);
    }
});

// CRIAR NOVO PRODUTO
router.post('/', async (req, res, next) => {
    try {
        // Correção: Usar req.body para pegar os dados enviados
        const { data, error } = await supabase
            .from('produtos')
            .insert([req.body]) 
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        next(err);
    }
});

// ATUALIZAR PRODUTO
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        // Correção: Usar req.body e passar o ID corretamente
        const { data, error } = await supabase
            .from('produtos')
            .update(req.body) 
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data && data.length > 0) {
            res.json(data[0]);
        } else {
            res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }
    } catch (err) {
        next(err);
    }
});

// DELETAR PRODUTO
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ mensagem: 'Produto deletado' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;

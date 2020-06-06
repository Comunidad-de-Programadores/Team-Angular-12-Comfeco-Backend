const express = require('express');
const app = express();

//Middelware
mdAutenticacion = require('../middlewares/autenticacion');

//Modelos
const categoriaModel = require('../model/categoria_model');

app.get('/', async(req, res) => {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 5;
    const desde = (page - 1) * limit;
    try {
        let categoriasEncontradas = await categoriaModel.find({}).skip(desde).limit(limit).exec();
        if (!categoriasEncontradas) {
            return res.status(200).json({
                ok: true,
                categoriasEncontradas: []
            });
        }
        categoriaModel.estimatedDocumentCount({}, (error, conteo) => {
            res.status(200).json({
                ok: true,
                categoriasEncontradas,
                count: Math.ceil(conteo / limit),
                page,
                limit
            });
        })
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
});

app.post('/', async(req, res) => {
    const body = req.body;
    try {
        const newCategoria = new categoriaModel({
            name: body.name
        });
        const categoriaGuardada = await newCategoria.save();
        return res.status(200).json({
            ok: true,
            mensaje: 'Categoria creada correctamente',
            categoriaGuardada
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
});


app.delete('/:id', async(req, res) => {
    const idCategoria = req.params.id;
    try {
        const categoriaRemovida = await categoriaModel.findByIdAndRemove(idCategoria);
        if (!categoriaRemovida) {
            return res.status(400).json({
                ok: true,
                mensaje: 'La categoria no existe',
            });
        }
        return res.status(200).json({
            ok: true,
            mensaje: 'Categoria eliminada correctamente',
            categoriaRemovida
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
});

module.exports = app;
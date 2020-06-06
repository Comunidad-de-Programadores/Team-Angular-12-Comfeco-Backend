const express = require('express');
const app = express();

//Modelos

const distritoModel = require('../model/distritos_model');


//Obtener Distrito

app.get('/', async(req, res) => {
    try {
        const distritosEncontrados = await distritoModel.find({});
        return res.status(200).json({
            ok: true,
            distritos: distritosEncontrados
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }

})

//crear Dsitrito

app.post('/', async(req, res) => {
    const body = req.body;
    const newDitristo = new distritoModel({
        name: body.name,
    })
    try {
        const distritoGuardado = await newDitristo.save();
        return res.status(200).json({
            ok: true,
            mensaje: 'Distrito creado correctamente',
            distritoGuardado
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
    const idDistrito = req.params.id;
    try {
        const districtoRemovido = await productoModel.findByIdAndRemove(idDistrito);
        if (!districtoRemovido) {
            return res.status(400).json({
                ok: true,
                mensaje: 'El distrito no existe',
            });
        }
        return res.status(200).json({
            ok: true,
            mensaje: 'Dsitrito eliminado correctamente',
            distrito: districtoRemovido
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
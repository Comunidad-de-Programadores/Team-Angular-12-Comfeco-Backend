const express = require('express');
const app = express();

//Modelos
const CreatorModel = require('../model/creator_model');

//Middelware
const mdAutenticacion = require('../middlewares/autenticacion');

//Obtener toda las comunidades

app.get('', mdAutenticacion, async(req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const desde = (page - 1) * limit;
    try {
        const listCreator = await CreatorModel.find().skip(desde).limit(limit).exec();
        const conteo = await CreatorModel.estimatedDocumentCount();
        return res.status(200).json({
            ok: true,
            listCreator,
            count: Math.ceil(conteo / limit),
            page,
            limit
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
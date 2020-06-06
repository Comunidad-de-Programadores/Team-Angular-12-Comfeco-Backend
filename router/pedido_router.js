const express = require('express');
const app = express();

//Modelos

const pedidoModel = require('../model/pedido_model');



//obtener pedido de un usuario
app.get('/', async(req, res) => {
    const query = req.query;
    const filters = {
        owner_id: query.owner_id,
        district: query.district
    }
    Object.keys(filters).forEach(key => (filters[key] === undefined || filters[key] === '') && delete filters[key])
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 5;
    const desde = (page - 1) * limit;
    const sort = {
        _id: -1
    }
    try {
        const pedidoEncontrados = await pedidoModel.find(filters).sort(sort).skip(desde).limit(limit).exec();
        return res.status(200).json({
            ok: true,
            pedidos: pedidoEncontrados
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
});

//Crear pedidos

app.post('/', async(req, res) => {
    const body = req.body;
    // const decoded = req.decoded;
    if (body.products.length == 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe enviar almenos un producto',
        });
    }
    try {
        const newPedido = new pedidoModel({
            owner_id: body.owner_id,
            products: body.products,
            location: body.location,
            district: body.district
        });
        const pedidoGuardado = await newPedido.save();
        return res.status(200).json({
            ok: false,
            mensaje: 'Pedido guardado',
            pedido: pedidoGuardado
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
})

module.exports = app;
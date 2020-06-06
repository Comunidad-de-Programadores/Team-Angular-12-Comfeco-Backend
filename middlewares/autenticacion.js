const express = require('express');
const rutasProtegidas = express.Router();
const jwt = require('jsonwebtoken');

rutasProtegidas.use((req, res, next) => {
    const token = req.headers['access-token'];
    if (token) {
        jwt.verify(token, process.env.KEY_TOKEN, (err, decoded) => {
            if (err) {
                return res.json({ mensaje: 'Token inválida' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send({
            mensaje: 'Token no proveída.'
        });
    }
});

module.exports = rutasProtegidas;
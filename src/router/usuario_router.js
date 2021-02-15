const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Modelos
const UserModel = require('../model/usuario_model');

app.post('/login', async(req, res) => {
    const body = req.body;
    const userFound = await UserModel.findOne({ email: body.email });
    if (!userFound) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error en credenciales',
        });
    }
    if (!bcrypt.compareSync(body.password, userFound.password)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error en credenciales',
        });
    }
    //Se crear el Token
    userFound.password = 'owo :)';
    const token = jwt.sign({ usuario: userFound }, process.env.KEY_TOKEN, { expiresIn: 86400 * 100 });
    return res.status(200).json({
        ok: true,
        mensaje: 'Autenticación correcto',
        token,
        userFound
    });
});

app.post('/register', async(req, res) => {
    const body = req.body;
    const newUserModel = new UserModel({
        nick: body.nick,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: 'https://res.cloudinary.com/dnonyoy9q/image/upload/v1589746719/avatar_1_gllifo.png'
    });
    try {
        const userSaved = await newUserModel.save();
        const token = jwt.sign({ usuario: userSaved }, process.env.KEY_TOKEN, { expiresIn: 86400 * 100 });
        return res.status(201).json({
            ok: true,
            userSaved,
            token
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
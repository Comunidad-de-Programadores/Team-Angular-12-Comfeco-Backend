const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

//Gooogle
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//Modelos

const usuarioModel = require('../model/usuario_model');

//login con google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    const body = req.body;
    const token = body.token;
    let userGoogle;
    try {
        userGoogle = await verify(token)
    } catch (error) {
        return res.status(403).json({
            ok: false,
            mensaje: 'token no valido',
        });
    }

    try {
        const usuarioEncontrado = await usuarioModel.findOne({ email: userGoogle.email });
        if (usuarioEncontrado) {
            const token = jwt.sign({ usuario: usuarioEncontrado }, process.env.KEY_TOKEN, { expiresIn: 86400 * 100 });
            return res.status(200).json({
                ok: true,
                mensaje: 'Autenticación correcto',
                token,
                usuarioEncontrado
            });
        }
        const newUsuario = new usuarioModel({
            name: userGoogle.nombre,
            email: userGoogle.email,
            img: userGoogle.img,
        });
        const userGuardado = await newUsuario.save();
        const token = jwt.sign({ usuario: userGuardado }, process.env.KEY_TOKEN, { expiresIn: 86400 * 100 });
        return res.status(200).json({
            ok: true,
            mensaje: 'Usuario registrado',
            userGuardado,
            token
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            error
        });
    }
});

module.exports = app;
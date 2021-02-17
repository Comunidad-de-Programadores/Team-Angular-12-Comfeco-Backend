const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


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

app.post('/sendemail', async(req, res) => {
    const body = req.body;
    if (!body.email) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El email es requerido',
        });
    }
    try {
        const userFound = await UserModel.findOne({ email: body.email });
        if (!userFound) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El email no esta registrado',
            });
        }
        // const aux = Math.round(Math.random() * 999999);
        const token = jwt.sign({ email: body.email }, process.env.KEY_TOKEN, { expiresIn: 60 * 2 });
        // userFound.codepassword = token;
        await userFound.save();
        const msg = {
            to: body.email,
            from: 'origami.startup@gmail.com',
            subject: 'Comfeco app recuperacion de cuenta',
            text: `Su link de recuperacion es http://localhost:4200/cambiar-contraseña?token=${token} y es valido por 2 minutos`,
        };
        await sgMail.send(msg);
        res.status(200).json({
            ok: true,
            mensaje: 'Correo enviado',
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }
});

app.post('/changePassword', async(req, res) => {
    const body = req.body;
    if (!body.newpassword) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El nuevo password es requerido',
        });
    }
    try {
        jwt.verify(body.token, process.env.KEY_TOKEN, async(err, decoded) => {
            if (err) {
                return res.status(400).json({ ok: false, mensaje: 'El codigo expiro' });
            } else {
                const usuarioencontrado = await UserModel.findOne({ email: decoded.email });
                if (!usuarioencontrado) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se encontro el usuario',
                        error: { message: 'No existe un usuario con ese correo' }
                    });
                }
                usuarioencontrado.password = bcrypt.hashSync(body.newpassword, 10)
                usuarioencontrado.save();
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Contraseña actulizada correctamente',
                });

            }
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }
});

module.exports = app;
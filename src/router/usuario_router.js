const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const fileUpload = require('express-fileupload');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const cloudinary = require('cloudinary').v2;
const userUtil = require('../util/user_util');

//Middelware
const mdAutenticacion = require('../middlewares/autenticacion');
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

//Modelos
const UserModel = require('../model/usuario_model');
const InsigniaModel = require('../model/insignia_model');

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
            html: `Su link de recuperacion es <a href="http://localhost:4200/cambiar-contraseña?token=${token}" > Click aqui  </a>y es valido por 2 minutos`,
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


app.get('/', mdAutenticacion, async(req, res) => {
    const idUser = req.decoded.usuario._id;
    try {
        const userFound = await UserModel.findById(idUser);
        if (!userFound) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario no exsiste',
            });
        }
        return res.status(200).json({
            ok: true,
            userFound
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }
})

app.put('', mdAutenticacion, async(req, res) => {
    const idUser = req.decoded.usuario._id;
    const body = req.body;
    console.log('owo');
    try {
        const userFound = await UserModel.findById(idUser);
        if (!userFound) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario no exsiste',
            });
        }
        userFound.nick = body.nick;
        userFound.gender = body.gender;
        userFound.birthday = body.birthday;
        userFound.country = body.country;
        userFound.biography = body.biography;
        userFound.socialNetwork = body.socialNetwork;
        userFound.knowledgeArea = body.knowledgeArea;
        if (req.files) {
            if (userFound.public_id === 'none' || userFound.public_id === undefined || userFound.public_id === '') {
                const result = await cloudinary.uploader.upload(req.files.img.tempFilePath);
                userFound.img = result.secure_url;
                userFound.public_id = result.public_id;
            } else {
                const result = await cloudinary.uploader.upload(req.files.img.tempFilePath);
                await cloudinary.uploader.destroy(userFound.public_id);
                userFound.img = result.secure_url;
                userFound.public_id = result.public_id;
            }
        }
        const resp = await userUtil.validarInsignia(0, idUser);
        if (!resp) {
            let boolInsignia = false;
            let arrayAtribute = ['nick', 'gender', 'birthday', 'country', 'biography', 'knowledgeArea'];
            // arrayAtribute = Object.keys(userFound.toJSON());
            // console.log(userFound);
            for (let index = 0; index < arrayAtribute.length; index++) {
                if (userFound[arrayAtribute[index]] === undefined) {
                    console.log(index);
                    boolInsignia = true;
                    break;
                }
            }
            if (!boolInsignia) {
                console.log('Guarde mi primera insignia');
                await userUtil.saveInsignia(0, idUser);
            }

        }
        const userSaved = await userFound.save();

        return res.status(200).json({
            ok: true,
            userSaved
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }

})

app.put('/changePassword', mdAutenticacion, async(req, res) => {
    const body = req.body;
    const id = req.decoded.usuario._id;
    try {
        if (!body.newpassword) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El nuevo password es requerido',
            });
        }
        const userFound = await UserModel.findById(id);
        if (!userFound) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontro el usuario',
                error: { message: 'No existe un usuario con ese id' }
            });
        }
        userFound.password = bcrypt.hashSync(body.newpassword, 10)
        await userFound.save();
        return res.status(200).json({
            ok: true,
            mensaje: 'Contraseña actulizada correctamente',
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }
})

app.get('/:id/insignias', mdAutenticacion, async(req, res) => {
    const idUser = req.params.id;
    try {
        let auxInsignias = [];
        const misInsignias = await InsigniaModel.findOne({ owner: idUser });
        if (misInsignias) {
            auxInsignias = userUtil.getFilterInsignias(misInsignias.idsInsignia);
        }
        return res.status(200).json({
            ok: true,
            misInsignias: auxInsignias
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }
})

module.exports = app;
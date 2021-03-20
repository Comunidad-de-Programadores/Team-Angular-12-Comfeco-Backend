const express = require('express');
const app = express();
const userUtil = require('../util/user_util');
//Middelware
const mdAutenticacion = require('../middlewares/autenticacion');

//Modelos
const GroupModel = require('../model/group_model');
const UserModel = require('../model/usuario_model');

app.get('', mdAutenticacion, async(req, res) => {
    const filters = {
        name: req.query.name ? { $regex: '.*' + req.query.name + '.*' } : undefined,
        programming_language_id: req.query.language_id ? parseInt(req.query.language_id) : undefined
    }
    console.log(filters);
    Object.keys(filters).forEach(key => (filters[key] === undefined || filters[key] === '') && delete filters[key])
    console.log(filters);
    try {
        const listGroup = await GroupModel.find(filters);
        return res.status(200).json({
            ok: true,
            listGroup: listGroup
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }
});
app.post('', mdAutenticacion, async(req, res) => {
    const body = req.body;
    const id = req.decoded.usuario._id;
    const newGroupModel = new GroupModel({
        name: body.name.toLowerCase(),
        programming_language_id: parseInt(body.programming_language_id),
        description: body.description,
        img: body.img
    });
    try {
        console.log('hola');
        const groupSaved = await newGroupModel.save();
        console.log(groupSaved);
        const userFound = await UserModel.findById(id);
        console.log('hola 2');
        // console.log(userFound);
        const aux = {
            group_id: groupSaved._id,
            type: 1
        }
        userFound['miInfoGroup'] = aux;
        // console.log(userFound);
        await userFound.save();
        return res.status(201).json({
            ok: true,
            nuevoGrupo: groupSaved,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
})
app.post('/:id/join', mdAutenticacion, async(req, res) => {
    const idGroup = req.params.id;
    const id = req.decoded.usuario._id;
    try {
        const userFound = await UserModel.findById(id);
        if (userFound.miInfoGroup) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No puedes inscribirte eres integrante de otro grupo o ya estas inscrito en este grupo',
            });
        }
        const groupFound = await GroupModel.findById(idGroup);
        if (!groupFound) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Grupo no encontrado',
            });
        }
        const aux = {
            group_id: idGroup,
            type: 0
        }
        userFound['miInfoGroup'] = aux;
        const resp = await userUtil.validarInsignia(2, id);
        if (!resp) {
            await userUtil.saveInsignia(2, id);
            console.log('Guarde mi segunda insignia');
        }
        await userFound.save();
        return res.status(200).json({
            ok: true,
            mensaje: `Ya eres un nuevo integrante del grupo ${groupFound.name}`,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }
})

app.post('/:id/out', mdAutenticacion, async(req, res) => {
    const idGroup = req.params.id;
    const id = req.decoded.usuario._id;
    try {
        const userFound = await UserModel.findById(id);
        if (!userFound.miInfoGroup) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No puedes realizar esta operacion, por que aun no te has unido a un grupo',
            });
        }
        const groupFound = await GroupModel.findById(idGroup);
        if (!groupFound) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Grupo no encontrado',
            });
        }
        if (userFound.miInfoGroup.group_id.toString() !== idGroup) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Tu no eres integrante del grupo',
            });
        }
        userFound.miInfoGroup = undefined;
        await userFound.save();
        return res.status(200).json({
            ok: true,
            mensaje: `Ya no eres un integrante del grupo ${groupFound.name}`,
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
const express = require('express');
const app = express();
//Middelware
const mdAutenticacion = require('../middlewares/autenticacion');

//Modelos
const EventModel = require('../model/event_model');
const UserModel = require('../model/usuario_model');

app.get('', mdAutenticacion, async(req, res) => {
    const id = req.decoded.usuario._id;
    try {
        const userFound = await UserModel.findById(id);
        let listEvent = await EventModel.find();
        listEvent = JSON.parse(JSON.stringify(listEvent));
        console.log(listEvent);
        console.log(userFound);
        if (!userFound.miInfoEvent || userFound.miInfoEvent.length === 0) {
            return res.status(200).json({
                ok: true,
                listEvent: listEvent
            });
        } else {
            for (let index = 0; index < listEvent.length; index++) {
                for (let i = 0; i < userFound.miInfoEvent.length; i++) {
                    if (userFound.miInfoEvent[i].event_id.toString() === listEvent[index]._id.toString() && userFound.miInfoEvent[i].status == 0) {
                        console.log('join');
                        listEvent[index]['join'] = true;
                    }
                }
            }
            return res.status(200).json({
                ok: true,
                listEvent: listEvent
            });
        }


        // return res.status(200).json({
        //     ok: true,
        //     listEvent: listEvent
        // });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }

})
app.post('', mdAutenticacion, async(req, res) => {
    const body = req.body;
    try {
        const newEvent = new EventModel({
            name: body.name,
            description: body.description,
            img: body.img
        });
        await newEvent.save();
        return res.status(201).json({
            ok: true,
            menssage: 'Evento creado correctamente'

        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }

})


app.post('/:id/join', mdAutenticacion, async(req, res) => {
    const idEvent = req.params.id;
    const id = req.decoded.usuario._id;
    try {
        const userFound = await UserModel.findById(id);
        const eventFound = await EventModel.findById(idEvent);
        if (!eventFound) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Evento no encontrado',
            });
        }
        if (userFound.miInfoEvent) {
            for (let index = 0; index < userFound.miInfoEvent.length; index++) {
                if (userFound.miInfoEvent[index].event_id == idEvent && userFound.miInfoEvent[index].status == 1) {
                    return res.status(200).json({
                        ok: false,
                        mensaje: 'No te puedes unir estas baneado del evento',
                        user: userFound
                    });
                }
            }
        }
        const aux = {
            event_id: idEvent,
            status: 0
        }
        if (!userFound.miInfoEvent) {
            userFound['miInfoEvent'] = [aux]
        } else {
            userFound.miInfoEvent.push(aux);
        }
        await userFound.save();
        return res.status(200).json({
            ok: true,
            mensaje: 'Te unistes al evento correctamente',
            user: userFound
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
    const idEvent = req.params.id;
    const id = req.decoded.usuario._id;
    try {
        const userFound = await UserModel.findById(id);
        const eventFound = await EventModel.findById(idEvent);
        if (!eventFound) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Evento no encontrado',
            });
        }
        if (!userFound.miInfoEvent || userFound.miInfoEvent.length == 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No estas inscrito en ningun evento',
            });
        }

        let statusMap = false; 
        console.log(userFound.miInfoEvent.length);
        for (let index = 0; index < userFound.miInfoEvent.length; index++) {
            if (userFound.miInfoEvent[index].event_id == idEvent && userFound.miInfoEvent[index].status == 0) {
                const aux = {
                    event_id: idEvent,
                    status: 1
                }
                const resp = userFound.miInfoEvent[index].set(aux);
                console.log(resp);
                statusMap = true;
            }
        }
        console.log('Hola 2');
        if (statusMap) {
            await userFound.save();
            return res.status(200).json({
                ok: true,
                mensaje: 'Fuistes retirado del evento correctamente',
                user: userFound
            });
        } else {
            return res.status(400).json({
                ok: false,
                mensaje: 'No estas registrado en en este evento',
            });
        }

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error: { message: error }
        });
    }
})

module.exports = app;
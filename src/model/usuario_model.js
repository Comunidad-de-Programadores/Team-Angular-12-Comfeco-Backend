const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;



const usuarioSchema = new Schema({
    nick: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es requerido'] },
    password: { type: String, unique: true, required: [true, 'La contraseña es requerido'] },
    img: { type: String, required: [true, 'Imagen de perfil requerida'] }
});

usuarioSchema.plugin(uniqueValidator, { menssage: '{PATH} debe ser único' });
module.exports = mongoose.model('User', usuarioSchema);
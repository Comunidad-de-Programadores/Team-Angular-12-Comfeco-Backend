const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;



const usuarioSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es requerido'] },
    img: { type: String, required: [true, 'Imagen de perfil requerida'] },
    role: { type: String, required: true, default: 'USER_ROLE' },
    google: { type: Boolean, default: true }
});

usuarioSchema.plugin(uniqueValidator, { menssage: '{PATH} debe ser único' });
module.exports = mongoose.model('Usuario', usuarioSchema);
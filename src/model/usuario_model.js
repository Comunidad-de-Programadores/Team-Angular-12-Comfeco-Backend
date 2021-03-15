const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const miInfoGroup = new Schema({
    group_id: { type: mongoose.ObjectId },
    type: { type: Number } // 0 = integrante ; 1 = lider
}, { _id: false, default: -1 });

const usuarioSchema = new Schema({
    nick: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es requerido'] },
    password: { type: String, unique: true, required: [true, 'La contraseña es requerido'] },
    img: { type: String },
    public_id: { type: String, default: 'none' },
    gender: { type: String },
    birthday: { type: String },
    country: { type: String },
    biography: { type: String },
    socialNetwork: { type: Array },
    knowledgeArea: { type: String },
    miInfoGroup: miInfoGroup
});

usuarioSchema.plugin(uniqueValidator, { menssage: '{PATH} debe ser único' });
module.exports = mongoose.model('User', usuarioSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const groupSchema = new Schema({
    name: { type: String, unique: true, required: [true, 'El nombre es requerido'] },
    programming_language_id: { type: Number, required: [true, 'El lenguaje de programcion es requerido'] },
    description: { type: String, required: [true, 'La contraseña es requerido'] },
    img: { type: String },
});

groupSchema.virtual('integrantes', {
    ref: 'User',
    localField: '_id',
    foreignField: 'miInfoGroup.group_id',
    justOne: false,
})

groupSchema.set('toObject', { virtuals: true });
groupSchema.set('toJSON', { virtuals: true });
groupSchema.plugin(uniqueValidator, { menssage: '{PATH} debe ser único' });
module.exports = mongoose.model('Group', groupSchema);
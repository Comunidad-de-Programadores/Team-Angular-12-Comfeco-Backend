const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = new Schema({
    name: { type: String, required: [true, 'El nombre es requerido'] },
    link: { type: String, required: [true, 'El link es requerido'] },
    img: { type: String, required: [true, 'Imagen de la comunidad es requerida'] },
    description: { type: String, unique: true, required: [true, 'Una breve descripcion es requerido'] },
});

module.exports = mongoose.model('Community', communitySchema);
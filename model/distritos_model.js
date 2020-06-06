const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const distritoSchema = Schema({
    name: { type: String, required: [true, 'El nombre es requerido'] },
    state: { type: Boolean, default: true },
});

module.exports = mongoose.model('Distrito', distritoSchema);
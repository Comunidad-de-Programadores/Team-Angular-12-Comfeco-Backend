const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriaSchema = Schema({
    name: { type: String, required: [true, 'El nombre es requerido'] },
    state: { type: Boolean, default: true },
    producto_number: { type: Number, default: 0 }
});

module.exports = mongoose.model('Categoria', categoriaSchema);
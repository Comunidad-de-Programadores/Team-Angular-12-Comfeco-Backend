const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productoSchema = Schema({
    name: { type: String, required: [true, 'El nombre es requerido'] },
    img: { type: String, required: [true, 'Imagen requerida'] },
    public_id: { type: String, required: [true, 'El id de la imagen requerida'] },
    description: { type: String, required: [true, 'La descripcion es requerida'] },
    price: { type: Number, required: [true, 'El precio es requerida'] },
    stock: { type: Number },
    state: { type: Boolean, default: true },
    id_categoria: { type: mongoose.ObjectId, required: [true, 'El id de la categoria es requerida'] }
});

module.exports = mongoose.model('Producto', productoSchema);
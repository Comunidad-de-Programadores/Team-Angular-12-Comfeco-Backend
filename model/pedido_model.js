const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const product = new Schema({
    product_id: { type: mongoose.ObjectId, required: true },
    quantity: { type: Number, required: true }
});

const location = new Schema({
    lat: { type: String, required: true },
    long: { type: String, required: true }
});

const pedidoSchema = new Schema({
    owner_id: { type: mongoose.ObjectId, required: [true, 'El id del usuario dueño es requerido'] },
    state: { type: Boolean, default: true },
    products: [product],
    location: location,
    date_create: { type: Date, default: Date.now },
    district: { type: mongoose.ObjectId, required: true }
});

pedidoSchema.virtual('usuario_info', {
    ref: 'Usuario',
    localField: 'owner_id',
    foreignField: '_id',
    justOne: true,
})

module.exports = mongoose.model('Pedido', pedidoSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es requerido'] },
    description: { type: String, required: [true, 'La contraseña es requerido'] },
    img: { type: String },
});
eventSchema.virtual('user_info', {
    ref: 'User.miInfoEvent',
    localField: '_id',
    foreignField: 'event_id',
    justOne: false,

})
module.exports = mongoose.model('Event', eventSchema);
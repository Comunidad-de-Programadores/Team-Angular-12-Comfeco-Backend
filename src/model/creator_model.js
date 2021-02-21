const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const creatorSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es requerido'] },
    technology: { type: String, unique: true, required: [true, 'El tecnologia que domina es requerido'] },
    technologyImg: { type: String, unique: true, required: [true, 'La img de tecnologia que domina es requerido'] },
    description: { type: String, unique: true, required: [true, 'Una breve descripcion es requerido'] },
    socialNetwork: { type: String, unique: true, required: [true, 'Su link de red social es requerido'] },
    img: { type: String, required: [true, 'Imagen de perfil requerida'] }
});

module.exports = mongoose.model('Creator', creatorSchema);
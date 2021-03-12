const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const insigniaSchema = new Schema({
    owner: { type: mongoose.ObjectId, required: [true, 'El dueño de la insignia es requerido'] },
    idsInsignia: { type: Array }
});

module.exports = mongoose.model('Insignia', insigniaSchema);
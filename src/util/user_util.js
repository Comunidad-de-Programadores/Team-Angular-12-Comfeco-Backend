const listInsignias = require('../util/insignia');
//Modelos
const InsigniaModel = require('../model/insignia_model');

async function validarInsignia(type, idUser) {
    const misInsignias = await InsigniaModel.findOne({ owner: idUser });
    console.log(misInsignias);
    if (misInsignias) {
        for (let index = 0; index < misInsignias.idsInsignia.length; index++) {
            if (misInsignias.idsInsignia[index] === type) {
                return true;
            }
        }
    }
    return false;
};

async function saveInsignia(type, idUser) {
    const misInsignias = await InsigniaModel.findOne({ owner: idUser });
    if (misInsignias) {
        misInsignias.idsInsignia.push(type);
        await misInsignias.save();
    } else {
        let auxInsignia = [];
        auxInsignia.push(type);
        const newInsigniaModel = new InsigniaModel({
            owner: idUser,
            idsInsignia: auxInsignia
        })
        await newInsigniaModel.save();
    }
}

function getFilterInsignias(types) {
    const auxInsignias = [];
    types.forEach(element => {
        auxInsignias.push(listInsignias.insignia[element]);
    });
    return auxInsignias;
}


module.exports = { validarInsignia, saveInsignia, getFilterInsignias }
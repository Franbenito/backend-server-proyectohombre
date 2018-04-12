var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jugadorSchema = new Schema({
    nombre: { type: String, required: [true, 'El	nombre	es	necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    club: {
        type: Schema.Types.ObjectId,
        ref: 'Club',
        required: [true, 'El id	club es un campo obligatorio ']
    }
});

module.exports = mongoose.model('Jugador', jugadorSchema);
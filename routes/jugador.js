var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

// var SEED = require('../config/config').SEED;

var app = express();
var Jugador = require('../models/jugador');

// =================================================================
// Obtener todos los jugadores
// =================================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Jugador.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('club')
        .exec(
            (err, jugadores) => {

                if (err) {
                    return res.status(200).json({
                        ok: false,
                        mensaje: 'Error cargando jugador!',
                        errors: err
                    });
                }

                Jugador.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        jugadores: jugadores,
                        total: conteo
                    });
                });


            });
});



// =================================================================
// Actualizar jugador
// =================================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Jugador.findById(id, (err, jugador) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar jugador',
                errors: err
            });
        }

        if (!jugador) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El jugador con el id ' + id + ' no existe',
                errors: { message: 'No existe un jugador con ese ID' }
            });
        }

        jugador.nombre = body.nombre;
        jugador.usuario = req.usuario._id;
        jugador.club = body.club;

        jugador.save((err, jugadorGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar jugador',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                jugador: jugadorGuardado
            });

        });

    });


});


// =================================================================
// Crear un nuevo jugador
// =================================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var jugador = new Jugador({
        nombre: body.nombre,
        usuario: req.usuario._id,
        club: body.club
    });

    jugador.save((err, jugadorGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear jugador',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            jugador: jugadorGuardado
        });

    });

});


// =================================================================
// Borrar un jugador por el id
// =================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Jugador.findByIdAndRemove(id, (err, jugadorBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar jugador',
                errors: err
            });
        }

        if (!jugadorBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un jugador con ese id',
                errors: { message: 'No existe un jugador con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            jugador: jugadorBorrado
        });

    });
});


module.exports = app;
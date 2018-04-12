var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

// var SEED = require('../config/config').SEED;

var app = express();
var Club = require('../models/club');

// =================================================================
// Obtener todos los clubs
// =================================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Club.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, clubs) => {

                if (err) {
                    return res.status(200).json({
                        ok: false,
                        mensaje: 'Error cargando club!',
                        errors: err
                    });
                }

                Club.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        clubs: clubs,
                        total: conteo
                    });

                });


            });
});



// =================================================================
// Actualizar club
// =================================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Club.findById(id, (err, club) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar club',
                errors: err
            });
        }

        if (!club) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El club con el id ' + id + ' no existe',
                errors: { message: 'No existe un club con ese ID' }
            });
        }

        club.nombre = body.nombre;
        club.usuario = req.usuario._id;

        club.save((err, clubGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar club',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                club: clubGuardado
            });

        });

    });


});


// =================================================================
// Crear un nuevo club
// =================================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var club = new Club({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    club.save((err, clubGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear club',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            club: clubGuardado
        });

    });

});


// =================================================================
// Borrar un club por el id
// =================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Club.findByIdAndRemove(id, (err, clubBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar club',
                errors: err
            });
        }

        if (!clubBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un club con ese id',
                errors: { message: 'No existe un club con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            club: clubBorrado
        });

    });
});


module.exports = app;
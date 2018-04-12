var express = require('express');

var app = express();

var Club = require('../models/club');
var Jugador = require('../models/jugador');
var Usuario = require('../models/usuario');

// =====================================
// Búsqueda por colección
// =====================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'jugadores':
            promesa = buscarJugadores(busqueda, regex);
            break;
        case 'clubs':
            promesa = buscarClubs(busqueda, regex);
            break;


        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda sólo son: usuarios, clubs y jugadores',
                error: { message: 'Tipo de tabla/colección no válido' }
            });
    }

    promesa.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    });

});



// =====================================
// Búsqueda general
// =====================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarClubs(busqueda, regex),
            buscarJugadores(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                clubs: respuestas[0],
                jugadores: respuestas[1],
                usuarios: respuestas[2]
            });
        });



});

function buscarClubs(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Club.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec(
                (err, clubs) => {

                    if (err) {
                        reject('Error al cargar clubs', err);
                    } else {
                        resolve(clubs)
                    }
                });


    });

}

function buscarJugadores(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Jugador.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('club')
            .exec(
                (err, jugadores) => {

                    if (err) {
                        reject('Error al cargar jugadores', err);
                    } else {
                        resolve(jugadores)
                    }
                });

    });

}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });

}

module.exports = app;
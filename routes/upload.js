var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Jugador = require('../models/jugador');
var Club = require('../models/club');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección

    var tiposValidos = ['clubs', 'jugadores', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });

    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones aceptadas

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado

    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path

    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });

        }

        subirPorTipo(tipo, id, nombreArchivo, res);



    });

});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe el filesystem, elimina la imagen anterior

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });
        });

    }

    if (tipo === 'jugadores') {

        Jugador.findById(id, (err, jugador) => {

            if (!jugador) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Jugador no existe',
                    errors: { message: 'Jugador no existe' }
                });
            }

            var pathViejo = './uploads/jugadores/' + jugador.img;

            // Si existe el filesystem, elimina la imagen anterior

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            jugador.img = nombreArchivo;

            jugador.save((err, jugadorActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de jugador actualizada',
                    usuario: jugadorActualizado
                });

            });
        });

    }

    if (tipo === 'clubs') {

        Club.findById(id, (err, club) => {

            if (!club) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Club no existe',
                    errors: { message: 'Club no existe' }
                });
            }

            var pathViejo = './uploads/clubs/' + club.img;

            // Si existe el filesystem, elimina la imagen anterior

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            club.img = nombreArchivo;

            club.save((err, clubActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de club actualizada',
                    usuario: clubActualizado
                });

            });
        });

    }




}

module.exports = app;

require('dotenv').config();

const express = require('express');
const path = require('path');
const comprobanteRoutes = require('./routes/comprobanteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', comprobanteRoutes);

app.use((error, req, res, next) => {
    console.error('Error:', error.message);

    const esArchivoInvalido = error instanceof require('multer').MulterError ||
        error.message === 'Solo se permiten imágenes JPG y PNG.';

    res.status(esArchivoInvalido ? 400 : 500).json({
        success: false,
        mensaje: esArchivoInvalido ? error.message : 'Error interno del servidor.'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});


const express = require('express');
const multer = require('multer');

const comprobanteController = require('../controllers/comprobanteController');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = ['image/jpeg', 'image/png'];

        if (tiposPermitidos.includes(file.mimetype)) {
            return cb(null, true);
        }

        cb(new Error('Solo se permiten imágenes JPG y PNG.'));
    }
});

router.get('/', comprobanteController.index);

router.post('/comprobantes', upload.single('imagen'), comprobanteController.registrar);

router.get('/comprobantes/:id/json', comprobanteController.verJSON);

router.get('/comprobantes/:id/imagen', comprobanteController.verImagen);

router.delete('/comprobantes/:id', comprobanteController.eliminar);

module.exports = router;

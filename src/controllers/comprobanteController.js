
const { randomUUID } = require('crypto');

const textractService = require('../services/textractService');
const s3Service = require('../services/s3Service');
const dynamodbService = require('../services/dynamodbService');

const index = async (req, res) => {
    try {
        const comprobantes = await dynamodbService.listarComprobantes();

        res.render('index', {
            titulo: 'Gestión de Comprobantes',
            comprobantes
        });
    } catch (error) {
        console.error('Error al listar comprobantes:', error);

        res.status(500).send('Error al cargar los comprobantes.');
    }
};

const registrar = async (req, res) => {
    let imagenS3 = null;

    try {
        const { tipoComprobante, fechaEmision, usuario, tienda, observacion } = req.body;
        const archivo = req.file;

        if (!tipoComprobante || !fechaEmision || !usuario?.trim() || !tienda || !archivo) {
            return res.status(400).json({
                success: false,
                mensaje: 'Complete todos los campos obligatorios.'
            });
        }

        if (!['Boleta', 'Factura'].includes(tipoComprobante)) {
            return res.status(400).json({
                success: false,
                mensaje: 'Tipo de comprobante inválido.'
            });
        }

        if (!['Chincha', 'Pisco', 'Ica'].includes(tienda)) {
            return res.status(400).json({
                success: false,
                mensaje: 'Tienda inválida.'
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaEmision) ||
            Number.isNaN(Date.parse(`${fechaEmision}T00:00:00Z`))) {
            return res.status(400).json({
                success: false,
                mensaje: 'Fecha de emisión inválida.'
            });
        }

        const resultadoTextract = await textractService.analizarComprobante(archivo.buffer);

        imagenS3 = await s3Service.subirImagen(archivo);

        const comprobante = {
            id: randomUUID(),
            tipoComprobante,
            fechaEmision,
            usuario: usuario.trim(),
            tienda,
            observacion: observacion?.trim() || '',
            imagenS3: imagenS3.clave,
            textractJSON: resultadoTextract,
            fechaRegistro: new Date().toISOString()
        };

        await dynamodbService.guardarComprobante(comprobante);

        return res.status(201).json({
            success: true,
            mensaje: 'Comprobante registrado correctamente.',
            comprobante
        });
    } catch (error) {
        console.error('Error al registrar comprobante:', error);

        if (imagenS3) {
            try {
                await s3Service.eliminarImagen(imagenS3.clave);
            } catch (errorLimpieza) {
                console.error('Error al limpiar S3:', errorLimpieza);
            }
        }

        return res.status(500).json({
            success: false,
            mensaje: 'No se pudo registrar el comprobante.'
        });
    }
};

const verJSON = async (req, res) => {
    try {
        const comprobante = await dynamodbService.obtenerComprobante(req.params.id);

        if (!comprobante) {
            return res.status(404).json({
                success: false,
                mensaje: 'Comprobante no encontrado.'
            });
        }

        return res.json(comprobante.textractJSON);
    } catch (error) {
        console.error('Error al consultar JSON:', error);

        return res.status(500).json({
            success: false,
            mensaje: 'No se pudo obtener el JSON.'
        });
    }
};

const verImagen = async (req, res) => {
    try {
        const comprobante = await dynamodbService.obtenerComprobante(req.params.id);

        if (!comprobante) {
            return res.status(404).send('Comprobante no encontrado.');
        }

        const imagen = await s3Service.obtenerImagen(comprobante.imagenS3);

        res.set('Content-Type', imagen.tipo);
        res.set('Content-Disposition', 'inline');
        res.set('X-Content-Type-Options', 'nosniff');

        return res.send(imagen.buffer);
    } catch (error) {
        console.error('Error al obtener imagen:', error);

        return res.status(500).send('No se pudo obtener la imagen.');
    }
};

const eliminar = async (req, res) => {
    try {
        const comprobante = await dynamodbService.obtenerComprobante(req.params.id);

        if (!comprobante) {
            return res.status(404).json({
                success: false,
                mensaje: 'Comprobante no encontrado.'
            });
        }

        await s3Service.eliminarImagen(comprobante.imagenS3);

        await dynamodbService.eliminarComprobante(req.params.id);

        return res.json({
            success: true,
            mensaje: 'Comprobante eliminado correctamente.'
        });
    } catch (error) {
        console.error('Error al eliminar comprobante:', error);

        return res.status(500).json({
            success: false,
            mensaje: 'No se pudo eliminar el comprobante.'
        });
    }
};

module.exports = {
    index,
    registrar,
    verJSON,
    verImagen,
    eliminar
};


const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');

const { s3 } = require('../config/aws');
const { randomUUID } = require('crypto');

const BUCKET = process.env.S3_BUCKET || 'comprobantes';

const subirImagen = async (archivo) => {
    const extension = archivo.mimetype === 'image/png' ? 'png' : 'jpg';
    const nombreArchivo = `${randomUUID()}.${extension}`;
    const clave = `comprobantes/${nombreArchivo}`;

    const comando = new PutObjectCommand({
        Bucket: BUCKET,
        Key: clave,
        Body: archivo.buffer,
        ContentType: archivo.mimetype
    });

    await s3.send(comando);

    return {
        bucket: BUCKET,
        clave: clave,
        nombreArchivo: nombreArchivo
    };
};

const obtenerImagen = async (clave) => {
    const comando = new GetObjectCommand({
        Bucket: BUCKET,
        Key: clave
    });

    const resultado = await s3.send(comando);

    return {
        buffer: Buffer.from(await resultado.Body.transformToByteArray()),
        tipo: resultado.ContentType || 'application/octet-stream'
    };
};

const eliminarImagen = async (clave) => {
    const comando = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: clave
    });

    await s3.send(comando);
};

module.exports = {
    subirImagen,
    obtenerImagen,
    eliminarImagen
};

const { DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const { textract } = require('../config/aws');

const analizarComprobante = async (imagenBuffer) => {
    const comando = new DetectDocumentTextCommand({
        Document: {
            Bytes: imagenBuffer
        }
    });

    const resultado = await textract.send(comando);

    return {
        metadata: resultado.DocumentMetadata,
        bloques: resultado.Blocks || [],
        versionModelo: resultado.DetectDocumentTextModelVersion
    };
};

module.exports = {
    analizarComprobante
};
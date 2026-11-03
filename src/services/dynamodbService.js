
const {
    PutCommand,
    ScanCommand,
    GetCommand,
    DeleteCommand
} = require('@aws-sdk/lib-dynamodb');

const { dynamodb } = require('../config/aws');

const TABLA = process.env.DYNAMODB_TABLE || 'Comprobantes';

const guardarComprobante = async (comprobante) => {
    const comando = new PutCommand({
        TableName: TABLA,
        Item: comprobante,
        ConditionExpression: 'attribute_not_exists(id)'
    });

    await dynamodb.send(comando);

    return comprobante;
};

const listarComprobantes = async () => {
    let comprobantes = [];
    let ultimaClave;

    do {
        const comando = new ScanCommand({
            TableName: TABLA,
            ExclusiveStartKey: ultimaClave
        });

        const resultado = await dynamodb.send(comando);

        comprobantes.push(...(resultado.Items || []));
        ultimaClave = resultado.LastEvaluatedKey;
    } while (ultimaClave);

    return comprobantes.sort((a, b) =>
        (b.fechaRegistro || '').localeCompare(a.fechaRegistro || '')
    );
};

const obtenerComprobante = async (id) => {
    const comando = new GetCommand({
        TableName: TABLA,
        Key: { id }
    });

    const resultado = await dynamodb.send(comando);

    return resultado.Item || null;
};

const eliminarComprobante = async (id) => {
    const comando = new DeleteCommand({
        TableName: TABLA,
        Key: { id },
        ReturnValues: 'ALL_OLD'
    });

    const resultado = await dynamodb.send(comando);

    return resultado.Attributes || null;
};

module.exports = {
    guardarComprobante,
    listarComprobantes,
    obtenerComprobante,
    eliminarComprobante
};

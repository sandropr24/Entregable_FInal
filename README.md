# Gestión de Comprobantes con AWS Simulado

Aplicación web desarrollada con **Node.js, Express, EJS y JavaScript**, que permite registrar, almacenar, consultar y eliminar comprobantes de pago mediante servicios AWS simulados con **Floci**.

## Descripción

El sistema permite gestionar comprobantes de tipo boleta y factura mediante un formulario web. Cada comprobante contiene datos del usuario, fecha de emisión, tienda, observaciones y una imagen JPG o PNG.

La aplicación integra tres servicios:

- **Amazon Textract:** simula el análisis de documentos y devuelve una respuesta JSON.
- **Amazon S3:** almacena las imágenes de los comprobantes.
- **Amazon DynamoDB:** almacena los datos del formulario, la referencia de la imagen y el resultado JSON de Textract.

**Nota:** Floci simula los servicios AWS. El resultado de Textract no corresponde a un reconocimiento OCR real.

## Tecnologías utilizadas

- Node.js
- Express.js
- EJS
- JavaScript
- HTML5 y CSS3
- SweetAlert2
- AWS SDK para JavaScript v3
- Floci
- Amazon Textract, S3 y DynamoDB (simulados)

## Funcionalidades

- Registrar boletas y facturas.
- Seleccionar tiendas: Chincha, Pisco e Ica.
- Adjuntar imágenes JPG o PNG de hasta 5 MB.
- Procesar imágenes mediante Textract simulado.
- Almacenar imágenes en S3.
- Guardar información en DynamoDB.
- Listar comprobantes registrados.
- Visualizar imágenes y respuestas JSON en ventanas emergentes.
- Eliminar comprobantes y sus imágenes.
- Mostrar notificaciones personalizadas con SweetAlert2.

## Estructura del proyecto

```text
app-comprobantes/
├── public/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── src/
│   ├── config/
│   │   └── aws.js
│   ├── controllers/
│   │   └── comprobanteController.js
│   ├── routes/
│   │   └── comprobanteRoutes.js
│   ├── services/
│   │   ├── textractService.js
│   │   ├── s3Service.js
│   │   └── dynamodbService.js
│   └── app.js
├── views/
│   └── index.ejs
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Requisitos

- Node.js 20 o superior.
- npm.
- Floci CLI y servidor local.
- AWS CLI.
- Git.
- Conexión a Internet para cargar SweetAlert2 desde el CDN.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/sandropr24/Entregable_FInal.git
cd Entregable_FInal
```

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` con esta configuración:

```env
PORT=3000
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
S3_BUCKET=comprobantes
DYNAMODB_TABLE=Comprobantes
```

Estas credenciales son ficticias y se utilizan exclusivamente para el entorno local simulado.

## Configuración de servicios AWS simulados

Iniciar Floci y comprobar que el servidor esté disponible en:

```text
http://localhost:4566
```

Crear el bucket S3:

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://comprobantes
```

Crear la tabla DynamoDB:

```bash
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
    --table-name Comprobantes \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

Antes de utilizar AWS CLI, configurar la región y credenciales ficticias:

```bash
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
```

Si los recursos ya existen, no es necesario volver a crearlos.

## Ejecutar la aplicación

```bash
npm run dev
```

Abrir en el navegador:

```text
http://localhost:3000
```

## Flujo de funcionamiento

1. El usuario completa el formulario y selecciona una imagen.
2. Express recibe y valida la solicitud.
3. Amazon Textract simulado procesa la imagen y devuelve JSON.
4. Amazon S3 almacena la imagen.
5. Amazon DynamoDB registra los datos del formulario, la clave de S3 y el JSON.
6. La aplicación muestra el comprobante en la tabla.
7. El usuario puede visualizar la imagen, consultar el JSON o eliminar el registro.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Página principal |
| POST | `/comprobantes` | Registrar comprobante |
| GET | `/comprobantes/:id/imagen` | Visualizar imagen |
| GET | `/comprobantes/:id/json` | Consultar JSON |
| DELETE | `/comprobantes/:id` | Eliminar comprobante |

## Pruebas realizadas

Se comprobó el funcionamiento de:

- Registro de comprobantes.
- Respuesta JSON simulada de Textract.
- Almacenamiento y recuperación de imágenes en S3.
- Registro y consulta de datos en DynamoDB.
- Visualización de imágenes y JSON.
- Eliminación de registros y archivos almacenados.

## Consideraciones

Este proyecto utiliza servicios AWS simulados localmente. No requiere una cuenta AWS real.

Está orientado a fines académicos y de demostración. Para utilizarlo en producción sería necesario incorporar autenticación, autorización, validaciones adicionales y servicios de almacenamiento persistentes.

## Repositorio

[GitHub - Entregable_FInal](https://github.com/sandropr24/Entregable_FInal)

## Autor

**Sandro Pachas Romani**

Proyecto académico de desarrollo de software.
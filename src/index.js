import express from 'express';
import { obtenerDatosAPI, formatoValor } from './utils/utils.js';
import { enviarCorreo } from './utils/nodemailer.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuid } from 'uuid';
import { writeFile } from 'fs';

console.clear();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configuracion Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.post('/', async (req, res) => {
	// Obtener datos del formulario
	const { correos, asunto, contenido } = req.body;

	// Comprobar que los datos existen
	if (!correos || !asunto || !contenido) return res.send('Faltan datos');

	// Comprobar que los correos son validos
	const correosArray = correos.split(',');
	const correosTrim = correosArray.map((correo) => correo.trim());
	const correosInvalidos = correosTrim.filter(
		(correo) => !correo.includes('@')
	);

	if (correosInvalidos.length > 0) return res.send('Hay correos invalidos');

	// Obtener datos de la API mindicador.cl
	const data = await obtenerDatosAPI();

	// Creamos template del correo
	const template = `
<p>${contenido}</p>

<p>El valor del dolar el día de hoy es: ${formatoValor(data.dolar.valor)}</p>
<p>El valor del euro el día de hoy es: ${formatoValor(data.euro.valor)}</p>
<p>El valor del uf el día de hoy es: ${formatoValor(data.uf.valor)}</p>
<p>El valor del utm el día de hoy es: ${formatoValor(data.utm.valor)}</p>
	`;

	// Enviamos correos
	const correosFallidos = [];

	const correosEnviados = await Promise.all(
		correosTrim.map(async (correo) => {
			try {
				await enviarCorreo(correo, asunto, template);

				console.log(`Correo enviado a ${correo}`);

				return correo;
			} catch (error) {
				console.log(error);
				correosFallidos.push(correo);

				return null;
			}
		})
	);

	// Guardamos correos enviados en un archivo

	correosEnviados.forEach((correo) => {
		const id = uuid();

		writeFile(
			`${__dirname}/correos/${id}-${correo}.txt`,
			`${template}`,
			{ encoding: 'utf-8' },
			(err) => {
				if (err) console.log(err);

				console.log('Archivo creado');
			}
		);
	});

	// Mostramos mensaje de exito
	res.send(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link
			href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
			rel="stylesheet"
			integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
			crossorigin="anonymous"
		/>
		<title>Ejercicio Grupal 6</title>
	</head>

	<body>
		<main class="container">
			<h1>Correos enviados</h1>

			<div class="grid gap-5 mt-4">
				<div class="text-bg-success p-2 g-col-12 mb-2">
					<p>Total de correos enviados: ${correosEnviados.length}</p>
					<p>Correos: ${correosEnviados.join(', ')}</p>
				</div>

				<div class="text-bg-warning p-2 g-col-12 mb-2">
					<p>Total de correos fallidos: ${correosFallidos.length}</p>
					<p>Correos: ${correosFallidos.join(', ')}</p>
				</div>

				<a class="btn btn-primary g-col-12" href="/">Volver</a>
			</div>
		</main>

		<script
			src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
			integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
			crossorigin="anonymous"
		></script>
	</body>
</html>
	`);
});

app.listen(3000, () => {
	console.log('Servidor en puerto 3000!');
});

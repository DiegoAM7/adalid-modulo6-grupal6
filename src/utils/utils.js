export const obtenerDatosAPI = async () => {
	const url = 'https://mindicador.cl/api';
	const respuesta = await fetch(url);
	const datos = await respuesta.json();

	return datos;
};

export const formatoValor = (valor) => {
	const formato = new Intl.NumberFormat('es-CL', {
		style: 'currency',
		currency: 'CLP',
	});

	return formato.format(valor);
};

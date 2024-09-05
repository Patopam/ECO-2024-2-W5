let socket = io('http://localhost:5050', { path: '/real-time' });

const appState = {
	page: 'login',
};

const form = {
	nombre: '',
	origen: '',
	destino: '',
};

renderPage();

async function renderPage() {
	if (appState.page === 'login') {
		const login = document.getElementById('Login');
		const titule = document.createElement('h1');
		titule.innerText = 'EcoUber';
		login.appendChild(titule);

		const subtitule = document.createElement('h2');
		subtitule.innerText = 'Ingresa tu nombre para iniciar tu viaje';
		login.appendChild(subtitule);

		const nombreInput = document.createElement('input');
		nombreInput.id = 'nombre';
		login.appendChild(nombreInput);

		nombreInput.addEventListener('change', function () {
			changeName(nombreInput.value);
		});

		const buttonLogin = document.createElement('button');
		buttonLogin.innerText = 'Login';
		login.appendChild(buttonLogin);

		buttonLogin.addEventListener('click', function () {
			changeScreen('select');
		});
	} else if (appState.page === 'select') {
		const select = document.getElementById('Select');
		select.innerHTML = '';

		const title = document.createElement('h1');
		title.innerText = 'Selecciona tu viaje';
		select.appendChild(title);

		const labelOrigen = document.createElement('label');
		labelOrigen.for = 'origen';
		labelOrigen.innerText = 'Origen';
		const origen = document.createElement('input');
		origen.id = 'origen';
		select.appendChild(labelOrigen);
		select.appendChild(origen);

		const labelDestino = document.createElement('label');
		labelDestino.for = 'destino';
		labelDestino.innerText = 'Destino';
		const destino = document.createElement('input');
		destino.id = 'destino';
		select.appendChild(labelDestino);
		select.appendChild(destino);

		const buttonRequest = document.createElement('button');
		buttonRequest.innerText = 'Solicitar';
		select.appendChild(buttonRequest);

		origen.addEventListener('change', function () {
			changeOrigen(origen.value);
		});
		destino.addEventListener('change', function () {
			changeDestino(destino.value);
		});

		buttonRequest.addEventListener('click', function () {
			createRequest();
		});
	} else if (appState.page === 'trip') {
		const trip = document.getElementById('Trip');
		trip.innerHTML = '';

		const title = document.createElement('h1');
		title.innerText = 'Viaje en progreso';
		trip.appendChild(title);

		const info = document.createElement('div');
		trip.appendChild(info);
	}
}

function changeName(e) {
	form.nombre = e;
}

function changeOrigen(e) {
	form.origen = e;
}

function changeDestino(e) {
	form.destino = e;
}

function changeScreen(e) {
	appState.page = e;
	renderPage();
}

async function createRequest() {
	try {
		const request = {
			nombre: form.nombre,
			origen: form.origen,
			destino: form.destino,
		};
		const response = await fetch('http://localhost:5050/client', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(request),
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		socket.emit('data-client', form);
		changeScreen('trip');
	} catch (error) {
		alert('Solicitud no realizada');
	}
}

socket.on('data-client', (data) => {
	const select = document.getElementById('Select');
	select.innerHTML = '';

	if (data.length === 0) {
		const noClient = document.createElement('p');
		noClient.innerText = 'No hay solicitudes de viaje en este momento.';
		select.appendChild(noClient);
	} else {
		data.forEach((client) => {
			const clientCard = document.createElement('div');

			const name = document.createElement('p');
			name.innerText = `Nombre: ${client.nombre}`;
			clientCard.appendChild(name);

			const origin = document.createElement('p');
			origin.innerText = `Origen: ${client.origen}`;
			clientCard.appendChild(origin);

			const destination = document.createElement('p');
			destination.innerText = `Destino: ${client.destino}`;
			clientCard.appendChild(destination);

			select.appendChild(clientCard);
		});
	}
});

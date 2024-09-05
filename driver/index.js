let socket = io('http://localhost:5050', { path: '/real-time' });

const appState = {
	page: 'login',
};

const form = {
	nombre: '',
	carro: '',
	placa: '',
};

renderPage();

async function renderPage() {
	if (appState.page === 'login') {
		const login = document.getElementById('Login');
		login.innerHTML = '';
		const title = document.createElement('h1');
		title.innerText = 'EcoUber';
		login.appendChild(title);

		const subtitle = document.createElement('h2');
		subtitle.innerText = 'Ingresa tu nombre para iniciar tu viaje';
		login.appendChild(subtitle);

		const nombreInput = document.createElement('input');
		nombreInput.id = 'nombre';
		login.appendChild(nombreInput);

		nombreInput.addEventListener('change', function () {
			changeName(nombreInput.value);
		});

		const buttonLogin = document.createElement('button');
		buttonLogin.innerText = 'Login';
		buttonLogin.id = 'buttonLogin';
		login.appendChild(buttonLogin);

		buttonLogin.addEventListener('click', function () {
			changeScreen('select');
		});
	} else if (appState.page === 'select') {
		const login = document.getElementById('Login');
		login.innerHTML = '';

		const select = document.getElementById('Select');
		select.innerHTML = '';
		const title = document.createElement('h1');
		title.innerText = 'Selecciona un vehículo';
		select.appendChild(title);

		const labelVehicule = document.createElement('label');
		labelVehicule.for = 'vehicule';
		labelVehicule.innerText = 'Nombre del vehículo';
		const vehicule = document.createElement('input');
		vehicule.id = 'vehicule';
		select.appendChild(labelVehicule);
		select.appendChild(vehicule);

		const labelPlaca = document.createElement('label');
		labelPlaca.for = 'Placa';
		labelPlaca.innerText = 'Placa del vehículo';
		const placa = document.createElement('input');
		placa.id = 'Placa';
		select.appendChild(labelPlaca);
		select.appendChild(placa);

		const buttonRegister = document.createElement('button');
		buttonRegister.innerText = 'Registrar';
		select.appendChild(buttonRegister);

		vehicule.addEventListener('change', function () {
			changeCar(vehicule.value);
		});
		placa.addEventListener('change', function () {
			changePlaca(placa.value);
		});

		buttonRegister.addEventListener('click', function () {
			changeScreen('state');
		});
	} else if (appState.page === 'state') {
		const select = document.getElementById('Select');
		select.innerHTML = '';

		const state = document.getElementById('State');
		state.innerHTML = '';

		const title = document.createElement('h1');
		title.innerText = 'Estado';
		state.appendChild(title);

		const selectVehicule = document.createElement('p');
		selectVehicule.innerText = 'Vehículo seleccionado';
		state.appendChild(selectVehicule);

		const activar = document.createElement('button');
		activar.innerText = 'Activar';
		state.appendChild(activar);

		const desactivar = document.createElement('button');
		desactivar.innerText = 'Desactivar';
		state.appendChild(desactivar);

		const waiting = document.createElement('p');
		state.appendChild(waiting);

		activar.addEventListener('click', function () {
			createUser();
		});
	} else if (appState.page === 'request') {
		const state = document.getElementById('State');
		state.innerHTML = '';

		const request = document.getElementById('Request');
		request.innerHTML = '';

		const title = document.createElement('h1');
		title.innerText = 'Nuevo viaje';
		request.appendChild(title);

		const infoPasajero = document.createElement('div');
		request.appendChild(infoPasajero);

		const accept = document.createElement('button');
		accept.innerText = 'Aceptar';
		request.appendChild(accept);

		accept.addEventListener('click', function () {
			changeScreen('trip');
		});
	} else if (appState.page === 'trip') {
		const request = document.getElementById('Request');
		request.innerHTML = '';

		const trip = document.getElementById('Trip');
		trip.innerHTML = '';

		const title = document.createElement('h1');
		title.innerText = 'Viaje en progreso';
		trip.appendChild(title);

		const infoPasajero = document.createElement('div');
		trip.appendChild(infoPasajero);

		const iniciar = document.createElement('button');
		iniciar.innerText = 'Iniciar viaje';
		trip.appendChild(iniciar);

		iniciar.addEventListener('click', function () {
			iniciar.innerHTML = 'Finalizar viaje';
		});
	}
}

function changeName(e) {
	form.nombre = e;
}

function changeCar(e) {
	form.carro = e;
}

function changePlaca(e) {
	form.placa = e;
}

function changeScreen(e) {
	appState.page = e;
	renderPage();
}

socket.on('data-client', (data) => {
	const section = document.getElementById('Request');
	section.innerHTML = '';
	data.forEach((client) => {
		const cart = document.createElement('div');
		const nombre = document.createElement('p');
		nombre.innerText = client.nombre;
		cart.appendChild(nombre);

		const origen = document.createElement('p');
		origen.innerText = client.origen;
		cart.appendChild(origen);

		const destino = document.createElement('p');
		destino.innerText = client.destino;
		cart.appendChild(destino);

		section.appendChild(cart);
	});
});

async function createUser() {
	try {
		const usuario = {
			nombre: form.nombre,
			carro: form.carro,
			placa: form.placa,
		};
		const response = await fetch('http://localhost:5050/driver', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(usuario),
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		socket.emit('data-driver', form);
		changeScreen('request');
	} catch (error) {
		alert('Usuario no registrado');
	}
}

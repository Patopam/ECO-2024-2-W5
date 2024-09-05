const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
	path: '/real-time',
	cors: {
		origin: '*',
	},
});

const db = {
	drivers: [],
	clients: [],
	trips: [], // Nueva sección para gestionar viajes
};

// Rutas y lógica del servidor
app.get('/drivers', (req, res) => {
	res.send(db.drivers);
});

app.post('/driver', (req, res) => {
	db.drivers.length = 0; // Limpiar la lista de conductores antes de agregar el nuevo
	const { body } = req;
	db.drivers.push(body);
	res.status(201).send(body);
	io.emit('data-driver', db.drivers); // Emitir datos actualizados en tiempo real
});

app.get('/clients', (req, res) => {
	res.send(db.clients);
});

app.post('/client', (req, res) => {
	const { body } = req;
	db.clients.push(body);
	res.status(201).send(body);
	io.emit('data-client', db.clients); // Emitir datos actualizados en tiempo real
	matchClientWithDriver(); // Intentar emparejar cliente con un conductor
});

app.post('/trip/:tripId/start', (req, res) => {
	const tripId = req.params.tripId;
	const trip = db.trips.find((trip) => trip.id === tripId);
	if (trip) {
		trip.status = 'in_progress';
		io.emit('trip-update', trip);
		res.status(200).send(trip);
	} else {
		res.status(404).send({ error: 'Trip not found' });
	}
});

app.post('/trip/:tripId/end', (req, res) => {
	const tripId = req.params.tripId;
	const trip = db.trips.find((trip) => trip.id === tripId);
	if (trip) {
		trip.status = 'completed';
		io.emit('trip-update', trip);
		res.status(200).send(trip);
	} else {
		res.status(404).send({ error: 'Trip not found' });
	}
});

// Función para emparejar un cliente con un conductor disponible
function matchClientWithDriver() {
	const availableDriver = db.drivers.find((driver) => driver.status === 'available');
	const waitingClient = db.clients.shift(); // Asumimos que solo hay un cliente esperando por ahora

	if (availableDriver && waitingClient) {
		const newTrip = {
			id: `${Date.now()}`, // Genera un ID único para el viaje
			driver: availableDriver,
			client: waitingClient,
			status: 'pending', // Estado inicial del viaje
		};
		db.trips.push(newTrip);
		io.emit('trip-update', newTrip); // Emitir información del viaje
	}
}

// Eventos de socket.io
io.on('connection', (socket) => {
	console.log('a user connected');
	socket.emit('data-driver', db.drivers);
	socket.emit('data-client', db.clients);
	socket.emit('trip-update', db.trips);

	socket.on('data-client', (data) => {
		io.emit('data-client', data);
	});

	socket.on('data-driver', (data) => {
		io.emit('data-driver', data);
	});

	socket.on('trip-update', (data) => {
		io.emit('trip-update', data);
	});
});

httpServer.listen(5050, () => {
	console.log('Server is running on http://localhost:5050');
});

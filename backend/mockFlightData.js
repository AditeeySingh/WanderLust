const generateRandomPrice = (base) => {
    return Math.floor(base + (Math.random() * 200) - 100);
};

const generateFlightNumber = (airline) => {
    return `${airline}${Math.floor(1000 + Math.random() * 9000)}`;
};

const generateTime = (baseHour) => {
    const hour = (baseHour + Math.floor(Math.random() * 3)) % 24;
    const minute = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const airlines = {
    'EK': 'Emirates',
    'AI': 'Air India',
    'LH': 'Lufthansa',
    'BA': 'British Airways',
    'QR': 'Qatar Airways',
    'SQ': 'Singapore Airlines'
};

const generateMockFlights = (origin, destination, date) => {
    const flights = [];
    const basePrice = 500;

 
    Object.entries(airlines).forEach(([airlineCode, airlineName], index) => {
        for (let i = 0; i < 2; i++) { 
            const departureTime = generateTime(6 + (i * 4));
            const durationHours = Math.floor(4 + Math.random() * 4);
            const arrivalTime = generateTime((parseInt(departureTime.split(':')[0]) + durationHours) % 24);

            flights.push({
                id: `${origin}-${destination}-${airlineCode}-${i}`,
                airline: airlineName,
                flightNumber: generateFlightNumber(airlineCode),
                departureAirport: origin,
                arrivalAirport: destination,
                departureTime: `${date}T${departureTime}:00`,
                arrivalTime: `${date}T${arrivalTime}:00`,
                duration: `${durationHours}h ${Math.floor(Math.random() * 60)}m`,
                price: generateRandomPrice(basePrice),
                currency: 'USD',
                seatsAvailable: Math.floor(10 + Math.random() * 50),
                cabinClass: 'ECONOMY',
                stops: 0
            });
        }
    });

    return flights;
};

module.exports = { generateMockFlights };
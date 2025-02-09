/**
 * Displays flight search results in the UI
 * @param {Object} data - The flight data received from the API
 */
function displayFlightResults(data) {
    // Get DOM elements
    const resultsContainer = document.getElementById('flightResults');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Validate results container exists
    if (!resultsContainer) {
        console.error('Flight results container not found!');
        return;
    }

    // Hide loading indicator and clear previous results
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    resultsContainer.innerHTML = '';

    // Handle case when no flights are found
    if (!data || !data.data || data.data.length === 0) {
        resultsContainer.innerHTML = '<p>No flights found for the selected criteria.</p>';
        return;
    }

    // Group flights by airline for better organization
    const flightsByAirline = {};
    data.data.forEach(flight => {
        if (!flightsByAirline[flight.airline]) {
            flightsByAirline[flight.airline] = [];
        }
        flightsByAirline[flight.airline].push(flight);
    });

    // Create and append HTML for each airline's flights
    Object.entries(flightsByAirline).forEach(([airline, flights]) => {
        // Create airline section container
        const airlineSection = document.createElement('div');
        airlineSection.className = 'airline-section';
        
        // Add airline header
        const airlineHeader = document.createElement('h3');
        airlineHeader.textContent = airline;
        airlineSection.appendChild(airlineHeader);

        // Create grid for flight cards
        const flightsGrid = document.createElement('div');
        flightsGrid.className = 'flights-grid';

        // Create individual flight cards
        flights.forEach(flight => {
            const flightCard = document.createElement('div');
            flightCard.className = 'flight-card';
            
            // Populate flight card with flight details
            flightCard.innerHTML = `
                <div class="flight-header">
                    <span class="flight-number">${flight.flightNumber}</span>
                    <span class="price">$${flight.price}</span>
                </div>
                <div class="flight-times">
                    <div class="departure">
                        <div class="time">${new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div class="airport">${flight.departureAirport}</div>
                    </div>
                    <div class="flight-duration">
                        <div class="duration">${flight.duration}</div>
                        <div class="stops">${flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}</div>
                    </div>
                    <div class="arrival">
                        <div class="time">${new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div class="airport">${flight.arrivalAirport}</div>
                    </div>
                </div>
                <div class="flight-footer">
                    <span class="seats">Seats available: ${flight.seatsAvailable}</span>
                    <span class="cabin-class">${flight.cabinClass}</span>
                </div>
            `;
            flightsGrid.appendChild(flightCard);
        });

        // Append completed grid to airline section
        airlineSection.appendChild(flightsGrid);
        resultsContainer.appendChild(airlineSection);
    });
}

// At the top of the file, define the API URL
const API_URL = 'https://wanderlust-1-apw2.onrender.com'; // Your Render backend URL

/**
 * Handles the flight search form submission and API call
 * @param {Event} event - The form submission event
 */
async function searchFlights(event) {
    event.preventDefault();
    
    // Get DOM elements
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsContainer = document.getElementById('flightResults');
    
    // Show loading state
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }

    // Get form input values
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;
    const passengers = document.getElementById('passengers').value;
    const travelClass = document.getElementById('class').value;

    // Validate required inputs
    if (!origin || !destination || !departureDate || !passengers) {
        alert('Please fill in all required fields');
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/flights/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                origin,
                destination,
                departureDate,
                returnDate,
                adults: parseInt(passengers),
                travelClass
            })
        });

        if (!response.ok) throw new Error('Flight search failed');
        const data = await response.json();
        displayFlightResults(data);
    } catch (error) {
        console.error('Error:', error);
        showError('Unable to fetch flight information');
    }
}

/**
 * Sets up city autocomplete functionality for input fields
 * @param {string} inputId - The ID of the input element to set up autocomplete for
 */
function setupCityAutocomplete(inputId) {
    // Get input element and create suggestions container
    const input = document.getElementById(inputId);
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions-dropdown';
    input.parentNode.appendChild(suggestionsContainer);

    // Initialize debounce timer
    let debounceTimer;

    // Add input event listener for autocomplete
    input.addEventListener('input', async () => {
        const query = input.value.trim();
        
        // Clear previous timer
        clearTimeout(debounceTimer);

        // Don't search for short queries
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        // Debounce API calls
        debounceTimer = setTimeout(async () => {
            try {
                // Fetch city suggestions from API
                const response = await fetch(`${API_URL}/api/cities/suggest?q=${encodeURIComponent(query)}`);
                const suggestions = await response.json();
                
                // Display suggestions if any exist
                if (suggestions.length > 0) {
                    suggestionsContainer.innerHTML = suggestions.map(city => `
                        <div class="suggestion-item">
                            <i class="fas fa-city"></i>
                            ${city}
                        </div>
                    `).join('');
                    suggestionsContainer.style.display = 'block';

                    // Add click handlers to suggestions
                    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', () => {
                            input.value = item.textContent.trim();
                            suggestionsContainer.style.display = 'none';
                        });
                    });
                } else {
                    suggestionsContainer.style.display = 'none';
                }
            } catch (error) {
                console.error('Error fetching city suggestions:', error);
                suggestionsContainer.style.display = 'none';
            }
        }, 300); // 300ms debounce delay
    });

    /**
     * Handles keyboard navigation in the suggestions dropdown
     */
    input.addEventListener('keydown', (e) => {
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        const activeItem = suggestionsContainer.querySelector('.suggestion-item.active');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!activeItem) {
                    items[0]?.classList.add('active');
                } else {
                    const nextItem = activeItem.nextElementSibling;
                    if (nextItem) {
                        activeItem.classList.remove('active');
                        nextItem.classList.add('active');
                    }
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (activeItem) {
                    const prevItem = activeItem.previousElementSibling;
                    if (prevItem) {
                        activeItem.classList.remove('active');
                        prevItem.classList.add('active');
                    }
                }
                break;
                
            case 'Enter':
                if (activeItem) {
                    e.preventDefault();
                    input.value = activeItem.textContent.trim();
                    suggestionsContainer.style.display = 'none';
                }
                break;
                
            case 'Escape':
                suggestionsContainer.style.display = 'none';
                break;
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Show suggestions on focus if input has value
    input.addEventListener('focus', async () => {
        const query = input.value.trim();
        if (query.length >= 2) {
            const response = await fetch(`${API_URL}/api/cities/suggest?q=${encodeURIComponent(query)}`);
            const suggestions = await response.json();
            if (suggestions.length > 0) {
                suggestionsContainer.innerHTML = suggestions.map(city => `
                    <div class="suggestion-item">
                        <i class="fas fa-city"></i>
                        ${city}
                    </div>
                `).join('');
                suggestionsContainer.style.display = 'block';
            }
        }
    });
}

/**
 * Sets up date input fields with validation and constraints
 */
function setupDateInputs() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const departureInput = document.getElementById('departure-date');
    const returnInput = document.getElementById('return-date');
    
    departureInput.min = today;
    
    // Ensure return date is not before departure date
    departureInput.addEventListener('change', () => {
        returnInput.min = departureInput.value;
        if (returnInput.value && returnInput.value < departureInput.value) {
            returnInput.value = departureInput.value;
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up form submission handler
    const searchForm = document.getElementById('flightSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', searchFlights);
    }

    // Initialize autocomplete for origin and destination fields
    setupCityAutocomplete('origin');
    setupCityAutocomplete('destination');
    
    // Set up date input constraints
    setupDateInputs();
});

// Update the weather API call
async function getWeather(city) {
    try {
        const response = await fetch(`${API_URL}/api/weather/${encodeURIComponent(city)}`);
        if (!response.ok) throw new Error('Weather fetch failed');
        return await response.json();
    } catch (error) {
        console.error('Weather API Error:', error);
        return null;
    }
}

// Update the distance API call
async function getDistance(origin, destination) {
    try {
        const response = await fetch(`${API_URL}/api/distance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ origin, destination })
        });
        if (!response.ok) throw new Error('Distance calculation failed');
        return await response.json();
    } catch (error) {
        console.error('Distance API Error:', error);
        return null;
    }
}

// Update city suggestions API
async function getCitySuggestions(query) {
    try {
        const response = await fetch(`${API_URL}/api/cities/suggest?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('City suggestion fetch failed');
        return await response.json();
    } catch (error) {
        console.error('City Suggestion API Error:', error);
        return [];
    }
}
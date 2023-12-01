document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const geoButton = document.getElementById('geoButton');

    searchButton.addEventListener('click', () => {
        console.log("Search button clicked"); 
        const location = document.getElementById('locationInput').value;
        if (location) {
            getCoordinates(location);
        } else {
            showError('Please enter a location');
        }
    });

    geoButton.addEventListener('click', () => {
        console.log("Inside geoButton click");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log("Latitude:", position.coords.latitude, "Longitude:", position.coords.longitude);
                const { latitude, longitude } = position.coords;
                getSunriseSunset(latitude, longitude);
            }, (error) => {
                console.error("Geolocation Error:", error);
                showError(`Geolocation error: ${error.message}`);
            });
        } else {
            showError('Geolocation is not supported by this browser.');
        }
    });
    
});


function getCoordinates(location) {
    clearResults(); 

    const geocodeApiUrl = `https://geocode.maps.co/search?q=${location}`;
    fetch(geocodeApiUrl)
        .then(response => response.json())
        .then(data => {
            console.log("Response from geocode API data: " + JSON.stringify(data));
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                getSunriseSunset(lat, lon);
            } else {
                showError('Location not found');
            }
        })
        .catch(error => showError(error)); 
    }


function getSunriseSunset(latitude, longitude) {
    const dates = getFormattedDates();
    console.log("Today's date:", dates.today); 
    console.log("Tomorrow's date:", dates.tomorrow); 
    const apiUrlToday = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&timezone=UTC&date=${dates.today}`;
    const apiUrlTomorrow = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&timezone=UTC&date=${dates.tomorrow}`;

    Promise.all([
        fetch(apiUrlToday).then(response => response.json()),
        fetch(apiUrlTomorrow).then(response => response.json())
    ])
    .then(([dataToday, dataTomorrow]) => {
        if (dataToday.status === 'OK' && dataTomorrow.status === 'OK') {
            console.log("Today's sunrise-sunset data:", dataToday.results);
            console.log("Tomorrow's sunrise-sunset data:", dataTomorrow.results);
            updateUI(dataToday.results, dataTomorrow.results);
        } else {
            showError('Error fetching sunrise and sunset data');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError(error.message);
    });
}

function getFormattedDates() {
    const today = new Date().toLocaleDateString('en-CA');
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('en-CA');

    return { today, tomorrow };
}

function updateUI(dataToday, dataTomorrow) {
    const resultsElement = document.getElementById('results');
    const placeholderElement = document.getElementById('placeholder');
    const resultContent = document.getElementById('resultContent');
    console.log("Today's sunrise-sunset data:", dataToday);
    console.log("Tomorrow's sunrise-sunset data:", dataTomorrow);

    resultContent.innerHTML = `
        <div class="data-container">
            <div class="data-column">
                <h3>Today's Data</h3>
                <p>Sunrise: ${dataToday.sunrise}</p>
                <p>Sunset: ${dataToday.sunset}</p>
                <p>Dawn: ${dataToday.dawn}</p>
                <p>Dusk: ${dataToday.dusk}</p>
                <p>Day Length: ${dataToday.day_length}</p>
                <p>Solar Noon: ${dataToday.solar_noon}</p>
                <p>Timezone: ${dataToday.timezone} </p>
            </div>
            <div class="data-column">
                <h3>Tomorrow's Data</h3>
                <p>Sunrise: ${dataTomorrow.sunrise}</p>
                <p>Sunset: ${dataTomorrow.sunset}</p>
                <p>Dawn: ${dataTomorrow.dawn}</p>
                <p>Dusk: ${dataTomorrow.dusk}</p>
                <p>Day Length: ${dataTomorrow.day_length}</p>
                <p>Solar Noon: ${dataTomorrow.solar_noon}</p>
                <p>Timezone: ${dataTomorrow.timezone} </p>
            </div>
        </div>
    `;

    placeholderElement.classList.add('hidden');
    resultsElement.classList.remove('hidden');
}


function clearResults() {
    const resultsElement = document.getElementById('results');
    const placeholderElement = document.getElementById('placeholder');
    const resultContent = document.getElementById('resultContent');

    resultContent.innerHTML = '';
    resultsElement.classList.add('hidden');
    placeholderElement.classList.remove('hidden'); 
}    



function showError(message) {
    const resultsElement = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = `<p class="error">${message}</p>`; 
    resultsElement.classList.remove('hidden'); 
}

function showError(error) {
    let message = '';
    if (typeof error === 'string') {
        message = error;
    } else if (error && error.message) {
        message = error.message;
    } else {
        message = 'An unexpected error occurred. Please try again.';
    }

    const resultsElement = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = `<p class="error">${message}</p>`;
    resultsElement.classList.remove('hidden');
}
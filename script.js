// Initialize MQTT client
var hostname = "broker.emqx.io"; 
var port = 8084; 
var client = new Paho.MQTT.Client(hostname, port, "client-" + Math.round(Math.random(100000000, 1000000000)*1000000000)); // doesnt work if i dont make unique clients??

client.onConnectionLost = onConnectionLost;
var connected = false; 

var map;
var marker;


// host and port
var hostStatement = document.createElement("p");
hostStatement.id = "hostStatement"; 
hostStatement.textContent = "Connecting to Host: " + hostname; 
var portStatement = document.createElement("p");
portStatement.id = "portStatement";
portStatement.textContent = "Connecting to Port: " + port;

// connect host and port (weird but it finally works)
var connectionDiv = document.getElementById("connection");
if (connectionDiv) {
    connectionDiv.appendChild(hostStatement);
    connectionDiv.appendChild(portStatement);
}

document.getElementById("shareBtn").addEventListener("click", shareStatus);

// connect to broker
function connect() {
    if (!connected) {
        client.connect({
            onSuccess: onConnect,
            onFailure: onFailure,
            useSSL: true 
        });
    } else {
        console.log("Already connected to MQTT broker");
    }
}

// initialize map
var map = L.map('map').setView([51.0447, -114.0719], 13); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// when connect, remove host and port
function onConnect() {
    console.log("Connected to MQTT broker");
    document.getElementById("status").textContent = "Connected";
    document.getElementById("hostStatement").style.display = "none"; 
    document.getElementById("portStatement").style.display = "none"; 
    connected = true;
}

// fail check (needed)
function onFailure() {
    console.log("Failed to connect to MQTT broker");
    document.getElementById("status").textContent = "Failed to connect";
}

// disconnect from broker
function disconnect() {
    if (connected) {
        client.disconnect();
        console.log("Disconnected from MQTT broker");
        document.getElementById("status").textContent = "Disconnected";
        document.getElementById("hostStatement").style.display = "block"; 
        document.getElementById("portStatement").style.display = "block"; 
        connected = false;
    }
}

// Publish a message to the specified topic
function publishMessage() {
    var topic = document.getElementById("topic").value;
    var message = document.getElementById("message").value;
    var messageObj = new Paho.MQTT.Message(message);
    messageObj.destinationName = topic;
    client.send(messageObj);
    console.log("Published message: " + message + " to topic: " + topic);
}

// Publish the geoJson message to the specific topic
function publishGeoMessage(topic, message) {
    var messageObj = new Paho.MQTT.Message(message);
    messageObj.destinationName = topic;
    client.send(messageObj);
    console.log("Published message: " + message + " to topic: " + topic);
}


function shareStatus() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendLocation, handleLocationError);
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

function sendLocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const temperature = generateRandomTemperature(); 

    const geoJSONObject = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [longitude, latitude]
        },
        "properties": {
            "temperature": temperature
        }
    };

    const geoJSONString = JSON.stringify(geoJSONObject);

    // Get the topic from the existing topic input field
    const topic = document.getElementById("topic").value; 

    publishGeoMessage(topic, geoJSONString); 
    
    // Debugging statements:
    console.log("Geolocation retrieved:", position);
    console.log("GeoJSON message:", geoJSONString);
    console.log("Published to topic:", topic);
}

function showTemperature(latitude, longitude) {
    const topic = "engo551/amenfasil/my_temperature";
    client.subscribe(topic);
    
    // Callback function for when a message is received
    client.onMessageArrived = function(message) {
        const temperature = parseFloat(message.payloadString);
        let iconColor;

        // Change icon color based on temperature range
        if (temperature < 10) {
            iconColor = 'blue';
        } else if (temperature < 30) {
            iconColor = 'green';
        } else {
            iconColor = 'red';
        }

        // Create a Leaflet marker with custom icon
        const customIcon = L.icon({
            iconUrl: `https://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

        // Bind popup to show temperature
        marker.bindPopup(`Temperature: ${temperature}°C`).openPopup();
    };
}

function showTemperature(latitude, longitude) {
    const topic = "engo551/amenfasil/my_temperature";
    client.subscribe(topic);
    
    const temperature = generateRandomTemperature();
    let iconColor;

    if (temperature < 10) {
        iconColor = 'blue';
    } else if (temperature < 30) {
        iconColor = 'green';
    } else {
        iconColor = 'red';
    }

        // Create a Leaflet marker with custom icon
        const customIcon = L.icon({
            iconUrl: `https://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`,
            iconSize: [32, 32],
            iconAnchor: [16, -10]
        });
        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

        // Bind popup to show temperature
        marker.bindPopup(`Temperature: ${temperature}°C`).openPopup();
    };


function handleLocationError(error) {
    console.error("Error getting location:", error);
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection lost: " + responseObject.errorMessage);
        var status = document.querySelector("#connection p#status");
        if (status) {
            status.textContent = "Connection lost: " + responseObject.errorMessage;
        }

        // Automatically attempt to reconnect
        connect();
    }
}


// Function to generate a random temperature
function generateRandomTemperature() {
    // Generate a random temperature between -40 and 60 degrees Celsius
    var minTemperature = -40;
    var maxTemperature = 60;
    var randomTemperature = Math.random() * (maxTemperature - minTemperature) + minTemperature;
    // Round the temperature to two decimal places
    randomTemperature = Math.round(randomTemperature * 100) / 100;
    return randomTemperature;
}

// Function to show user location and temperature
function showUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Call showTemperature when location icon is clicked
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.on('click', function() {
                showTemperature(latitude, longitude);
            });

            map.setView([latitude, longitude], 15); // Zoom in a bit
        }, handleLocationError);
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// Add event listener to start button to connect and show user location
document.getElementById("start").addEventListener("click", function() {
    connect();
    showUserLocation();
});

document.getElementById("end").addEventListener("click", disconnect);
document.getElementById("publishBtn").addEventListener("click", publishMessage);
document.getElementById("shareBtn").addEventListener("click", shareStatus);



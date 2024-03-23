var hostStatementText = "Host: test.mosquitto.org";
var portStatementText = "Port: 8081";

// Set host and port statements directly
var hostStatement = document.createElement("p");
hostStatement.textContent = hostStatementText;
var portStatement = document.createElement("p");
portStatement.textContent = portStatementText;

// map
var map;

map = L.map('map').setView([51.0447, -114.0719], 13); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Append host and port statements to the connection div
var connectionDiv = document.getElementById("connection");
if (connectionDiv) {
    connectionDiv.appendChild(hostStatement);
    connectionDiv.appendChild(portStatement);
}

// Initialize MQTT client
var hostname = "test.mosquitto.org";
var port = 8081;
var client = new Paho.MQTT.Client(hostname, port, "clientId");

// Set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

var connected = false;

function connect() {
    if (!connected) {
        client.connect({
            onSuccess: onConnect,
            onFailure: onFailure,
            useSSL: true
        });
    }
}

function onConnect() {
    console.log("Connected to MQTT broker");
    var status = document.querySelector("#connection p#status");
    if (status) {
        status.textContent = "Connected";
    }
    connected = true;
}

function onFailure() {
    console.log("Failed to connect to MQTT broker");
    var status = document.querySelector("#connection p#status");
    if (status) {
        status.textContent = "Failed to connect";
    }
}

function disconnect() {
    if (connected) {
        client.disconnect();
        console.log("Disconnected from MQTT broker");
        var status = document.querySelector("#connection p#status");
        if (status) {
            status.textContent = "Disconnected";
        }
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

// Share status
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
    publishMessage("topic35/pjt551", geoJSONString);
}

function handleLocationError(error) {
    console.error("Error getting location:", error);
    // Maybe display an error message to the user here
}

// Other functions remain unchanged
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

function onMessageArrived(message) {
    console.log("Message arrived on topic: " + message.destinationName);
    console.log("Message: " + message.payloadString);

    const geoJSONData = JSON.parse(message.payloadString);

    // Access the coordinates and temperature
    const latitude = geoJSONData.geometry.coordinates[1]; 
    const longitude = geoJSONData.geometry.coordinates[0];
    const temperature = geoJSONData.properties.temperature; 

    let marker; // Declare marker outside to access later
    if (marker) {
        // Marker exists, update position
        marker.setLatLng([latitude, longitude]); 
    } else {
        // Create a new marker
        marker = L.marker([latitude, longitude]).addTo(map); 
    }

    // Bind popup to show temperature
    marker.bindPopup("Temperature: " + temperature); 

    // Center the map to the new location (optional for continuous updates)
    map.setView([latitude, longitude]); 
}

function generateRandomTemperature() {
    // Generate a random temperature between -40 and 60 degrees Celsius
    var minTemperature = -40;
    var maxTemperature = 60;
    var randomTemperature = Math.random() * (maxTemperature - minTemperature) + minTemperature;
    // Round the temperature to two decimal places
    randomTemperature = Math.round(randomTemperature * 100) / 100;
    return randomTemperature;
}


// Add event listeners to buttons
document.getElementById("start").addEventListener("click", connect);
document.getElementById("end").addEventListener("click", disconnect);
document.getElementById("publishBtn").addEventListener("click", publishMessage);
document.getElementById("shareBtn").addEventListener("click", shareStatus);

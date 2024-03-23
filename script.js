// Initialize MQTT client
var hostname = "broker.emqx.io"; 
var port = 8084; 
var client = new Paho.MQTT.Client(hostname, port, "clientId");

// Set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Connection state flag
var connected = false; 

// Display host and port (dynamically)
var hostStatement = document.createElement("p");
hostStatement.id = "hostStatement"; // Added an ID 
hostStatement.textContent = "Connecting to Host: " + hostname; 
var portStatement = document.createElement("p");
portStatement.id = "portStatement"; // Added an ID
portStatement.textContent = "Connecting to Port: " + port;

var connectionDiv = document.getElementById("connection");
if (connectionDiv) {
    connectionDiv.appendChild(hostStatement);
    connectionDiv.appendChild(portStatement);
}


function connect() {
    if (!connected) {
        client.connect({
            onSuccess: onConnect,
            onFailure: onFailure,
            useSSL: true // Ensure this matches your MQTT broker settings
        });
    }
}

// Map initialization function
function initMap() {
    var map = L.map('map').setView([51.0447, -114.0719], 13); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Call the map initialization function when the DOM content is loaded
document.addEventListener("DOMContentLoaded", function() {
    initMap();
});

function onConnect() {
    console.log("Connected to MQTT broker");
    document.getElementById("status").textContent = "Connected";
    document.getElementById("hostStatement").style.display = "none"; 
    document.getElementById("portStatement").style.display = "none"; 
    connected = true;
}

function onFailure() {
    console.log("Failed to connect to MQTT broker");
    document.getElementById("status").textContent = "Failed to connect";
}

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

    publishMessage(topic, geoJSONString); 
}


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

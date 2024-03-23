// Initialize MQTT client
var hostname = "test.mosquitto.org";
var port = 8081; 
console.log("Connecting to: " + hostname + ":" + port);
var client = new Paho.MQTT.Client(hostname, port, "clientId");

// Set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

var map;

// Update display elements (before connecting) 
document.getElementById("hostStatement").textContent = "Connecting to Host: " + hostname;
document.getElementById("portStatement").textContent = "Connecting to Port: " + port;

function connect() {
    var hostname = document.getElementById("host").value; // Or get the values if you're not using input elements
    var port = Number(document.getElementById("port").value);



    client.connect({
        onSuccess: onConnect,
        onFailure: onFailure,
        useSSL: true 
    });
}


// connection fail
function onFailure() {
    console.log("Failed to connect to MQTT broker");
    document.getElementById("status").innerHTML = "Failed to connect";
}

// Disconnect from MQTT broker
function disconnect() {
    client.disconnect();
    console.log("Disconnected from MQTT broker");
    document.getElementById("status").innerHTML = "Disconnected";
    document.getElementById("start").disabled = false;
    document.getElementById("host").disabled = false; 
    document.getElementById("port").disabled = false; 

    document.getElementById("hostStatement").style.display = "block"; // Or your preferred display style 
    document.getElementById("portStatement").style.display = "block"; 
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


map = L.map('map').setView([51.0447, -114.0719], 13); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function generateRandomTemperature() {
    // Generate a random temperature between -40 and 60 degrees Celsius
    var minTemperature = -40;
    var maxTemperature = 60;
    var randomTemperature = Math.random() * (maxTemperature - minTemperature) + minTemperature;
    // Round the temperature to two decimal places
    randomTemperature = Math.round(randomTemperature * 100) / 100;
    return randomTemperature;
}


// Modified publishMessage to take a specific topic 
function publishMessage(topic, message) {
    var messageObj = new Paho.MQTT.Message(message);
    messageObj.destinationName = topic;
    client.send(messageObj);
    console.log("Published message: " + message + " to topic: " + topic);
}

function onConnect() {
    console.log("Connected to MQTT broker");
    document.getElementById("status").innerHTML = "Connected";

    document.getElementById("start").disabled = true;
    document.getElementById("host").disabled = true; 
    document.getElementById("port").disabled = true; 

    document.getElementById("hostStatement").style.display = "none";
    document.getElementById("portStatement").style.display = "none";

    // Subscribe to your topic
    client.subscribe("topic35/pjt551"); 
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
// Define onConnectionLost function
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection lost: " + responseObject.errorMessage);
        document.getElementById("status").innerHTML = "Connection lost: " + responseObject.errorMessage;
        document.getElementById("start").disabled = false;
        document.getElementById("host").disabled = false; 
        document.getElementById("port").disabled = false; 
    }
    // Handle reconnection here if needed
}

// Add event listeners to buttons
document.getElementById("start").addEventListener("click", connect);
document.getElementById("end").addEventListener("click", disconnect);
document.getElementById("publishBtn").addEventListener("click", publishMessage);
document.getElementById("shareBtn").addEventListener("click", shareStatus);

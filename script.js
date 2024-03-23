// Initialize MQTT client
var client = new Paho.MQTT.Client("test.mosquitto.org", Number(8080), "clientId");

// Set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Connect to MQTT broker
function connect() {
    var host = document.getElementById("host").value;
    var port = Number(document.getElementById("port").value);
    client.connect({
        onSuccess: onConnect,
        onFailure: onFailure,
        useSSL: false
    });
}

// Called when the connection is successful
function onConnect() {
    console.log("Connected to MQTT broker");
    document.getElementById("status").innerHTML = "Connected";
}

// Called when the connection fails
function onFailure() {
    console.log("Failed to connect to MQTT broker");
    document.getElementById("status").innerHTML = "Failed to connect";
}

// Disconnect from MQTT broker
function disconnect() {
    client.disconnect();
    console.log("Disconnected from MQTT broker");
    document.getElementById("status").innerHTML = "Disconnected";
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
    // Implement your functionality here
    console.log("Status shared");
}

// Add event listeners to buttons
document.getElementById("start").addEventListener("click", connect);
document.getElementById("end").addEventListener("click", disconnect);
document.getElementById("publishBtn").addEventListener("click", publishMessage);
document.getElementById("shareBtn").addEventListener("click", shareStatus);

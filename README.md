# Amen Lab 5

This lab is intended for the user to understand how to use MQTT protocols, send messages, 
integrate functionality of those messages with Leaflet. 

These are intended to be hosted on github pages and accessed on a mobile device

# Components

- index.html - contains html content for the messaging and map visualization
- style.css - minor styling for the map boxing as well as font
- script.js - majority of the functionality of the project comes from here


# implementations

1. can connect and disconnect from the set broker which the user can see
2. is able to send messages to any topic the user wants 
3. can show the status of the user, sending their position and temperature as a GeoJSON message
4. can see the current user position when user connects to broker.
5. can see the temperature (randomly generated between -40 to 60) of the user by clicking on the marker (which changes color)

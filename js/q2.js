let railways, routes;
let scalingFactorX, scalingFactorY;
let singleRoute;
let mapImg;

let colors = [];
let boxWidth = 250;
let boxHeight = 70;

let index = 0;
let nextIndex = 0;

let minLat = 152.946922527076;
let maxLat = 153.180247019681;
let minLon = 27.6049449522395;
let maxLon = 27.3660874490119;

let stationNames = [];
let stationStatus = [];
let xCoords = [];
let yCoords = [];
let scaledXCoord = [];
let scaledYCoord = [];
let route = [];

function preload(){
    railways = loadJSON('railways.geojson');
    routes = loadStrings('routes.txt');
    mapImg = loadImage('map.png');
}

function setup() {
    createCanvas(800, 800);
    for (let i = 0; i < railways.features.length; i++) { //extract station data from geoJSON
        let nameOfStation = railways.features[i].properties.NAME;
        let stationCoord = railways.features[i].geometry.coordinates; 
        let railwayStationStatus = railways.features[i].properties.RAILSTATIONSTATUS; 

        let lat = stationCoord[0];
        let lon = stationCoord[1];

        if (lat <= maxLat && lat >= minLat && lon <= maxLon * -1 && lon >= minLon * -1){ //filter stations based on visible area
            stationNames.push(nameOfStation); //store the station’s data into separate arrays
            xCoords.push(lat); 
            yCoords.push(lon);
            stationStatus.push(railwayStationStatus);
        }
    }

    minLat = 152.918755; //update bounding box values to match the map image scaling
    maxLat = 153.196618;
    minLon = 27.605666;
    maxLon = 27.358992;

    scalingFactorX = width / (maxLat - minLat); //pixels per degree of lat/lon
    scalingFactorY = height / (maxLon - minLon);
    
    for (let i = 0; i < xCoords.length; i++) { //convert lat/lon to canvas coordinates
        let lat = scalingFactorX*(xCoords[i] - minLat);
        scaledXCoord[i] = lat;
        
        let lon = scalingFactorY*(yCoords[i] + minLon);
        scaledYCoord[i] = lon + height;
    }

    for (let i = 0; i < routes.length; i++) { //split route strings into individual station names
        let individualRoutes = [];
        singleRoute = routes[i].split(', ');
        for ( let j = 0; j < singleRoute.length; j++) { 
            individualRoutes.push(singleRoute[j]);
        }
        route.push(individualRoutes); //store that route into route[] to have an array of arrays
        
        let r = random(0, 255);
        let g = random(0, 255);
        let b = random(0, 255);
        colors[i] = color(r, b, g);
    }
}

function draw(){
    background (255);

    if (mapImg) { 
        image (mapImg, 0, 0, width, height);
    }
    
    for (let i = 0; i < route.length; i++) { //get all routes and colors from colors[] array to draw it with
        let individualRoute = route[i]; 
        let color = colors[i];
        
        drawRoutes (individualRoute, color);
    }

    drawStations();
}

function drawRoutes (routeArray, routeColor) {
    let x1, y1, x2, y2; //draw the line(route) between the scaled coordinates of every 2 stations
    for (let i = 0; i < routeArray.length; i++) { //go through every station name in the current route array
        let len = routeArray.length - 1; //set the max index (to avoid going out of bounds when accessing i + 1)
        let current, next;
        stroke(routeColor);
        strokeWeight(3);
        if (i != len) {
            current = routeArray[i];
            next = routeArray[i + 1];
            
            for (let j = 0; j < stationNames.length; j++){ //look through the list of all stations and when the names match, store the indexes of those stations in index and nextIndex
                if (stationNames[j] === current) index = j;
                if (stationNames[j] === next) nextIndex = j;
            }

            x1 = scaledXCoord[index]; //get the scaled canvas X/Y coordinates of the current and next station
            y1 = scaledYCoord[index];
            x2 = scaledXCoord[nextIndex];
            y2 = scaledYCoord[nextIndex];
        }
        line(x1, y1, x2, y2);
    }
}

function drawStations() {
    for (let i = 0; i < xCoords.length; i++) { 
        let x = scaledXCoord[i]; //get the on-screen X and Y position of the current station (after scaling lat/lon to fit canvas)
        let y = scaledYCoord[i];
        let xBox = x - boxWidth / 2;
        let yBox = y + 10;
        let xCoord = xCoords[i].toFixed(8); //format the actual lat/lon values to 8 decimal places for display
        let yCoord = yCoords[i].toFixed(8);
        
        noStroke();
        
        if (mouseX < x + 5 && mouseX > x - 5 && mouseY < y + 5 && mouseY > y - 5){ //If mouse is hovering over this station within 5 pixels of the station
            if (x < boxWidth / 2) { //prevent the info box from going off the left or right edge of the canvas
                xBox = x;
            } else if (boxWidth / 2 > width - x) {
                xBox = x - boxWidth;
            }
            if (boxHeight > height - y) { //prevent the box from going off the bottom edge. If too low, draw it above the station
                yBox = y - boxHeight - 10;
            }    

            fill(255, 0, 0); //draw hover highlight and info box
            ellipse(x, y, 10,10);
            fill(200);
            rect(xBox, yBox, boxWidth, boxHeight);

            fill(0);
            textSize(14);
            textAlign(CENTER);
            text("Name: " + stationNames[i], xBox, yBox + 5, boxWidth);
            text("Latitude: " + xCoord + "\n Longitude: " + yCoord, xBox, yBox + 19, boxWidth);
            text("Status: " + stationStatus[i], xBox + boxWidth / 2, yBox + 65);
        }

    fill(0);
    ellipse(x, y, 8, 8);
    }
}
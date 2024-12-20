let MapView = {};

MapView.renderType4 = function (map, lyceesData, candidatsData) {
    const customIcon = L.icon({
        iconUrl: '../asset/lycee.png',
        iconSize: [25, 25],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: null,
    });

    var markers = L.markerClusterGroup();
    for (let i = 0; i < lyceesData.length; i++) {
        let lycee = lyceesData[i];
        let candidats = candidatsData.find(c => c.numero_uai === lycee.numero_uai);
        if (candidats) {
            let marker = L.marker([lycee.latitude, lycee.longitude], { icon: customIcon });
            let popupContent = `${lycee.nom} :<br>`;
            for (let filiere in candidats) {
                if (filiere !== 'numero_uai') {
                    popupContent += `${filiere}: ${candidats[filiere]} candidats,<br>`;
                }
            }
            marker.bindPopup(popupContent);
            markers.addLayer(marker);
        }
    }

    markers.options.spiderfyOnMaxZoom = false;
    markers.options.showCoverageOnHover = false;
    markers.options.zoomToBoundsOnClick = false;

    markers.on('clusterclick', function (a) {
        let totalCandidats = {};
        let childMarkers = a.layer.getAllChildMarkers();
        for (let i = 0; i < childMarkers.length; i++) {
            const marker = childMarkers[i];
            const popupContent = marker.getPopup().getContent();
            const counts = popupContent.match(/(\w+): (\d+) candidats/g);
            counts.forEach(count => {
                const [filiere, number] = count.split(': ');
                const filiereName = filiere.trim();
                const filiereCount = parseInt(number);
                if (!totalCandidats[filiereName]) {
                    totalCandidats[filiereName] = 0;
                }
                totalCandidats[filiereName] += filiereCount;
            });
        }
        let popupContent = `Total candidats dans le cluster:<br>`;
        for (let filiere in totalCandidats) {
            popupContent += `${filiere}: ${totalCandidats[filiere]},<br>`;
        }
        a.layer.bindPopup(popupContent).openPopup();
    });
    map.addLayer(markers);
}

MapView.renderType1 = function (map, data) { // affiche les postbac
    const customIcon = L.icon({
        iconUrl: '../asset/diplome.png',
        iconSize: [25, 25],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: null,
    });

    var markers = L.markerClusterGroup({
        iconCreateFunction: function (cluster) {
            return L.divIcon({
                html: `<div style="background-color: red; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: white;">${cluster.getChildCount()}</div>`,
                className: 'custom-cluster-icon',
                iconSize: L.point(30, 30)
            });
        }
    });
    markers.options.spiderfyOnMaxZoom = false;
    markers.options.showCoverageOnHover = false;
    markers.options.zoomToBoundsOnClick = false;

    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        (async () => {
            let response = await fetch(`https://api.zippopotam.us/fr/${item.codePostal}`);
            if (response.ok) {
                let locationData = await response.json();

                if (locationData.places && locationData.places.length > 0) {
                    let place = locationData.places[0];
                    let marker = L.marker([place.latitude, place.longitude], { icon: customIcon });
                    let popupContent = `Code Postal: ${item.codePostal}<br>Nombre de candidats: ${item.count}`;
                    marker.bindPopup(popupContent);
                    markers.addLayer(marker);
                } else {
                    console.error(`No places found for postal code: ${item.codePostal}`);
                }
            } else {
                console.error(`Failed to fetch data for postal code: ${item.codePostal}`);
            }
        })();
    }

    markers.on('clusterclick', function (a) {
        let totalCandidats = 0;
        let childMarkers = a.layer.getAllChildMarkers();
        for (let i = 0; i < childMarkers.length; i++) {
            const marker = childMarkers[i];
            const popupContent = marker.getPopup().getContent();
            const countMatch = popupContent.match(/Nombre de candidats: (\d+)/);
            if (countMatch) {
                totalCandidats += parseInt(countMatch[1]);
            }
        }
        let popupContent = `Total candidats dans le cluster: ${totalCandidats}`;
        a.layer.bindPopup(popupContent).openPopup();
    });

    map.addLayer(markers);
}

MapView.hideMap = function () {
    let map = document.getElementById("map");
    map.style.display = "none";
}

MapView.showMap = function () {
    let map = document.getElementById("map");
    map.style.display = "flex";
}

MapView.removeMap = function () {
    let map = document.getElementById("map");
    map.remove();
    let newMapDiv = document.createElement("div");
    newMapDiv.id = "map";
    let section = document.querySelector("section");
    if (section) {
        section.appendChild(newMapDiv);
    } else {
        console.error("Section element not found in the DOM.");
    }
}



MapView.drawCircle = function (map, radius) {
    let circle = L.circle([45.833619, 1.261105], {
        color: 'blue',
        fillColor: '#0000FF',
        fillOpacity: 0.2,
        radius: radius
    }).addTo(map);
}
let distanceVolDoiseau = function (lat_b, lon_b) {
    // Convertion des degrés en radian
    let a = Math.PI / 180;
    let lat1 = 45.833619 * a;
    let lat2 = lat_b * a;
    let lon1 = 1.261105 * a;
    let lon2 = lon_b * a;

    let t1 = Math.sin(lat1) * Math.sin(lat2);
    let t2 = Math.cos(lat1) * Math.cos(lat2);
    let t3 = Math.cos(lon1 - lon2);
    let t4 = t2 * t3;
    let t5 = t1 + t4;
    let rad_dist = Math.atan(-t5 / Math.sqrt(-t5 * t5 + 1)) + 2 * Math.atan(1);

    return (rad_dist * 3437.74677 * 1.1508) * 1.6093470878864446;
}

MapView.filterLyceesByDistance = function (lyceesData, distLimit) {
    let result = [];
    for (let i = 0; i < lyceesData.length; i++) {
        let lycee = lyceesData[i];
        let distance = distanceVolDoiseau(lycee.latitude, lycee.longitude);
        if (distance * 1000 < distLimit) { // Convert distance to meters
            result.push({
                numero_uai: lycee.numero_uai,
                distance: distance,
                latitude: lycee.latitude,
                longitude: lycee.longitude,
                nom: lycee.nom,
            });
        }
    }
    return result;
};

MapView.loadMarkers = function (map, data) {
}

export { MapView };

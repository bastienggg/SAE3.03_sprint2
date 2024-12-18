

let MapView = {};

MapView.renderType4 = function (map, lyceesData, candidatsData) {
    const customIcon = L.icon({
        iconUrl: '../asset/lycee.png', // Chemin vers l'image de l'icône
        iconSize: [25, 25], // Taille de l'icône
        iconAnchor: [12, 41], // Point d'ancrage de l'icône
        popupAnchor: [1, -34], // Point d'ancrage du popup
        shadowUrl: null, // Pas d'ombre
    });

    var markers = L.markerClusterGroup();
    lyceesData.forEach(lycee => {
        let candidats = candidatsData.find(c => c.numero_uai === lycee.numero_uai);
        if (candidats) {
            let marker = L.marker([lycee.latitude, lycee.longitude], { icon: customIcon });
            let popupContent = `${lycee.nom} :<br>
                                Générale: ${candidats.generale} candidats,<br> 
                                STI2D: ${candidats.sti2d} candidats,<br> 
                                Autres: ${candidats.autres} candidats`;
            marker.bindPopup(popupContent);
            markers.addLayer(marker);
        }
    });

    markers.options.spiderfyOnMaxZoom = false;
    markers.options.showCoverageOnHover = false;
    markers.options.zoomToBoundsOnClick = false;

    markers.on('clusterclick', function (a) {
        let totalCandidats = { generale: 0, sti2d: 0, autres: 0 };
        a.layer.getAllChildMarkers().forEach(marker => {
            const popupContent = marker.getPopup().getContent();
            const counts = popupContent.match(/(\d+) candidats/g).map(count => parseInt(count));
            totalCandidats.generale += counts[0];
            totalCandidats.sti2d += counts[1];
            totalCandidats.autres += counts[2];
        });
        a.layer.bindPopup(`Total candidats dans le cluster:<br> 
                           Générale: ${totalCandidats.generale},<br> 
                           STI2D: ${totalCandidats.sti2d},<br> 
                           Autres: ${totalCandidats.autres}`).openPopup();
    });
    map.addLayer(markers);
}

MapView.renderType1 = function (map, data) {
    const customIcon = L.icon({
        iconUrl: '../asset/diplome.png', // Chemin vers l'image de l'icône
        iconSize: [25, 25], // Taille de l'icône
        iconAnchor: [12, 41], // Point d'ancrage de l'icône
        popupAnchor: [1, -34], // Point d'ancrage du popup
        shadowUrl: null, // Pas d'ombre
    });

    data.forEach(async (item) => {
        let response = await fetch(`https://api.zippopotam.us/fr/${item.codePostal}`);
        if (response.ok) {
            let locationData = await response.json();
            let place = locationData.places[0];
            let marker = L.marker([place.latitude, place.longitude], { icon: customIcon });
            let popupContent = `Code Postal: ${item.codePostal}<br>Nombre de candidats: ${item.count}`;
            marker.bindPopup(popupContent);
            map.addLayer(marker);
        } else {
            console.error(`Failed to fetch data for postal code: ${item.codePostal}`);
        }
    });
}

MapView.drawCircleAroundLimoges = function (map, radius) {
    map.eachLayer(function (layer) {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });
    const limogesCoords = [45.833619, 1.261105]; // Coordonnées de Limoges
    const circle = L.circle(limogesCoords, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius
    }).addTo(map);
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
    section.appendChild(newMapDiv);
}

let distanceVolDoiseau = function (lat_a, lon_a, lat_b, lon_b) {
    // Convertion des degrés en radian
    let a = Math.PI / 180;
    let lat1 = lat_a * a;
    let lat2 = lat_b * a;
    let lon1 = lon_a * a;
    let lon2 = lon_b * a;

    t1 = Math.sin(lat1) * Math.sin(lat2);
    t2 = Math.cos(lat1) * Math.cos(lat2);
    t3 = Math.cos(lon1 - lon2);
    t4 = t2 * t3;
    t5 = t1 + t4;
    rad_dist = Math.atan(-t5 / Math.sqrt(-t5 * t5 + 1)) + 2 * Math.atan(1);


    return (rad_dist * 3437.74677 * 1.1508) * 1.6093470878864446;
}




export { MapView };
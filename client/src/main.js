import { HeaderView } from "./ui/header/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import { ChartView } from "./ui/chart/index.js"
import './index.css';

import L from "leaflet";
import 'leaflet.markercluster';

import 'leaflet/dist/leaflet.css';

import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';




let C = {};

C.init = async function () {
    V.init();
    // console.log(Candidats.getAll());
    // console.log(Lycees.getAll());

    // console.log(Candidats.getLastLycees());
    // console.log(Lycees.getLycee("0240035H"));
    console.log(Candidats.getPostBac());
    console.log(Candidats.getType4());

}

let V = {
    header: document.querySelector("#header"),
    chart: document.querySelector("#chart"),
};

V.init = function () {
    V.renderHeader();
    V.renderChart();
    V.LoadMaps();
    C.sliderValue();

}

V.renderHeader = function () {
    V.header.innerHTML = HeaderView.render();
}

C.sliderValue = function () {
    let slider = document.getElementById("slider");
    slider.addEventListener("input", function () {
        V.chart.innerHTML = "";
        V.renderChart(parseInt(slider.value));
    });
}


V.renderChart = function (sliderValue) {

    let data = Candidats.getPostBac();
    let data2 = Candidats.getType4();
    let combinedData = data.map(item => {
        let match = data2.find(d => d.codePostal === item.codePostal);
        return {
            codePostal: item.codePostal.slice(0, -3), // Remove the last 3 characters
            count: item.count,
            generale: match ? match.generale : 0,
            sti2d: match ? match.sti2d : 0,
            autres: match ? match.autres : 0,
            total: item.count + (match ? match.generale + match.sti2d + match.autres : 0)
        };
    });

    // Group candidates into "autres" if total is less than slider value
    let groupedData = { codePostal: "Autres", count: 0, generale: 0, sti2d: 0, autres: 0, total: 0 };
    combinedData = combinedData.map(item => {
        if (item.total < sliderValue) {
            groupedData.count += item.count;
            groupedData.generale += item.generale;
            groupedData.sti2d += item.sti2d;
            groupedData.autres += item.autres;
            groupedData.total += item.total;
            return null;
        }
        return item;
    }).filter(item => item !== null);

    if (groupedData.total > 0) {
        combinedData.push(groupedData);
    }

    // Sort combinedData by total in descending order
    combinedData.sort((a, b) => b.total - a.total);



    V.innerHTML = ChartView.render(combinedData);
}

V.LoadMaps = function () {
    var map = L.map('map').setView([45.833619, 1.261105], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    V.loadMarkerTypeDiplome4(map);
    V.loadMarkerTypeDiplome1(map);

}

V.loadMarkerTypeDiplome4 = function (map) {
    let lyceesData = Lycees.getLycee(Candidats.getLastLycees());
    let candidatsData = Candidats.getLastFiliere();

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

V.loadMarkerTypeDiplome1 = function (map) {
    let data = Candidats.getPostBac();
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

C.init();
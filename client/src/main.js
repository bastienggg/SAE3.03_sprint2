import { HeaderView } from "./ui/header/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
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
    console.log(Candidats.getLastFiliere());

}

let V = {
    header: document.querySelector("#header")
};

V.init = function () {
    V.renderHeader();
    V.LoadMaps();

}

V.renderHeader = function () {
    V.header.innerHTML = HeaderView.render();
}

V.LoadMaps = function () {
    var map = L.map('map').setView([45.833619, 1.261105], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    V.loadMarkerTypeDiplome4(map);

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

C.init();
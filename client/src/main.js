import { HeaderView } from "./ui/header/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import './index.css';

import L from "leaflet";
import 'leaflet/dist/leaflet.css';


let C = {};

C.init = async function () {
    V.init();
    // console.log(Candidats.getAll());
    // console.log(Lycees.getAll());

    console.log(Candidats.getAllNumero_uai());
    // console.log(Lycees.getLycee("0240035H"));
    console.log(Lycees.getLycee(Candidats.getAllNumero_uai()));

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
    V.loadMarker(map);

}

V.loadMarker = function (map) {

    let data = Lycees.getLycee(Candidats.getAllNumero_uai());
    console.log(data);

    const customIcon = L.icon({
        iconUrl: '../asset/lycee.png', // Chemin vers l'image de l'icône
        iconSize: [25, 25], // Taille de l'icône
        iconAnchor: [12, 41], // Point d'ancrage de l'icône
        popupAnchor: [1, -34], // Point d'ancrage du popup
        shadowUrl: null, // Pas d'ombre
    });

    data.forEach(coord => {
        L.marker([coord.latitude, coord.longitude], { icon: customIcon }).addTo(map);
    });
}

C.init();

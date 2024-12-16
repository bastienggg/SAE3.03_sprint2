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

    let data = Lycees.getCoordonnees();
    console.log(data);
    data.forEach(coord => {
        L.marker([coord.latitude, coord.longitude]).addTo(map);
    });
}

C.init();

import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import { ChartView } from "./ui/chart/index.js";
import { MapView } from "./ui/map/index.js";
import './index.css';
import L, { map } from "leaflet";
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


let C = {};

C.init = async function () {
    V.init();
}

let V = {
    chart: document.querySelector("#chart"),
    optionChart: document.querySelector("#optionChart"),
    optionMap: document.querySelector("#optionMap"),
};

V.init = function () {
    V.LoadMaps("dark_all");
    C.sliderValueChart();
    C.clickOnBtnChart();
    C.clickOnBtnMap();
    C.toggleTheme();
}

C.sliderValueChart = function () {
    let slider = document.getElementById("sliderChart");
    slider.addEventListener("input", function () {
        V.chart.innerHTML = "";
        V.renderChart(parseInt(slider.value));
    });
}

C.clickOnBtnChart = function () {
    let btn = document.getElementById("showchart");
    btn.addEventListener("click", function () {
        MapView.hideMap();
        V.optionMap.style.display = "none";
        V.chart.innerHTML = "";
        V.renderChart();
        V.optionChart.style.display = "flex";
    });
}

C.clickOnBtnMap = function () {
    let btn = document.getElementById("showmap");
    btn.addEventListener("click", function () {
        V.chart.style.display = "none";
        V.optionChart.style.display = "none";
        MapView.showMap();
        V.optionMap.style.display = "flex";
    });

}

C.toggleTheme = function () {
    let checkbox = document.getElementById("toggleTheme");
    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            console.log("light");
            MapView.removeMap();
            V.LoadMaps("light_all");
        } else {
            console.log("dark");
            MapView.removeMap();
            V.LoadMaps("dark_all");
        }
    });
}


V.renderChart = function (sliderValue) {
    V.chart.style.display = "flex";
    V.innerHTML = ChartView.render(sliderValue);
}



V.LoadMaps = function (theme) {
    var map = L.map('map').setView([45.833619, 1.261105], 12);
    L.tileLayer(`https://{s}.basemaps.cartocdn.com/${theme}/{z}/{x}/{y}{r}.png`, {
        attribution: '&copy; <a href="https://www.carto.com/">Carto</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    let lyceesData = Lycees.getLycee(Candidats.getLastLycees());
    let candidatsData = Candidats.getLastFiliere();
    let data = Candidats.getPostBac();
    MapView.renderType4(map, lyceesData, candidatsData);
    MapView.renderType1(map, data);

    let slider = document.getElementById("sliderMap");
    slider.addEventListener("input", function () {
        MapView.drawCircleAroundLimoges(map, parseInt(slider.value));
    });

}

C.init();
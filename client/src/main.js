import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import { ChartView } from "./ui/chart/index.js";
import { MapView } from "./ui/map/index.js";
import './index.css';
import L from "leaflet";
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
    distance: document.querySelector("#distance"),
    reset: document.querySelector("#resetcercle")
};

V.init = function () {
    console.log(Candidats.getLastFiliere());
    V.loadMaps("dark_all");
    C.sliderValueChart();
    C.clickOnBtnChart();
    C.clickOnBtnMap();
    C.toggleTheme();
    C.sliderValueMap("dark_all");
    C.clickOnResetMap("dark_all");
    V.loadMarkers(V.mapInstance);
    V.loadAllMarkers(V.mapInstance);


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
        V.reset.style.display = "none";
        V.chart.innerHTML = "";
        V.distance.innerHTML = "";
        V.renderChart();
        V.optionChart.style.display = "flex";
    });
}

C.clickOnResetMap = function (theme) {
    let btn = document.getElementById("resetcercle");
    btn.addEventListener("click", function () {
        MapView.removeMap();
        V.loadMaps(theme);
        C.sliderValueMap(theme);
        V.loadMarkers(V.mapInstance);
    });
}

C.clickOnBtnMap = function () {
    let btn = document.getElementById("showmap");
    btn.addEventListener("click", function () {
        V.chart.style.display = "none";
        V.optionChart.style.display = "none";
        MapView.showMap();
        V.optionMap.style.display = "flex";
        V.reset.style.display = "flex";
    });
}

C.toggleTheme = function () {
    let checkbox = document.getElementById("toggleTheme");
    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            console.log("light");
            MapView.removeMap();
            V.loadMaps("light_all");
            C.sliderValueMap("light_all");
            C.clickOnResetMap("light_all");
        } else {
            console.log("dark");
            MapView.removeMap();
            V.loadMaps("dark_all");
            C.sliderValueMap("dark_all");
            C.clickOnResetMap("dark_all");
        }
    });
}

C.clickOnAll = function (map) {
    let btn = document.getElementById("all");
    btn.addEventListener("click", function () {
        V.loadAllMarkers(map);
    });
}

V.loadAllMarkers = function (map) {
    let data = Candidats.getLastFiliere();
    let lyceesData = Lycees.getLycee(Candidats.getLastLycees());
    MapView.renderType4(map, lyceesData, data);
    let postBacData = Candidats.getPostBac();
    MapView.renderType1(map, postBacData);
}

V.renderChart = function (sliderValue) {
    V.chart.style.display = "flex";
    V.innerHTML = ChartView.render(sliderValue);
}

C.sliderValueMap = function (theme) {
    let slider = document.getElementById("sliderMap");
    slider.addEventListener("input", function () {
        MapView.removeMap();
        var map = L.map('map', { maxZoom: 19 }).setView([45.833619, 1.261105], 5);
        L.tileLayer(`https://{s}.basemaps.cartocdn.com/${theme}/{z}/{x}/{y}{r}.png`, {
            attribution: '&copy; <a href="https://www.carto.com/">Carto</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        let lyceesData = MapView.filterLyceesByDistance(Lycees.getLycee(Candidats.getLastLycees()), parseInt(slider.value));
        let candidatsData = Candidats.getLastFiliere();
        MapView.renderType4(map, lyceesData, candidatsData);
        MapView.drawCircle(map, parseInt(slider.value));
        document.getElementById("distance").innerText = slider.value / 1000 + " km";
        let checkboxes = ["postbacs", "Générale", "STI2D", "autres"];
        checkboxes.forEach(function (id) {
            document.getElementById(id).checked = false;
        });
    });
}

V.loadMaps = function (theme) {
    // Check if a map instance already exists and remove it
    if (V.mapInstance) {
        V.mapInstance.off();
        V.mapInstance.remove();
    }

    var map = L.map('map').setView([45.833619, 1.261105], 12);
    L.tileLayer(`https://{s}.basemaps.cartocdn.com/${theme}/{z}/{x}/{y}{r}.png`, {
        attribution: '&copy; <a href="https://www.carto.com/">Carto</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    V.mapInstance = map; // Store the map instance

    V.loadMarkers(map);
    C.clickOnAll(map, theme);

    let checkboxes = ["all", "postbacs", "Générale", "STI2D", "autres"];
    checkboxes.forEach(function (id) {
        let checkbox = document.getElementById(id);
        checkbox.addEventListener("change", function () {
            if (checkbox.checked) {
                checkboxes.forEach(function (otherId) {
                    if (otherId !== id) {
                        document.getElementById(otherId).checked = false;
                    }
                });
                V.loadMaps(theme); // Reload the map with the selected theme
            }
        });
    });
}

V.loadMarkers = function (map) {
    let lyceesData = Lycees.getLycee(Candidats.getLastLycees());

    let postBacs = document.getElementById("postbacs").checked;
    let generale = document.getElementById("Générale").checked;
    let sti2d = document.getElementById("STI2D").checked;
    let autres = document.getElementById("autres").checked;

    let combinedData = [];

    if (postBacs) {
        let postBacData = Candidats.getPostBac();
        MapView.renderType1(map, postBacData);
        return; // Exit the function after rendering postBacData
    }

    if (generale) {
        let generaleData = Candidats.getByFiliere("Générale");
        combinedData = combinedData.concat(generaleData);
    }
    if (sti2d) {
        let sti2dData = Candidats.getByFiliere("STI2D");
        combinedData = combinedData.concat(sti2dData);
    }
    if (autres) {
        let autresData = Candidats.getByFiliere("autres");
        combinedData = combinedData.concat(autresData);
    }

    MapView.renderType4(map, lyceesData, combinedData);
}

C.init();

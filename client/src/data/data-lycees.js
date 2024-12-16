

let data = await fetch("./src/data/json/lycees.json");
data = await data.json();

let Lycees = {}

Lycees.getAll = function () {
    return data;
}

Lycees.getCoordonnees = function () {
    return data.slice(1).map(lycee => ({ // slice(1) pour enlever la première ligne qui contient les noms des colonnes
        latitude: lycee.latitude,
        longitude: lycee.longitude
    }));
}

export { Lycees };
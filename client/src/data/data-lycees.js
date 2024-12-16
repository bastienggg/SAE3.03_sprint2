let dataL = await fetch("./src/data/json/lycees.json");
dataL = await dataL.json();


let Lycees = {}

Lycees.getAll = function () {
    return dataL;
}

Lycees.allgetCoordonnees = function () {
    return dataL.slice(1).map(lycee => ({ // slice(1) pour enlever la première ligne qui contient les noms des colonnes
        latitude: lycee.latitude,
        longitude: lycee.longitude
    }));
}


Lycees.getLycee = function (numerosUAI) {
    return numerosUAI.map(numeroUAI => {
        const lycee = dataL.find(lycee => lycee.numero_uai === numeroUAI);
        return lycee ? { latitude: lycee.latitude, longitude: lycee.longitude } : null;
    }).filter(coordonnees => coordonnees !== null);
}




export { Lycees };
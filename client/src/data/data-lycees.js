let dataL = await fetch("./src/data/json/lycees.json");
dataL = await dataL.json();


let Lycees = {}

Lycees.getAll = function () {
    return dataL;
}

Lycees.getAllTrieNumeroUAI = function () { // retourne le tableau indexé mpar numéro UAI
    return dataL.slice(1).sort((a, b) => a.numero_uai.localeCompare(b.numero_uai));
};


Lycees.getLycee = function (numerosUAI) { // recherche dicotomique dans le tableau des lycées indexé par les numéro uai 
    const uniqueCoordinates = new Set();
    const sortedLycees = Lycees.getAllTrieNumeroUAI();

    function binarySearch(numeroUAI) {
        let left = 0;
        let right = sortedLycees.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const comparison = sortedLycees[mid].numero_uai.localeCompare(numeroUAI); // localeCompare retourne 0 si les deux chaînes sont égales, < 0 si la chaîne est avant la chaîne de comparaison, > 0 si la chaîne est après la chaîne de comparaison
            if (comparison === 0) {
                return sortedLycees[mid];
            } else if (comparison < 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return null; // si le numéro UAI n'est pas trouvé
    }
    return numerosUAI.map(numeroUAI => { // map retourne un nouveau tableau avec les éléments transformés par la fonction passée en argument
        const lycee = binarySearch(numeroUAI);
        const count = numerosUAI.filter(uai => uai === numeroUAI).length;
        if (lycee) {
            const coordKey = `${lycee.latitude},${lycee.longitude}`;
            if (!uniqueCoordinates.has(coordKey)) {
                uniqueCoordinates.add(coordKey);
                return { numero_uai: lycee.numero_uai, latitude: lycee.latitude, longitude: lycee.longitude, nom: lycee.appellation_officielle, count: count };
            }
        }
        return null;
    }).filter(coordonnees => coordonnees !== null);
}

export { Lycees };
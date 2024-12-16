

let dataC = await fetch("./src/data/json/candidatures.json");
dataC = await dataC.json();

let Candidats = {}

Candidats.getAll = function () {
    return dataC;
}
Candidats.getAllNumero_uai = function () {
    return [...new Set(dataC.map(candidat => candidat.Scolarite.map(scolarite => scolarite.UAIEtablissementorigine)).flat().filter(uai => uai !== undefined))];
}

export { Candidats };
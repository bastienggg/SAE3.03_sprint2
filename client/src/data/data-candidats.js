

let dataC = await fetch("./src/data/json/candidatures.json");
dataC = await dataC.json();

let Candidats = {}

Candidats.getAll = function () {
    return dataC;
}

Candidats.getAllNumero_uai = function () {
    return [...new Set(dataC.map(candidat => candidat.Scolarite.map(scolarite => scolarite.UAIEtablissementorigine)).flat().filter(uai => uai !== undefined))];
}

Candidats.getLastLycees = function () {
    return dataC
        .filter(candidat => candidat.Baccalaureat.TypeDiplomeCode === 4 && candidat.Scolarite.length > 0)
        .map(candidat => {
            const lastScolarite = candidat.Scolarite.reduce((last, current) => {
                return new Date(current.AnneeScolaireLibelle.split('-')[0]) > new Date(last.AnneeScolaireLibelle.split('-')[0]) ? current : last;
            }, candidat.Scolarite[0]);
            return lastScolarite ? lastScolarite.UAIEtablissementorigine : undefined;
        })
}

export { Candidats };
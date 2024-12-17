

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

Candidats.getLastFiliere = function () {
    const groupedByUai = {};

    dataC
        .filter(candidat => candidat.Baccalaureat.TypeDiplomeCode === 4 && candidat.Scolarite.length > 0)
        .forEach(candidat => {
            const lastScolarite = candidat.Scolarite.reduce((last, current) => {
                return new Date(current.AnneeScolaireLibelle.split('-')[0]) > new Date(last.AnneeScolaireLibelle.split('-')[0]) ? current : last;
            }, candidat.Scolarite[0]);
            let filiere = candidat.Baccalaureat.SerieDiplomeCode;
            if (filiere !== 'Générale' && filiere !== 'STI2D') {
                filiere = 'autres';
            } else if (filiere === 'Générale') {
                filiere = 'generale';
            } else if (filiere === 'STI2D') {
                filiere = 'sti2d';
            }
            const uai = lastScolarite ? lastScolarite.UAIEtablissementorigine : undefined;
            if (uai) {
                if (!groupedByUai[uai]) {
                    groupedByUai[uai] = { numero_uai: uai, generale: 0, sti2d: 0, autres: 0 };
                }
                groupedByUai[uai][filiere.toLowerCase()]++;
            }
        });

    return Object.values(groupedByUai);
}

export { Candidats };
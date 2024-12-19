let dataC = await fetch("./src/data/json/candidatures.json");
dataC = await dataC.json();

let Candidats = {}

Candidats.getAll = function () {
    return dataC;
}

Candidats.getAllNumero_uai = function () { // retourne le tableau indexé par numéro UAI
    const uaiSet = new Set(); // Set pour éviter les doublons
    for (let i = 0; i < dataC.length; i++) {
        const candidat = dataC[i];
        for (let j = 0; j < candidat.Scolarite.length; j++) {
            const scolarite = candidat.Scolarite[j];
            if (scolarite.UAIEtablissementorigine !== undefined) {
                uaiSet.add(scolarite.UAIEtablissementorigine);
            }
        }
    }
    return [...uaiSet];
}

Candidats.getLastLycees = function () { // retourne le dernier lycée fréquenté par les candidats
    return dataC
        .filter(candidat => candidat.Baccalaureat.TypeDiplomeCode === 4 && candidat.Scolarite.length > 0)
        .map(candidat => {
            let lastScolarite = candidat.Scolarite[0];
            for (let i = 1; i < candidat.Scolarite.length; i++) {
                const current = candidat.Scolarite[i];
                if (new Date(current.AnneeScolaireLibelle.split('-')[0]) > new Date(lastScolarite.AnneeScolaireLibelle.split('-')[0])) {
                    lastScolarite = current;
                }
            }
            return lastScolarite ? lastScolarite.UAIEtablissementorigine : undefined;
        });
}

Candidats.getLastFiliere = function () { // retourne le nombre de candidats par filière
    const groupedByUai = {};

    const filteredData = dataC.filter(candidat => candidat.Baccalaureat.TypeDiplomeCode === 4 && candidat.Scolarite.length > 0);
    for (let i = 0; i < filteredData.length; i++) {
        const candidat = filteredData[i];
        let lastScolarite = candidat.Scolarite[0];
        for (let j = 1; j < candidat.Scolarite.length; j++) {
            const current = candidat.Scolarite[j];
            if (new Date(current.AnneeScolaireLibelle.split('-')[0]) > new Date(lastScolarite.AnneeScolaireLibelle.split('-')[0])) {
                lastScolarite = current;
            }
        }
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
    }

    return Object.values(groupedByUai);
}

Candidats.getPostBac = function () { // retourne le nombre de candidats par code postal
    const postBacCodes = dataC
        .filter(candidat => candidat.Baccalaureat.TypeDiplomeCode === 1)
        .map(candidat => {
            let lastScolarite = candidat.Scolarite[0];
            for (let i = 1; i < candidat.Scolarite.length; i++) {
                const current = candidat.Scolarite[i];
                if (new Date(current.AnneeScolaireLibelle.split('-')[0]) > new Date(lastScolarite.AnneeScolaireLibelle.split('-')[0])) {
                    lastScolarite = current;
                }
            }
            if (lastScolarite && lastScolarite.CommuneEtablissementOrigineCodePostal) {
                const codePostal = lastScolarite.CommuneEtablissementOrigineCodePostal;
                return codePostal.substring(0, 2) + '000';
            }
            return undefined;
        })
        .filter(codePostal => codePostal !== undefined);

    const codePostalCounts = {};
    for (let i = 0; i < postBacCodes.length; i++) {
        const codePostal = postBacCodes[i];
        if (!codePostalCounts[codePostal]) {
            codePostalCounts[codePostal] = { codePostal: codePostal, count: 0 };
        }
        codePostalCounts[codePostal].count++;
    }

    return Object.values(codePostalCounts);
}

Candidats.getType4 = function () { // retourne le nombre de candidats par code postal et par filière
    const postBacCodes = dataC
        .filter(candidat => candidat.Baccalaureat.TypeDiplomeCode === 4)
        .map(candidat => {
            let lastScolarite = candidat.Scolarite[0];
            for (let i = 1; i < candidat.Scolarite.length; i++) {
                const current = candidat.Scolarite[i];
                if (new Date(current.AnneeScolaireLibelle.split('-')[0]) > new Date(lastScolarite.AnneeScolaireLibelle.split('-')[0])) {
                    lastScolarite = current;
                }
            }
            if (lastScolarite && lastScolarite.CommuneEtablissementOrigineCodePostal) {
                const codePostal = lastScolarite.CommuneEtablissementOrigineCodePostal;
                let filiere = candidat.Baccalaureat.SerieDiplomeCode;
                if (filiere !== 'Générale' && filiere !== 'STI2D') {
                    filiere = 'autres';
                } else if (filiere === 'Générale') {
                    filiere = 'generale';
                } else if (filiere === 'STI2D') {
                    filiere = 'sti2d';
                }
                return {
                    codePostal: codePostal.substring(0, 2) + '000',
                    filiere: filiere
                };
            }
            return undefined;
        })
        .filter(item => item !== undefined);

    const codePostalCounts = {};
    for (let i = 0; i < postBacCodes.length; i++) {
        const item = postBacCodes[i];
        if (!codePostalCounts[item.codePostal]) {
            codePostalCounts[item.codePostal] = { codePostal: item.codePostal, generale: 0, sti2d: 0, autres: 0 };
        }
        codePostalCounts[item.codePostal][item.filiere]++;
    }

    return Object.values(codePostalCounts);
}

export { Candidats };
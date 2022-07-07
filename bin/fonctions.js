const { default: fetch } = require("node-fetch");
const { donneesApy } = require("../model/schema");
const math = require("mathjs")

mongoose = require("mongoose");

let id_base_donnees = "62c700c6f37c5e226eef6cff";


async function obtenirApyBeefy() {
    let response = await fetch("https://api.beefy.finance/apy");
    let apy_non_traite =  await response.json();
    let apys = [];

    for (let apy in apy_non_traite){
        apys.push([apy.split("-"), [apy_non_traite[apy]]]); // sépare les données du fichier json en trois colonnes: le nom de la plateforme, le pool de liquidité et le rendement.
    }
    apys = apys.map( x=>{return x[0].concat(x[1])});
    apys = apys.map(x=>{
        // rajoute un tiret entre les noms de coins des pools de liquidité, pour plus de lisibilité
        if (x.length == 4){
            x[1] += '-'+x[2];
            x.splice(2, 1)
        } else {
           for(let i = 1; i<x.length-1; i++){
            x[1] += ('-'+x[i])
           }
           x.splice(2, x.length-1)
    }
        x[x.length-1] *= 100
        return x
    })
    apys = apys.filter(x=> {return (x.length>2 && x[x.length-1]>0)}); //supprime les pools avec un rendement nul

    
    return apys
}

async function obtenirTVLBeefy(tab){
    
    response = await fetch("https://api.beefy.finance/tvl");
    listeTVL = await response.json();
    listeTVL = Object.values(listeTVL);

    for(let i=0; i<tab.length; i++){
        vault = tab[i][0]+"-"+tab[i][1]; // On récupère la clé de l'objet permettant d'obtenir la TVL d'un pool en réassemblant les données initiales
        for(let j=0; j<listeTVL.length; j++){
            if (listeTVL[j][vault] != undefined) {
                tab[i].push(listeTVL[j][vault])
            }
        }
    }

    
    return tab.filter(x=>{return x[3]>500000}) // Supprime les vaults avec moins de 500000 de TVL

}


async function genererApy() {
    let apy = await obtenirApyBeefy();
    let tableau = await obtenirTVLBeefy(apy);
    let dict_historique = {}
    for(let k=0; k<tableau.length; k++){
        let cle = tableau[k][0]+'-'+tableau[k][1];
        dict_historique[cle]={"APY":[tableau[k][2]], "TVL": [tableau[k][3]]}
    }
    const tableau_enregistre = new donneesApy({APY: dict_historique});
    console.log(dict_historique);
    tableau_enregistre.save()

}

async function updateApy(){
    let apy = await obtenirApyBeefy();
    let tableau = await obtenirTVLBeefy(apy);
    let tableau_actuel = await donneesApy.findById(id_base_donnees).exec();
    let dict_historique = {};
    console.log(tableau_actuel.APY);

    for(let k=0; k<tableau.length; k++){
        let cle = tableau[k][0]+'-'+tableau[k][1];
        dict_historique[cle]={"APY":[tableau[k][2]], "TVL": [tableau[k][3]]}
        if (tableau_actuel.APY[cle]==undefined){   // Vérifie que Beefy ne contient pas de nouveaux vaults, et, si oui, les rajoute.
            tableau_actuel.APY[cle] = {"APY":[tableau[k][2]], "TVL": [tableau[k][3]]}
        }
    }
    

    for (let k in tableau_actuel.APY){
        let dict = tableau_actuel.APY[k];

        dict.Score = calculerScore(dict.APY, dict.TVL, 90);
        
        if (dict == undefined || dict_historique[k] == undefined){
            continue
        }

        dict.APY.push(dict_historique[k].APY[0]);
        dict.TVL.push(dict_historique[k].TVL[0]);

    }


    donneesApy.findByIdAndUpdate(id_base_donnees, tableau_actuel, function(err, docs){
        console.log(docs.APY);
        console.log("Base de données mise à jour")
    })
}

function moyenne_inverse(tab, nombre_jour){
    let somme = 0; 
    let intervalle = tab.length-nombre_jour;
    for(let i=tab.length-1; i>intervalle; i--){
        somme+=tab[i]
    }
    let moyenne = somme/nombre_jour;

    return moyenne
}

function calculerScore(tab1, tab2, nombre_jour){

    if( tab1.length < nombre_jour || tab2.length < nombre_jour){
        return "Données insuffisantes"
    }

    let moyenneApy = moyenne_inverse(tab1, nombre_jour);
    let moyenneTvl = moyenne_inverse(tab2, nombre_jour);

    let sum2 = 0;

    for(let i=tab1.length-1; i>tab1.length-nombre_jour; i--){
        sum2+=math.pow(tab1[i]-moyenneApy, 2)
    }
   let std = math.sqrt(sum2/nombre_jour);
   let Score = moyenneApy/std*moyenneTvl/1000000;
   
   return Score 
}

async function envoyerTableauScore(){
    let tableau_actuel = await donneesApy.findById(id_base_donnees).exec()
    let tableau_score = {};
    
    for (let k in tableau_actuel.APY){
        tableau_score[k] = tableau_actuel.APY[k].Score
    }
    return tableau_score
}

module.exports = {"getApy": obtenirApyBeefy, "getTVL" : obtenirTVLBeefy, "generateApy":genererApy, "updateApy":updateApy, "moyenne_inverse": moyenne_inverse, "calculerScore" : calculerScore, "envoyerTableauScore": envoyerTableauScore}
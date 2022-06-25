async function obtenirApyBeefy() {
    let response = await fetch("https://api.beefy.finance/apy");
    let apy_non_traite =  await response.json();
    let apys = [];

    for (let apy in apy_non_traite){
        apys.push([apy.split("-"), [apy_non_traite[apy]]]);
    }
    apys = apys.map( x=>{return x[0].concat(x[1])});
    console.log(apys);
    apys = apys.map(x=>{
        if (x.length == 4){
            x[1] += '-'+x[2];
            x.splice(2, 1)
        } else {
           for(let i = 1; i<x.length-1; i++){
            x[1] += ('-'+x[i])
           }
           x.splice(2, x.length-1)
    }
        x[x.length-1] = x[x.length-1]*100
        return x
    })
    apys = apys.filter(x=> {return (x.length>2 && x[x.length-1]>0)}); //supprime les pools avec un rendement nul

    console.log(apys)
    
    return apys
}

async function obtenirTVLBeefy(tab){
    
    response = await fetch("https://api.beefy.finance/tvl");
    listeTVL = await response.json();
    listeTVL = Object.values(listeTVL);

    for(let i=0; i<tab.length; i++){
        vault = tab[i][0]+"-"+tab[i][1];
        for(let j=0; j<listeTVL.length; j++){
            if (listeTVL[j][vault] != undefined) {
                tab[i].push(listeTVL[j][vault])
            }
        }
    }


    console.log("La fonction TVL Beefy retourne:", tab);
    
    return tab.filter(x=>{return x[3]>0})

}

function estRendement(i, j, table){ 
// vérifie si la cellule à l'indice j est à la colonne rendement, pour la convetir en pourcentage
    
    if (j==2){
        return table[i][j] + "%"
    } else {
        return table[i][j]
    }}




function genererTableau(table) {
    
    let tbody = document.querySelector("tbody");
    

    for(let i=0; i<table.length; i++) { 


        let ligne =  document.createElement("tr");
        
        for(let j = 0; j<table[i].length; j++) {

            let cellule = document.createElement("td");
            cellule.textContent = estRendement(i, j, table)

            ligne.appendChild(cellule);
            

       }
       tbody.appendChild(ligne);
    
    }
    
}



obtenirApyBeefy()
    .then(obtenirTVLBeefy)
    .then(genererTableau)
    



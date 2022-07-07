function trierTableau(e, table){
    function sensDuTri(){
        if(e.target.className==="croissant"){
            e.target.setAttribute("class", "decroissant")
            return -1 
        }
        e.target.setAttribute("class", "croissant") 
        return 1
    }
    
    let sens = sensDuTri();
    let colonne = e.target.id;
    table = table.sort(function(a,b){
        if(a[colonne]>b[colonne]){
            return sens
        }else if(a[colonne]==b[colonne]){
            return 0
        }else{
            return -sens
        }
    });

    document.querySelector("tbody").innerHTML=""; //Supprime le tableau existant pour le remplacer ensuite par celui trié.
    
    genererTableau(table);
}

function ajouterBouttonEvent(table){
    let i = 0;
    for(let button of document.querySelectorAll("button")){
        button.addEventListener("click", function(e){trierTableau(e, table)});
        button.setAttribute("id", i);
        i+=1;
    }
}

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

async function obtenirTvlEtScore(tab){
    
    response = await fetch("https://api.beefy.finance/tvl");
    listeTVL = await response.json();
    listeTVL = Object.values(listeTVL);
    listeScore = await fetch("http://localhost:3000/score");
    listeScore = await listeScore.json();

    console.log(listeScore);

    for(let i=0; i<tab.length; i++){
        vault = tab[i][0]+"-"+tab[i][1]; // On récupère la clé de l'objet permettant d'obtenir la TVL d'un pool en réassemblant les données initiales
        for(let j=0; j<listeTVL.length; j++){
            if (listeTVL[j][vault] != undefined) {
                tab[i].push(listeTVL[j][vault])
                tab[i].push(listeScore[vault])
            }
        }
    }



    
    return tab.filter(x=>{return x[3]>500000})

}

function formater(i, j, table){ 
// vérifie le numéro de colonne et applique le formatage adéquat
    let cellule = table[i][j];
    if (j==2){
        return cellule.toFixed(2) + "%" // Pourcentage
    } else if(j==3){ // Séparateur de millier
        cellule=String(Math.round(cellule));
        l = cellule.length;
        cellule = cellule.split("");
        for(let k=l-3; k>0; k-=3){
           cellule.splice(k,0," ");
        }
        return cellule.join("")
        
    } else { // Non formaté
        return cellule
    }
}




function genererTableau(table) {
    
    let tbody = document.querySelector("tbody");
    

    for(let i=0; i<table.length; i++) { 


        let ligne =  document.createElement("tr");
        
        for(let j = 0; j<table[i].length; j++) {

            let cellule = document.createElement("td");
            cellule.textContent = formater(i, j, table);

            ligne.appendChild(cellule);
            

       }
       tbody.appendChild(ligne);
    
    }
    return table
}



obtenirApyBeefy()
    .then(obtenirTvlEtScore)
    .then(genererTableau)
    .then(ajouterBouttonEvent)
    





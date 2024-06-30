// Importing required modules
import fetch from 'node-fetch';
import { donneesApy } from '../model/schema.js';
import * as math from 'mathjs';
import mongoose from 'mongoose';

// Database ID for storing APY data
const ID_BASE_DONNEES = "62c700c6f37c5e226eef6cff";

/**
 * Fetches and processes APY data from Beefy Finance API
 * @returns {Array} Processed APY data
 */
async function obtenirApyBeefy() {
    const response = await fetch("https://api.beefy.finance/apy");
    const apyNonTraite = await response.json();
    
    // Process and format APY data
    let apys = Object.entries(apyNonTraite).map(([key, value]) => {
        const [platform, ...poolParts] = key.split("-");
        const pool = poolParts.join("-");
        return [platform, pool, value * 100];
    });

    // Filter out pools with zero or negative APY
    return apys.filter(([, , apy]) => apy > 0);
}

/**
 * Fetches TVL data from Beefy Finance API and merges it with APY data
 * @param {Array} tab APY data
 * @returns {Array} Merged APY and TVL data
 */
async function obtenirTVLBeefy(tab) {
    const response = await fetch("https://api.beefy.finance/tvl");
    const listeTVL = await response.json();

    // Merge TVL data with existing APY data
    const mergedData = tab.map(([platform, pool, apy]) => {
        const vault = `${platform}-${pool}`;
        const tvl = listeTVL[vault] || 0;
        return [platform, pool, apy, tvl];
    });

    // Filter out vaults with TVL less than 500,000
    return mergedData.filter(([, , , tvl]) => tvl > 500000);
}

/**
 * Generates initial APY data and saves it to the database
 */
async function genererApy() {
    const apy = await obtenirApyBeefy();
    const tableau = await obtenirTVLBeefy(apy);
    
    const dictHistorique = tableau.reduce((acc, [platform, pool, apy, tvl]) => {
        const cle = `${platform}-${pool}`;
        acc[cle] = { APY: [apy], TVL: [tvl] };
        return acc;
    }, {});

    const tableauEnregistre = new donneesApy({ APY: dictHistorique });
    await tableauEnregistre.save();
    console.log(dictHistorique);
}

/**
 * Updates existing APY data in the database
 */
async function updateApy() {
    const apy = await obtenirApyBeefy();
    const tableau = await obtenirTVLBeefy(apy);
    const tableauActuel = await donneesApy.findById(ID_BASE_DONNEES).exec();

    // Process new data
    const dictHistorique = tableau.reduce((acc, [platform, pool, apy, tvl]) => {
        const cle = `${platform}-${pool}`;
        acc[cle] = { APY: [apy], TVL: [tvl] };
        return acc;
    }, {});

    // Update existing data and add new vaults if any
    for (const [platform, pool, apy, tvl] of tableau) {
        const cle = `${platform}-${pool}`;
        if (!tableauActuel.APY[cle]) {
            tableauActuel.APY[cle] = { APY: [], TVL: [] };
        }
        tableauActuel.APY[cle].APY.push(apy);
        tableauActuel.APY[cle].TVL.push(tvl);
        tableauActuel.APY[cle].Score = calculerScore(tableauActuel.APY[cle].APY, tableauActuel.APY[cle].TVL, 90);
    }

    // Save updated data
    await donneesApy.findByIdAndUpdate(ID_BASE_DONNEES, tableauActuel);
    console.log("Base de données mise à jour");
}

/**
 * Calculates the inverse average of the last n days
 * @param {Array} tab Data array
 * @param {Number} nombreJour Number of days to consider
 * @returns {Number} Inverse average
 */
function moyenneInverse(tab, nombreJour) {
    const recentData = tab.slice(-nombreJour);
    return recentData.reduce((sum, val) => sum + val, 0) / nombreJour;
}

/**
 * Calculates a score based on APY and TVL data
 * @param {Array} tab1 APY data
 * @param {Array} tab2 TVL data
 * @param {Number} nombreJour Number of days to consider
 * @returns {Number|String} Calculated score or "Données insuffisantes"
 */
function calculerScore(tab1, tab2, nombreJour) {
    if (tab1.length < nombreJour || tab2.length < nombreJour) {
        return "Données insuffisantes";
    }

    const moyenneApy = moyenneInverse(tab1, nombreJour);
    const moyenneTvl = moyenneInverse(tab2, nombreJour);

    const recentApy = tab1.slice(-nombreJour);
    const variance = recentApy.reduce((sum, val) => sum + Math.pow(val - moyenneApy, 2), 0) / nombreJour;
    const std = Math.sqrt(variance);

    return (moyenneApy / std) * (moyenneTvl / 1000000);
}

/**
 * Retrieves and returns the score table
 * @returns {Object} Table of scores for each vault
 */
async function envoyerTableauScore() {
    const tableauActuel = await donneesApy.findById(ID_BASE_DONNEES).exec();
    return Object.entries(tableauActuel.APY).reduce((acc, [key, value]) => {
        acc[key] = value.Score;
        return acc;
    }, {});
}

// Exporting functions for use in other modules
export {
    obtenirApyBeefy,
    obtenirTVLBeefy,
    genererApy,
    updateApy,
    moyenneInverse,
    calculerScore,
    envoyerTableauScore
};

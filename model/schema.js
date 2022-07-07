const mongoose = require('mongoose');
const { Schema } = mongoose;

let donneesApySchema = new Schema({
    APY : {type: Object, required:true},
    date: {type:Date, default: Date.now},
})


let donnesApy = mongoose.model('donnesApy', donneesApySchema);

module.exports.donneesApy = donnesApy;
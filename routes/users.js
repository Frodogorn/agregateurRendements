
var express = require('express');
const { envoyerTableauScore } = require('../bin/fonctions');
var router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let Score = await envoyerTableauScore();
  res.send(Score)
});



module.exports = router;


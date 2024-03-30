import express from 'express';
import { levenshtein } from './Levenshtein';
import { firstLoad } from './firstLoad';
import { getPage } from './nodeRetrieval';

const app = express()
const port = 3100

firstLoad();


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/pages/:page', (req, res) =>{
  res.send("demandé page "+ req.params.page)
  
  getPage(Number(req.params.page))

});


app.listen(port, () => {
  console.log(`SAE la cité des voleurs listening on port ${port}`)
})

// console.log(levenshtein("combattre", "combattez"))


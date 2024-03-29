import express from 'express';
import { levenshtein } from './Levenshtein';
import { firstLoad } from './firstLoad';

const app = express()
const port = 3100

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

firstLoad()
// console.log(levenshtein("combattre", "combattez"))


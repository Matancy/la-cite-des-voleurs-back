import express from 'express';
import { levenshtein } from './Levenshtein';

const app = express()
const port = 3100

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log(levenshtein("combattre", "combattez"))
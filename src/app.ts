import express from 'express';
import { levenshtein } from './Levenshtein';
import { firstLoad } from './firstLoad';
import { getPage } from './nodeRetrieval';
import bodyParser from 'body-parser';
import { getCharacter, insertCharacter } from './fillCharacter';
import cors from 'cors';
import { getCors } from './enums/cors';

const app = express()
const port = 3100

/* @here */
app.use(bodyParser.json());

/* @here */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  next();
})

/* @here */
app.get('/nodes/:node', async (req, res) => {
  let storyNode = await getPage(Number(req.params.node));
  res.send(storyNode);
  res.end()
});

/* @here */
app.get('/firstload', (req, res) => {
  firstLoad();
  res.end("Database built and filled")
});

/* @here */
app.post('/character', (req, res) => {
  insertCharacter(req.body)
  res.end("character inserted");
});

/* @here */
app.listen(port, () => {
  console.log(`SAE la cité des voleurs listening on port ${port}`)
})
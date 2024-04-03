import express from 'express';
import { levenshtein } from './Levenshtein';
import { firstLoad } from './firstLoad';
import { getPage } from './nodeRetrieval';
import bodyParser from 'body-parser';
import { getCharacter, insertCharacter } from './fillCharacter';
import cors from 'cors';
import { getCors, Method } from './enums/cors';

const app = express()
const port = 3100

firstLoad();

app.use(bodyParser.json());

app.get('/nodes/:node', cors(getCors(Method.GET)), async (req, res) => {
  let storyNode =  await getPage(Number(req.params.node));
  res.send(storyNode);
});

app.get('/firstload', async (req, res) => {
  firstLoad();
  res.send("Database built and filled");
});

app.post('/character', cors(getCors(Method.POST)),(req, res) => {
  insertCharacter(req.body)
  res.send("character inserted");
});


app.listen(port, () => {
  console.log(`SAE la cité des voleurs listening on port ${port}`)
})
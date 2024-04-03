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

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3100'],
  methods: ['GET', 'POST'], // Allow both GET and POST methods
  allowedHeaders: ['Content-Type']
};

firstLoad();

app.use(bodyParser.json());

app.get('/nodes/:node', cors(corsOptions), async (req, res) => {
  let storyNode =  await getPage(Number(req.params.node));
  res.send(storyNode);
});

app.get('/firstload', async (req, res) => {
  firstLoad();
  res.send("Database built and filled");
});

app.post('/character', cors(corsOptions),(req, res) => {
  insertCharacter(req.body)
  res.send("character inserted");
});


app.listen(port, () => {
  console.log(`SAE la cité des voleurs listening on port ${port}`)
})
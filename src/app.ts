import express from 'express';
import { levenshtein } from './Levenshtein';
import { firstLoad } from './firstLoad';
import { getPage } from './nodeRetrieval';
import bodyParser from 'body-parser';
import { Character } from './utils';
import { getCharacter, insertCharacter } from './fillCharacter';

const app = express()
const port = 3100

firstLoad();

app.use(bodyParser.json());

app.get('/pages/:page', async (req, res) => {
  let storyNode =  await getPage(Number(req.params.page));
  res.send(storyNode);
});

app.get('/firstload', async (req, res) => {
  firstLoad();
  res.send("Database built and filled");
});

app.get('/character/:name', async (req, res)=>{
  res.send(await getCharacter(req.params.name));
});

app.put('/character', (req, res) => {
  insertCharacter(req.body)
  res.send("character inserted");
});


app.listen(port, () => {
  console.log(`SAE la cité des voleurs listening on port ${port}`)
})
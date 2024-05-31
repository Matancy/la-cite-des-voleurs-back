import express from 'express';
import { levenshtein } from './Levenshtein';
import { firstLoad } from './firstLoad';
import { getPage } from './nodeRetrieval';
import bodyParser from 'body-parser';
import { getCharacter, insertCharacter } from './fillCharacter';
import cors from 'cors';
import { getCors } from './enums/cors';
import fs from 'fs';
import { createUser, getUser, updateUser } from './fillUser';
import { RiddleHandler } from './models/riddleHandler';


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


app.get('/images/:id', (req, res) => {
  const imagePath = `${__dirname}/assets/img/${req.params.id}.png`;

  fs.readFile(imagePath, (err, data) => {
      if (err) {
          console.error('Error reading image file:', err);
          res.status(500).send('Internal Server Error');
          return;
      }
      res.set('Content-Type', 'image/png');
      res.send(data);
  });
});

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
app.post('/user/create', async (req, res) => {
  try{
    await createUser(req.body)
    res.status(200).end("user created");
  }catch(e){
    res.status(400).end("login already exists")
  }
});

/* @here */
app.post('/user', async (req, res) => {
  try{
    let stats = await getUser(req.body)
    res.status(200).end(stats?stats:"{}")
  }catch(e){
    res.status(401).end("bad password or login");
  }
});

/* @here */
app.post('/user/update', async (req, res) => {
  try{
    await updateUser(req.body)
    res.status(200).end("user save updated")
  }catch(e){
    res.status(401).end("fuck shit damn fuck me");
  }
});

/* @here */
app.listen(port, () => {
  console.log(`SAE la cité des voleurs listening on port ${port}`)
})
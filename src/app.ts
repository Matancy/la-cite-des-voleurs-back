import express from 'express';
import { levenshtein } from './Levenshtein';
import { firstLoad } from './firstLoad';
import { getPage } from './nodeRetrieval';

const app = express()
const port = 3100


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/pages/:page', async (req, res) => {
  let storyNode =  await getPage(Number(req.params.page));
  res.send(storyNode);
});

app.get('/firstload', async (req, res) => {
  firstLoad();
  res.send("Database built and filled");
});


app.listen(port, () => {
  console.log(`SAE la cité des voleurs listening on port ${port}`)
})

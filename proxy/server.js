const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());


app.get('/proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    res.statusCode(400).send();
  }

  const result = await fetch(url);

  res.json(await result.json());
});


app.listen(7777, () => {
  console.log('Server is running');
})
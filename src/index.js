const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

app.get('/totalRecovered', async (req, res) => {
    try {
      const totalRecovered = await connection.aggregate([
        {
          $group: {
            _id: 'total',
            recovered: { $sum: '$recovered' },
          },
        },
      ]);
      res.json({ data: { _id: 'total', recovered: totalRecovered[0].recovered } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/totalActive', async (req, res) => {
    try {
      const totalActive = await connection.aggregate([
        {
          $group: {
            _id: 'total',
            active: { $sum: { $subtract: ['$infected', '$recovered'] } },
          },
        },
      ]);
      res.json({ data: { _id: 'total', active: totalActive[0].active } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/totalDeath', async (req, res) => {
    try {
      const totalDeath = await connection.aggregate([
        {
          $group: {
            _id: 'total',
            death: { $sum: '$death' },
          },
        },
      ]);
      res.json({ data: { _id: 'total', death: totalDeath[0].death } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/hotspotStates', async (req, res) => {
    try {
      const hotspotStates = await connection.aggregate([
        {
          $addFields: {
            rate: {
              $round: [
                {
                  $divide: [{ $subtract: ['$infected', '$recovered'] }, '$infected'],
                  
                },
                5,
              ],
            },
          },
        },
        {
          $match: { rate: { $gt: 0.1 } },
        },
        {
          $project: { _id: 0, state: 1, rate: 1 },
        },
      ]);
      res.json({ data: hotspotStates });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/healthyStates', async (req, res) => {
    try {
      const healthyStates = await connection.aggregate([
        {
          $addFields: {
            mortality: {
              $round: [{ $divide: ['$death', '$infected'] }, 5],
            },
          },
        },
        {
          $match: { mortality: { $lt: 0.005 } },
        },
        {
          $project: { _id: 0, state: 1, mortality: 1 },
        },
      ]);
      res.json({ data: healthyStates });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;
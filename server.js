const express = require('express');
const app = express();
const multiparty = require('multiparty');

const {MongoClient} = require('mongodb');
var uri = 'mongodb+srv://charlesbeaulieu:DE1h6fOiPa764hmJ@cluster0.ptmtvxt.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(uri);

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/', async (req, res) => {
  let form = new multiparty.Form();
  form.parse(req,  async function (err, fields, files) {
    res.send(JSON.stringify(await run(fields.bedroom[0], fields.minNight[0], fields.maxNight[0])))
  })
})

app.listen(process.env.PORT || 5000)

async function run(bedroom, minNight, maxNight) {
    try {
        const database = client.db('sample_airbnb');
        const listingsAndReviews = database.collection('listingsAndReviews');
        const query = {bedrooms: parseInt(bedroom), minimum_nights: minNight, maximum_nights: maxNight};
        return listingsAndReviews.find(query).toArray();
    }catch (e) {
      await client.close();
    }

}
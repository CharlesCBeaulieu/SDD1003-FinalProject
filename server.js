//express
const express = require('express');
const app = express();
const multiparty = require('multiparty');

//mongoDB
const { MongoClient } = require('mongodb');
var uri = 'mongodb+srv://charlesbeaulieu:DE1h6fOiPa764hmJ@cluster0.ptmtvxt.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(uri);

//listen port
app.listen(process.env.PORT || 5000)

//set expressJS view engine
app.set('view engine', 'ejs')

//Routes

//GET method route
app.get('/', (req, res) => {
  res.render('index')
})

app.get('/create', (req, res) => {
  res.render('create')
})

app.get('/delete', (req, res) => {
  res.render('delete')
})

app.get('/update', (req, res) => {
  res.render('update')
})

app.get('/read', (req, res) => {
  res.render('index')
})

//POST method route
app.post('/', async (req, res) => {
  let form = new multiparty.Form();
  form.parse(req, async function (err, fields, files) {
    res.send(JSON.stringify(await run(fields.bedroom[0], fields.minNight[0], fields.maxNight[0])))
  })
})

//function to query Bedrooms, minrooms, maxrooms
async function run(bedroom, minNight, maxNight) {
  try {
    //access database collection
    const database = client.db('sample_airbnb');
    const listingsAndReviews = database.collection('listingsAndReviews');
    //build query
    const query = { bedrooms: parseInt(bedroom), minimum_nights: minNight, maximum_nights: maxNight };
    //return query result
    return listingsAndReviews.find(query).limit(5).toArray();
  } catch (e) {
    await client.close();
  }

}
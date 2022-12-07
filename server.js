const { json } = require('express');
const express = require('express');
const app = express();
const {MongoClient} = require('mongodb');
var uri = 'mongodb+srv://charlesbeaulieu:DE1h6fOiPa764hmJ@cluster0.ptmtvxt.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(uri);

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/', (req, res) => {
// Connect to the db
   
    //run()
    console.log(req.body)
    console.log(req.params)
    //res.send(JSON.stringify(data))
    res.send("hiii")
})

app.listen(process.env.PORT || 5000)

async function run(bedroom, minNight, maxNight) {
    try {
        const database = client.db('sample_airbnb');
        const listingsAndReviews = database.collection('listingsAndReviews');

        // Query for a movie that has the title 'Back to the Future'
        const query = {bedrooms : bedroom, minimum_nights : minNight, maximum_nights: maxNight};
        const listingsAndReview = await listingsAndReviews.find(query);

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }

    return listingsAndReview
}
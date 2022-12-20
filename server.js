//express
const express = require('express');
const app = express();
const multiparty = require('multiparty');

//mongoDB
const {MongoClient} = require('mongodb');
const uri = 'mongodb+srv://charlesbeaulieu:IwFnZfmVQFow3cPW@cluster0.ptmtvxt.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(uri);

//listen port
const port = 8000
app.listen(process.env.PORT || port)
console.log("Listening to port " + port);

//set expressJS view engine
app.set('view engine', 'ejs')

//Routes
//GET method route
app.get('/', (req, res) => {
    //get the data via the chart function and send it to the client via the docs variable
    chart().then(data => {
        res.render('index', {docs: data});
    })
})

// chart request
async function chart() {
    //get the data to generate the home graph
    try {
        // client connect to database
        await client.connect();
        // select database
        const database = await client.db('sample_airbnb');
        //select collection
        const listingsAndReviews = await database.collection('listingsAndReviews');

        // aggregation that return a cursor with the frequency of the number of beds
        const data = await listingsAndReviews.aggregate([
            {
                "$group": {
                    "_id": "$beds",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {count: -1}}
        ]).toArray()
        console.log(data);
        return data
    } finally {
        await client.close();
    }
}

app.get('/read', (req, res) => {
    res.render('read')
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

// -------------------------------------------------------------------------------------------------------
// read method
app.post('/', async (req, res) => {
    // receive form inputs
    let form = new multiparty.Form();
    // send the result to client
    form.parse(req, async function (err, fields, files) {
        res.send(JSON.stringify(await read_doc(fields.bedroom[0], fields.minNight[0], fields.maxNight[0])))
    })
})

// this function query data to mongodb
async function read_doc(bedroom, minNight, maxNight) {
    try {
        await client.connect();
        // select database
        const database = await client.db('sample_airbnb');
        //select collection
        const listingsAndReviews = await database.collection('listingsAndReviews');
        //build query
        const query = {bedrooms: parseInt(bedroom), minimum_nights: minNight, maximum_nights: maxNight};
        //return query result
        return await listingsAndReviews.find(query).limit(5).toArray();
    } catch (e) {
        console.log(e)
        console.log("read error")
        await client.close();
    }
}

// -------------------------------------------------------------------------------------------------------
//delete method
app.post('/delete', async (req, res) => {
    // receive form inputs
    let form = new multiparty.Form();
    // send the result to client
    form.parse(req, async function (err, fields, files) {
        res.send(JSON.stringify(await delete_doc(fields.id[0])))
    })
})

// this function query data to mongodb and delete a document
async function delete_doc(id) {
    try {
        await client.connect();
        // select database
        const database = await client.db('sample_airbnb');
        //select collection
        const listingsAndReviews = await database.collection('listingsAndReviews');
        //build query
        let query = {_id: id}
        // find the element we delete to send it to the client for visualisation
        let result = listingsAndReviews.find(query).toArray();
        // delete the document with the matching id
        await listingsAndReviews.deleteOne(query);
        console.log(id + " have been deleted")
        return result;
    } catch (e) {
        console.log(e)
        console.log("error with delete")
        await client.close();
    }
}

// -------------------------------------------------------------------------------------------------------
// update method
app.post('/update', async (req, res) => {
    // receive form inputs
    let form = new multiparty.Form();
    // send the result to client
    form.parse(req, async function (err, fields, files) {
        res.send(JSON.stringify(await update_doc(fields.id[0], fields.field_to_update[0].toString(), fields.new_value[0])))
    })
})

// this function query data to mongodb and update a document
async function update_doc(id, field_to_update, new_value) {
    try {
        //access database collection
        await client.connect();
        // select database
        const database = await client.db('sample_airbnb');
        //select collection
        const listingsAndReviews = await database.collection('listingsAndReviews');

        //initialized filed of the update query
        let filter = {_id: id};
        let update = {};
        update[field_to_update] = new_value;

        // find the item to update for visualisation
        let result = await listingsAndReviews.find(filter).toArray()

        //update one request
        await listingsAndReviews.updateOne(filter, {
            $set: {
                //unbuild the object
                ...update
            }
        });
        //console.log(test)

        // push to result after modification and return
        result.push((await listingsAndReviews.find(filter).toArray())[0]);
        return result;

    } catch (e) {
        console.log(e)
        console.log("error update")
        await client.close();
    }
}


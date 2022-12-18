//express
const express = require('express');
const app = express();
const multiparty = require('multiparty');

//mongoDB
const { MongoClient } = require('mongodb');
var uri = 'mongodb+srv://charlesbeaulieu:DE1h6fOiPa764hmJ@cluster0.ptmtvxt.mongodb.net/?retryWrites=true&w=majority'
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

//Read method
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



//delete method
app.post('/delete', async (req, res) => {
  let form = new multiparty.Form();
  form.parse(req, async function (err, fields, files) {
    res.send(JSON.stringify(await delete_doc(fields.id[0])))
  })
})
//delete fonction with query
async function delete_doc(id) {
  try {
    //access database collection
    const database = client.db('sample_airbnb');
    const listingsAndReviews = database.collection('listingsAndReviews');

    //return query result
    console.log(id)
    let query = {_id : id }
    console.log(query)
    let result = listingsAndReviews.find(query).limit(5).toArray();
    listingsAndReviews.deleteOne(query);
    return result;
  } catch (e) {
    await client.close();
  }
}

//update method
app.post('/update', async (req, res) => {
  let form = new multiparty.Form();
  form.parse(req, async function (err, fields, files) {
    res.send(JSON.stringify(await update_doc(fields.id[0], fields.field_to_update[0].toString(), fields.new_value[0])))
  })
})
//delete fonction with query
async function update_doc(id, field_to_update, new_value) {
  try {
    //access database collection
    const database = client.db('sample_airbnb');
    const listingsAndReviews = database.collection('listingsAndReviews');

    //return query result
    console.log(id)
    console.log(field_to_update)
    console.log(new_value)

    //initilized filed of the update query
    let filter = {_id : id};
    let update = {};
    update[field_to_update] = new_value;

    let result = await listingsAndReviews.find(filter).toArray()

    //update one request
    let test = await listingsAndReviews.updateOne(filter, {
      $set: {
        //unbuild the object
        ...update
      }
    });
    //console.log(test)

    //return the result after mofification
    result.push((await listingsAndReviews.find(filter).toArray())[0]);
    console.log(result)
    return result;

  } catch (e) {
    console.log(e)
    await client.close();
  }
}

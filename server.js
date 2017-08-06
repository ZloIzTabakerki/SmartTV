const express = require('express'),
      bodyParser = require('body-parser'),
      fs = require('fs'),
      channelsList = require('./db/channels.json'),

      app = express(),

      port = process.env.PORT || 3000,
      statesPath = __dirname + '/db/states.json'; // < --- RENAME !
      watchlistPath = __dirname + '/db/watchlist.json';


//middlewares

app.use(bodyParser.json());
app.use('/assets', express.static('./assets'));
app.set('view engine', 'jade');

// console.log(watchList);

// function for updating DB

function updateDB(req) {
  
  function writeDBData(data) {
    fs.writeFile(statesPath, data, (err) => {
      if (err) {
        console.log(err);
      }      
    });
  }

  let states = require('./db/states.json');

  Object.assign(states, req.body);

  states = JSON.stringify(states);

  writeDBData(states);
}

// "/" callback

function sendDBIndexData(res) {
  
  fs.readFile(statesPath, (err, data) => {

    if (err) {
      console.log(err);
    }

    data = JSON.parse(data.toString('utf8'));
    res.render('index', data);
  });

}


// ============
//    ROUTES
// ============

// index page

app.get('/', (req, res) => {
  sendDBIndexData(res);
});

//changing state handling

app.post('/update-state', (req, res) => {

  updateDB(req);

  res.end();

});

app.get('/channels', (req, res) => {

  res.json(channelsList);

});

// watchlist api

app.get('/watchlist', (req, res) => {

  fs.readFile(watchlistPath, (err, data) => {

    if (err) {
      return console.log(err);
    }

    data = JSON.parse(data.toString('utf8'));
    if (Object.keys(req.query).length === 0){
        res.send(data);
    } else {
        res.send(data[req.query.id]);
    }

  });

});

app.post('/watchlist/new', (req, res) => {

  console.log(Object.keys(req.query).length);

  if (Object.keys(req.query).length === 0 || Object.keys(req.query).length > 1){
    res.sendStatus(400);
  } else {
    fs.readFile(watchlistPath, (err, data) => {

      if (err) {
        return console.log(err);
      }

      data = JSON.parse(data.toString('utf8'));

      if (!data[req.query.id]){

      data[req.query.id] = req.body;
      data = JSON.stringify(data);

      fs.writeFile(watchlistPath, data, 'utf8', function(err) {
      if(err) {
        return console.log(err);
      }
      }); 

      res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }

    });

  }

});

app.put('/watchlist/', (req, res) => {

  if (Object.keys(req.query).length === 0 || Object.keys(req.query).length > 1){
    res.sendStatus(400);
  } else {
    fs.readFile(watchlistPath, (err, data) => {

      if (err) {
        return console.log(err);
      }

      data = JSON.parse(data.toString('utf8'));

      if (data[req.query.id]){

      data[req.query.id] = req.body;
      data = JSON.stringify(data);

      fs.writeFile(watchlistPath, data, 'utf8', function(err) {
      if(err) {
        return console.log(err);
      }
      }); 

      res.sendStatus(200);
      
      } else {

        res.sendStatus(400);

      }

    });

  }

});

app.delete('/watchlist/', (req, res) => {

    if (Object.keys(req.query).length === 0 || Object.keys(req.query).length > 1){

      res.sendStatus(400);

    } else {

      fs.readFile(watchlistPath, (err, data) => {

        if (err) {
          console.log(err);
        }

        data = JSON.parse(data.toString('utf8'));

        if (data[req.query.id]){

        delete data[req.query.id];
        data = JSON.stringify(data);

        fs.writeFile(watchlistPath, data, 'utf8', function(err) {
          if(err) {
            return console.log(err);
          }
        }); 

        res.sendStatus(200);

        } else {
          res.sendStatus(400);
        }

      });

    }

});

// app.get('/watchlist/new', (req, res) => {


// });

// app.get('/watchlist/edit', (req, res) => {

// });

//________________________________________

app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
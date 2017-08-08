const express = require('express'),
      bodyParser = require('body-parser'),

      fs = require('fs'),
      channelsList = require('./db/channels.json'),

      app = express(),

      port = process.env.PORT || 3000,
      statesPath = __dirname + '/db/states.json';
      watchlistPath = __dirname + '/db/watchlist.json';

let watchList = require('./db/watchlist.json');


//middleware functions

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/assets', express.static('./assets'));
app.set('view engine', 'jade');


function writeData(path, data) {
    fs.writeFile(path, JSON.stringify(data), (err) => {
      if (err) {
        console.log(err);
      }      
    });
}


// ============
//    ROUTES
// ============

// index page

app.get('/', (req, res) => {

    let states = require(statesPath);
    res.render('index', states);

});



//handling state changes
app.post('/update-state', (req, res) => {

  let states = require('./db/states.json');

  Object.assign(states, req.body);

  writeData(statesPath, states);

  res.sendStatus(200);

});

app.get('/channels', (req, res) => {

  res.send(channelsList);

});

// watchlist api

app.get('/watchlist', (req, res) => {

      res.send(watchList);

});

app.get('/watchlist/:id', function(req, res) {

    if (typeof watchList[req.params.id] === 'undefined') {
      res.sendStatus(404);
      return;
    } else {
      res.send(watchList[req.params.id]);     
    }
});

app.post('/watchlist/new', (req, res) => {

  if (req.body.name === undefined || req.body.channelId === undefined || req.body.time === undefined){
    res.sendStatus(400);
    return;
  }

  let ndata = {};
  ndata.name = req.body.name;
  ndata.channelId = req.body.channelId;
  ndata.time = req.body.time;


  watchList.push(ndata);

  //sorting watchlist by Date
  watchList.sort(function(a,b){
    return new Date(a.time) > new Date(b.time) ? 1 : -1; 
  });

  writeData(watchlistPath, watchList);

  res.sendStatus(200);

});

app.put('/watchlist/:id', (req, res) => {

      if (typeof watchList[req.params.id] === 'undefined') {
        res.sendStatus(404);
        return;
      } else {

      let ndata = watchList[req.params.id];
      Object.assign(ndata, req.body);

      watchList[req.params.id] = ndata;

        watchList.sort(function(a,b){
          return new Date(a.time) > new Date(b.time) ? 1 : -1;
        });

      writeData(watchlistPath, watchList);

      res.sendStatus(200);
    }
      
});
  

app.delete('/watchlist/:id', (req, res) => {

      if (typeof watchList[req.params.id] === 'undefined') {

        res.sendStatus(404);
        return;

      } else {

      watchList.splice(req.params.id, 1);

      writeData(watchlistPath, watchList);

      res.sendStatus(200);
    }

});


app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
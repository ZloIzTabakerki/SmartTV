'use strict';

const express = require('express'),
      bodyParser = require('body-parser'),
      fs = require('fs'),

      app = express(),
      
      statesPath = __dirname + '/db/states.json',
      watchlistPath = __dirname + '/db/watchlist.json',
      
      channelsList = require('./db/channels.json'),

      port = process.env.PORT || 3000;

let states = require('./db/states.json');
let watchList = require('./db/watchlist.json');


//middleware functions

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/assets', express.static('./assets'));

app.set('view engine', 'jade');

// ============
//    ROUTES
// ============

app.get('/', (req, res) => {

  res.render('index', states);

});

app.put('/states', (req, res) => {

  let tempStates = {};

  for (let key in states) {
    tempStates[key] = states[key];
  }

  Object.assign(tempStates, req.body);

  fs.writeFile(statesPath, JSON.stringify(tempStates), (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      states = tempStates;
      res.sendStatus(200);
    }
  });

});

app.get('/channels', (req, res) => {
  res.send(channelsList);

});

app.get('/watchlist', (req, res) => {

  fs.readFile(watchlistPath, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    res.send(JSON.parse(data));
  });

});

app.post('/watchlist/create', (req, res) => {

  if (req.body.name === undefined || req.body.channelId === undefined || req.body.time === undefined){
    res.sendStatus(400);
    return;
  }

  let newData = req.body;
  
  let tempWatchList = watchList.slice();

  tempWatchList.push(newData);

  tempWatchList.sort(function(a,b){
    return new Date(a.time) > new Date(b.time) ? 1 : -1; 
  });

  fs.writeFile(watchlistPath, JSON.stringify(tempWatchList), (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      watchList = tempWatchList;
      res.sendStatus(200);
    }
  });

});

app.put('/watchlist/:id', (req, res) => {

  const id = req.params.id;

  if (typeof watchList[id] === 'undefined') {
    res.sendStatus(404);
    return;
  }
  let tempWatchList = watchList.slice();
  console.log(tempWatchList);
  let newData = tempWatchList[id];
  Object.assign(newData, req.body);

  tempWatchList[id] = newData;
  console.log(tempWatchList);

  tempWatchList.sort(function(a,b){
    return new Date(a.time) > new Date(b.time) ? 1 : -1;
  });

  fs.writeFile(watchlistPath, JSON.stringify(watchList), (err) => {
    if (err) {
      console.log(err);
    } else {
      watchList = tempWatchList;
      res.sendStatus(200);
    }
  });
      
});
  

app.delete('/watchlist/:id', (req, res) => {

  if (typeof watchList[req.params.id] === 'undefined') {
    res.sendStatus(404);
    return;
  }

  watchList.splice(req.params.id, 1);

  fs.writeFile(watchlistPath, JSON.stringify(watchList), (err) => {
    if (err) {
      console.log(err);
    } else {
      res.sendStatus(200);
    }
  });

});

app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
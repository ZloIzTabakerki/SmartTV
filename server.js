'use strict';

const express = require('express'),
      bodyParser = require('body-parser'),
      fs = require('fs'),

      app = express(),
      
      statesPath = __dirname + '/db%8/states.json',
      watchlistPath = __dirname + '/db/watchlist.json',
      
      channelsList = require('./db/channels.json'),
      watchList = require('./db/watchlist.json'),
      states = require('./db/states.json'),

      port = process.env.PORT || 3000;

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

  Object.assign(states, req.body);

  fs.writeFile(statesPath, JSON.stringify(states), (err) => {
    if (err) {
      console.log(err);
    } else {
      res.sendStatus(200);
    }
  });

});

app.get('/channels', (req, res) => {

  res.send(channelsList);

});

app.get('/watchlist', (req, res) => {

  res.send(watchList);

});

app.post('/watchlist/create', (req, res) => {

  if (req.body.name === undefined || req.body.channelId === undefined || req.body.time === undefined){
    res.sendStatus(400);
    return;
  }

  let newData = {
    name:      req.body.name,
    time:      req.body.time,
    channelId: req.body.channelId
  };

  watchList.push(newData);

  watchList.sort(function(a,b){
    return new Date(a.time) > new Date(b.time) ? 1 : -1; 
  });

  fs.writeFile(watchlistPath, JSON.stringify(watchList), (err) => {
    if (err) {
      console.log(err);
    } else {
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

  let ndata = watchList[id];
  Object.assign(ndata, req.body);

  watchList[id] = ndata;

  watchList.sort(function(a,b){
    return new Date(a.time) > new Date(b.time) ? 1 : -1;
  });

  fs.writeFile(watchlistPath, JSON.stringify(watchList), (err) => {
    if (err) {
      console.log(err);
    } else {
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
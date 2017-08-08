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

//update app states route

app.put('/states', (req, res) => {

  //create buffer object with new properties

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

      // on successful writeFile - save new states in server states object 

      states = tempStates;
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

// create new watchlist item route

app.post('/watchlist/create', (req, res) => {

  let newData = req.body;

  // miss of one of properties can break DB's json

  if (
    newData.name === undefined || 
    newData.channelId === undefined || 
    newData.time === undefined
  ) {
    res.sendStatus(400);
    return;
  }

  // create buffer watchlist with new item
  
  let tempWatchList = watchList.slice();

  tempWatchList.push(newData);

  tempWatchList.sort((a, b) => {
    return new Date(a.time) > new Date(b.time) ? 1 : -1; 
  });

  fs.writeFile(watchlistPath, JSON.stringify(tempWatchList), (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {

      // on successfull writeFile - save it in server watchlist array

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
  
  // create buffer watchlist with new item

  let tempWatchList = watchList.slice();

  tempWatchList.splice(id, 1);

  tempWatchList.push(req.body);

  tempWatchList.sort(function(a,b){
    return new Date(a.time) > new Date(b.time) ? 1 : -1;
  });

  fs.writeFile(watchlistPath, JSON.stringify(tempWatchList), (err) => {
    if (err) {
      console.log(err);
    } else {
      
      // on successfull writeFile - save it in server watchlist array

      watchList = tempWatchList;
      res.sendStatus(200);
    }
  });
      
});  

app.delete('/watchlist/:id', (req, res) => {

  let id = req.params.id;

  if (typeof watchList[id] === 'undefined') {
    res.sendStatus(404);
    return;
  }
  
  // create buffer watchlist with new item

  let tempWatchList = watchList.slice();

  tempWatchList.splice(id, 1);

  fs.writeFile(watchlistPath, JSON.stringify(tempWatchList), (err) => {
    if (err) {
      console.log(err);
    } else {      
      
      // on successfull writeFile - save it in server watchlist array

      watchList = tempWatchList;
      res.sendStatus(200);
    }
  });

});

app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
const express = require('express'),
      bodyParser = require('body-parser'),

      fs = require('fs'),
      channelsList = require('./db/channels.json'),

      app = express(),

      port = process.env.PORT || 3000,
      statesPath = __dirname + '/db/states.json';
      watchlistPath = __dirname + '/db/watchlist.json';

      var wl = [];
      refreshWatchlist();

      function refreshWatchlist (){

          fs.readFile(watchlistPath, (err, data) => {

          if (err) {
            return console.log(err);
          }
          wl = JSON.parse(data.toString('utf8'));

          });
      }


//middleware functions

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/assets', express.static('./assets'));
app.set('view engine', 'jade');


function writeData(path, data) {
    fs.writeFile(path, JSON.stringify(data), (err) => {
      if (err) {
        return console.log(err);
      }      
    });
}


// ============
//    ROUTES
// ============

// index page

app.get('/', (req, res) => {
  fs.readFile(statesPath, (err, data) => {

    if (err) {
      console.log(err);
    }

    data = JSON.parse(data.toString('utf8'));
    res.render('index', data);
  });
});



//handling state changes
app.post('/update-state', (req, res) => {

  let states = require('./db/states.json');

  Object.assign(states, req.body);

  states = JSON.stringify(states);

  // writeData(statesPath, states);
    fs.writeFile(statesPath, states, (err) => {
      if (err) {
        return console.log(err);
    }      
  });

  res.end();

});

app.get('/channels', (req, res) => {

  res.send(channelsList);

});

// watchlist api

app.get('/watchlist', (req, res) => {

  fs.readFile(watchlistPath, (err, data) => {

      if (err) {
        return console.log(err);
      }
      res.send(JSON.parse(data));
  });

});

app.get('/watchlist/:id', function(req, res) {

    if (typeof wl[req.params.id] === 'undefined') {
      res.sendStatus(404);
      return;
    } else {
      res.send(wl[req.params.id]);     
    }
});

app.post('/watchlist/new', (req, res) => {

  let ndata = {};
  ndata.name = req.body.name;
  ndata.channelId = req.body.channelId;
  ndata.time = req.body.time;

  if (ndata.name === undefined || ndata.channelId === undefined || ndata.time === undefined){
    res.sendStatus(400);
    return;
  }

  wl.push(ndata);

  wl.sort(function(a,b){
    return new Date(a.time) > new Date(b.time) ? 1 : -1;
  });

  writeData(watchlistPath, wl);
  refreshWatchlist();

  res.sendStatus(200);

});

app.put('/watchlist/:id', (req, res) => {

      if (typeof wl[req.params.id] === 'undefined') {
        res.sendStatus(404);
        return;
      } else {

      let ndata = {};
      ndata.name = req.body.name;
      ndata.channelId = req.body.channelId;
      ndata.time = req.body.time;

      wl[req.params.id] = ndata;

        wl.sort(function(a,b){
          return new Date(a.time) > new Date(b.time) ? 1 : -1;
        });

      writeData(watchlistPath, wl);

      refreshWatchlist();

      res.sendStatus(200);
    }
      
});
  

app.delete('/watchlist/:id', (req, res) => {

      if (typeof wl[req.params.id] === 'undefined') {

        res.sendStatus(404);
        return;

      } else {

      wl.splice(req.params.id, 1);

      writeData(watchlistPath, wl);

      refreshWatchlist();

      res.sendStatus(200);
    }

});


app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
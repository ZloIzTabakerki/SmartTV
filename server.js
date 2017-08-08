const express = require('express'),
      bodyParser = require('body-parser'),

      fs = require('fs'),
      channelsList = require('./db/channels.json'),

      app = express(),

      port = process.env.PORT || 3000,
      statesPath = __dirname + '/db/states.json';
      watchlistPath = __dirname + '/db/watchlist.json';

let wl = require('./db/watchlist.json'); // const also can be used - K.


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

  //result should be sent as callback for written file - K.

  res.sendStatus(200);

});

app.get('/channels', (req, res) => {

  res.send(channelsList);

});

// watchlist api

app.get('/watchlist', (req, res) => {

      res.send(wl);

});


// no need for this route

app.get('/watchlist/:id', function(req, res) {

    if (typeof wl[req.params.id] === 'undefined') {
      res.sendStatus(404);
      return;
    } else {
      res.send(wl[req.params.id]);     
    }
});

app.post('/watchlist/new', (req, res) => {

  // regExp would be better - K.

  if (req.body.name === undefined || req.body.channelId === undefined || req.body.time === undefined){
    res.sendStatus(400);
    return;
  }

  let ndata = {};
  ndata.name = req.body.name;
  ndata.channelId = req.body.channelId;
  ndata.time = req.body.time;


  wl.push(ndata);

  //sorting wathclist by Date
  wl.sort(function(a,b){
    return new Date(a.time) > new Date(b.time) ? 1 : -1; 
  });

  writeData(watchlistPath, wl);

  res.sendStatus(200);

});

app.put('/watchlist/:id', (req, res) => {

      // would be better save wl[req.params.id] in variable

      if (typeof wl[req.params.id] === 'undefined') {
        res.sendStatus(404);
        return;
      } else {

      let ndata = wl[req.params.id];
      Object.assign(ndata, req.body);

      wl[req.params.id] = ndata;

        wl.sort(function(a,b){
          return new Date(a.time) > new Date(b.time) ? 1 : -1;
        });

      writeData(watchlistPath, wl);

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

      res.sendStatus(200);
    }

});


app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
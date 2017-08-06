const express = require('express'),
      bodyParser = require('body-parser'),

      fs = require('fs'),
      channelsList = require('./db/channels.json'),

      app = express(),

      port = process.env.PORT || 3000,
      statesPath = __dirname + '/db/states.json';
      watchlistPath = __dirname + '/db/watchlist.json';

      var wl;

      fs.readFile(watchlistPath, (err, data) => {

      if (err) {
        return console.log(err);
      }
      wl = JSON.parse(data);
      });


//middleware functions

app.use(bodyParser.urlencoded({
  extended: true
}));
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

  writeData(statesPath, states);

  res.end();

});

app.get('/channels', (req, res) => {

  res.send(channelsList);

});

// watchlist api

app.get('/watchlist', (req, res) => {

  // let watchlist = require('./db/watchlist.json');

  fs.readFile(watchlistPath, (err, data) => {

      if (err) {
        return console.log(err);
      }
      res.send(data.toString("UTF-8"));
  });


  // if (Object.keys(req.query).length === 0){

  //       res.send(watchlist);

  // } else {

  //       res.send(watchlist[req.query.id]);

  // }

});

app.get('/watchlist/:id', function(req, res) {
    res.send(wl[req.params.id]);
    console.log(wl[req.params.id]);
});

app.post('/watchlist/new', (req, res) => {

  // let watchlist = require('./db/watchlist.json');

  let ndata = {};
  ndata.name = req.body.name;

  // channelID !== channelId !== channel
  ndata.channelId = req.body.channelId;
  ndata.time = req.body.time;

  wl.push(ndata);

  wl.sort(function(a,b){
    return new Date(a.time) > new Date(b.time) ? 1 : -1;
  });

  writeData(watchlistPath, wl);

  //request accomplished conformation
  res.send();

  // fs.writeFile(watchlistPath, JSON.stringify(wl), {'flags': 'a+'});

  // res.sendStatus(200);

  // if (Object.keys(req.query).length === 0 || Object.keys(req.query).length > 1){
  //   res.sendStatus(400);
  // } else {
  //   fs.readFile(watchlistPath, (err, data) => {

  //     if (err) {
  //       return console.log(err);
  //     }

  //     data = JSON.parse(data.toString('utf8'));

  //     if (!data[req.query.id]){

  //     data[req.query.id] = req.body;
  //     data = JSON.stringify(data);

  //     fs.writeFile(watchlistPath, data, 'utf8', function(err) {
  //     if(err) {
  //       return console.log(err);
  //     }
  //     }); 

  //     res.sendStatus(200);
  //     } else {
  //       res.sendStatus(400);
  //     }

  //   });

  // }

});

// app.put('/watchlist/', (req, res) => {

//     fs.readFile(watchlistPath, (err, data) => {

//       if (err) {
//         return console.log(err);
//       }

//       data = JSON.parse(data.toString('utf8'));

//       if (data[req.body.id]){

//       data[req.query.id] = req.body;
//       data = JSON.stringify(data);

//       fs.writeFile(watchlistPath, data, 'utf8', function(err) {
//       if(err) {
//         return console.log(err);
//       }
//       }); 

//       res.sendStatus(200);
      
//       } else {

//         res.sendStatus(400);

//       }

//     });

  

// });

// app.delete('/watchlist/', (req, res) => {

//     if (Object.keys(req.query).length === 0 || Object.keys(req.query).length > 1){

//       res.sendStatus(400);

//     } else {

//       fs.readFile(watchlistPath, (err, data) => {

//         if (err) {
//           console.log(err);
//         }

//         data = JSON.parse(data.toString('utf8'));

//         if (data[req.query.id]){

//         delete data[req.query.id];
//         data = JSON.stringify(data);

//         fs.writeFile(watchlistPath, data, 'utf8', function(err) {
//           if(err) {
//             return console.log(err);
//           }
//         }); 

//         res.sendStatus(200);

//         } else {
//           res.sendStatus(400);
//         }

//       });

//     }

// });

// app.get('/watchlist/new', (req, res) => {


// });

// app.get('/watchlist/edit', (req, res) => {

// });

//________________________________________

app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
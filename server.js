const express = require('express'),
      bodyParser = require('body-parser'),
      fs = require('fs'),
      channelsList = require('./db/channels.json'),

      app = express(),

      port = process.env.PORT || 3000,
      dbPath = __dirname + '/db/states.json';

//middlewares

app.use(bodyParser.json());
app.use('/assets', express.static('./assets'));
app.set('view engine', 'jade');

// function for updating DB

function updateDB(req) {
  
  function writeDBData(data) {
    fs.writeFile(dbPath, data, (err) => {
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
  
  fs.readFile(dbPath, (err, data) => {

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

app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
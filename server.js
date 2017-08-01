const express = require('express'),
      bodyParser = require('body-parser'),
      fs = require('fs'),
      channelsList = require('./db/channels.json'),
      EventEmitter = require('events').EventEmitter,

      app = express(),
      eventEmitter = new EventEmitter(),

      port = process.env.PORT || 3000,
      dbPath = __dirname + '/db/states.json';

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

    try {
      data = JSON.parse(data.toString('utf8'));
    } catch (e) {
      console.log(err);
      res.sendFile(__dirname + 'views/index.html');
    }

    res.render('index', data);
  });

}

//middlewares

app.use(bodyParser.json());
app.use('/assets', express.static('./assets'));
app.set('view engine', 'jade');

// ============
//    ROUTES
// ============

// index page

app.get('/', (req, res) => {
  sendDBIndexData(res);
});

// long-polling changes handling

app.get('/update-state', (req, res) => {

  console.log('req achieved');

  function updateListener(reqBody) {
    res.json(reqBody);
    console.dir(reqBody);
  }
  
  eventEmitter.once('state-updated', updateListener);

  req.on('aborted', () => {
    res.end();
    eventEmitter.removeListener('state-updated', updateListener);
    console.log('aborted');
  })

});

//changing state handling

app.post('/update-state', (req, res) => {

  updateDB(req);
  
  eventEmitter.emit('state-updated', req.body);

  res.end();

});

app.get('/channels', (req, res) => {

  res.json(channelsList);

});

app.get('/current-state', (req, res) => {

  let states = require('./db/states.json');

  console.dir(states);

  res.json(states);

});


app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
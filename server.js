const express = require('express'),
      bodyParser = require('body-parser'),
      fs = require('fs'),
      EventEmitter = require('events').EventEmitter,

      app = express(),
      eventEmitter = new EventEmitter(),

      port = process.env.PORT || 3000,
      dbPath = __dirname + '/db/states.json';

eventEmitter.setMaxListeners(0);

// function for updating DB

function updateDB(req) {
  
  function writeDBData(data) {
    fs.writeFile(dbPath, data, (err) => {
      if (err) {
        console.log(err);
      }      
    });
  }

  fs.readFile(dbPath, (err, data) => {

    if (err) {
      console.log(err);
    }

    try {
      data = JSON.parse(data.toString('utf8'));
    } catch (e) {
      data = JSON.stringify(req.body);

      writeDBData(data);
    }

    Object.assign(data, req.body);
    data = JSON.stringify(data);

    writeDBData(data);
  });
}

app.use(bodyParser.json());
app.use('/assets', express.static('./assets'));

// index page

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// long-polling changes handling

app.get('/update-state', (req, res) => {
  
  eventEmitter.addListener('state-updated', (reqBody) => {

    reqBody = JSON.stringify(reqBody);

    console.log(reqBody);

    res.send(reqBody);
    
  });

});

//changing state handling

app.post('/update-state', (req, res) => {

  updateDB(req);
  
  eventEmitter.emit('state-updated', req.body);

  res.send();

});

app.listen(port, () => {
  console.log('Started on ' + port + '!');
});
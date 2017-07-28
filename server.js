const http = require('http'),
    fs = require('fs'),
    port = process.env.PORT || 3000;

function getMIME(url) {
  const types = {
        jpeg: 'image/JPEG',
        jpg: 'image/JPG',
        css: 'text/css',
        js: 'application/x-javascript'
      }, 
      type = url.slice(url.lastIndexOf('.') + 1);

  return types[type] ? types[type] : 'text/plain';
}

httpServer = http.createServer();

httpServer.on('request', (req, res) => { 
  
  let file,
      url = req.url,
      method = req.method;
  
  //routes

  if (method === 'GET') {

    if (url === '/') {
      file = fs.readFile('./views/index.html', (err, data) => {
        if (err) {
          console.log('err');
        }

        res.writeHead(202, {"Content-type":"text/html"});
        res.write(data);
        res.end();
        
      });
    } else if (url.indexOf('/assets/') === 0) {

      //static files server in 'assets' folder
      
      fileLoc = '.' + req.url;

      file = fs.readFile(fileLoc, (err, data) => {

        // function for getting MIMEs of static files: takes request URL, returns MIME-type

        if (err) {
          res.writeHead(404);
          res.end('Not found');
          console.dir(err);
        }
        res.writeHead(202, {"Content-type": getMIME(url)});
        res.end(data);
      });
    } 
  } else {

    //404-requests handling

    res.writeHead(404);
    res.write('Not found!');
    res.end();
  }

});

httpServer.listen(port, () => {
    console.log('Started on ' + port + '!');
});
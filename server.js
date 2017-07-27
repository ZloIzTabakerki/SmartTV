var http = require('http'),
    fs = require('fs'),
    port = process.env.PORT || 3000;;

httpServer = http.createServer( function (req, res) { 
  
  var file,
      url = req.url,
      method = req.method;
  
  //routes

  if (method === 'GET' && url === '/') {
    file = fs.readFile('./views/index.html', function (err, data) {
      if (err) {
        console.log('err');
        res.writeHead(404);
        res.end('File not found');
      }

      res.writeHead(202, {"Content-type":"text/html"});
      res.write(data);
      res.end();
      
    });
  } else if (method = 'GET' && url.indexOf('/assets/') === 0) {

    //static files server in 'assets' folder
    
    fileLoc = '.' + req.url;

    file = fs.readFile(fileLoc, function (err, data) {

      // function for getting MIMEs of static files: takes request URL, returns MIME-type

      function getMIME(url) {
        var types = {
              jpeg: 'image/JPEG',
              jpg: 'image/JPG',
              css: 'text/css',
              js: 'application/x-javascript'
            }, 
            type = url.slice(url.lastIndexOf('.') + 1);

        return types[type] ? types[type] : 'text/plain';
      }

      if (err) {
        res.writeHead(404);
        res.end('Not found');
        console.dir(err);
      }
      res.writeHead(202, {"Content-type": getMIME(url)});
      res.end(data);
    });

  } else {

    //404-requests handling

    res.writeHead(404);
    res.write('Not found!');
    res.end();
  }

});

httpServer.listen(port, function () {
    console.log('Started on ' + port + '!');
});
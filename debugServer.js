const http = require('http')
const test = require('./demo')
const port = 8180
http.createServer(function (req, res) {
    test()
    res.end('Testing')
}).listen(port, function () {
    console.log('debug server start, Local: http://localhost:' + port)
})

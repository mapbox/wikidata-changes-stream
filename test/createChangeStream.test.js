var tape = require('tape');
var wcs = require('../index');

tape('createChangeStream', function(assert) {
    var stream = wcs.createChangeStream({
        start: Math.floor(+new Date()/1000) - 30,
        end: Math.floor(+new Date()/1000)
    });
    var pass = true;
    var counter = 0;
    stream.on('data', function(event) {
        counter++;
        pass = pass && event &&
            typeof event.type === 'string' &&
            typeof event.title === 'string' &&
            typeof event.timestamp === 'string';
    });
    stream.on('end', function() {
        assert.ok(pass, 'received ' + counter + ' events');
        assert.end();
    });
});


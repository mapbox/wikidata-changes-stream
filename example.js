var wcs = require('./index.js');

var changes = wcs.createChangeStream({
    start: (+new Date)/1000 - 60,
    end: (+new Date)/1000
});

changes
    .pipe(wcs.createEntityStream())
    .on('data', function(obj) {
        console.log(JSON.stringify(obj));
    })
    .on('error', function(err) {
        console.error(err);
    });


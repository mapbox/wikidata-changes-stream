var tape = require('tape');
var wcs = require('../index');

tape('getPage: error', function(assert) {
    var end = Math.floor(+new Date/1000);
    var start = Math.floor(+new Date/1000) - 60;
    wcs.getPage(start, end, false, function(err, data) {
        assert.deepEqual(err && /Invalid continue param/.test(err.toString()), true, 'returns error from Wikidata');
        assert.end();
    });
});

tape('getPage', function(assert) {
    var end = Math.floor(+new Date/1000);
    var start = Math.floor(+new Date/1000) - 60;
    wcs.getPage(start, end, undefined, function(err, data) {
        assert.ifError(err);
        assert.deepEqual(data.query && Array.isArray(data.query.recentchanges), true, 'returns query results');
        assert.deepEqual(typeof data.query.recentchanges[0].type, 'string', 'event.type');
        assert.deepEqual(typeof data.query.recentchanges[0].title, 'string', 'event.title');
        assert.deepEqual(typeof data.query.recentchanges[0].timestamp, 'string', 'event.timestamp');
        assert.end();
    });
});



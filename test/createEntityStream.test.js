var tape = require('tape');
var wcs = require('../index');

tape('createEntityStream', function(assert) {
    var stream = wcs.createEntityStream();
    var events = 0;
    stream.on('data', function(entity) {
        events++;
        assert.equal(typeof entity.id, 'string', 'entity.id');
        assert.equal(typeof entity.labels, 'object', 'entity.labels');
        assert.equal(typeof entity.claims, 'object', 'entity.claims');
        if (events === 3) assert.end();
    });
    stream.write({ title: 'Q24642206' });
    stream.write({ title: 'Q27669897' });
    stream.write({ title: 'Q27530872' });
    stream.write(null);
});


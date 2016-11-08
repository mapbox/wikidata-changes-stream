var Readable = require('stream').Readable;
var Transform = require('stream').Transform;
var request = require('requestretry');
var url = require('url');
var wdk = require('wikidata-sdk');
var parallel = require('parallel-stream');

module.exports = {};
module.exports.WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
module.exports.createChangeStream = createChangeStream;
module.exports.createEntityStream = createEntityStream;
module.exports.getPage = getPage;

function createChangeStream(options) {
    if (options.start && typeof options.start !== 'number') {
        throw new Error('options.start must be a timestamp');
    }
    if (options.end && typeof options.end !== 'number') {
        throw new Error('options.end must be a timestamp');
    }
    if ((options.end && !options.start) ||
        (options.end <= options.start)) {
        throw new Error('options.start and options.end must be timestamps where options.end > options.start');
    }

    var changeStream = new Readable({ objectMode: true });
    changeStream.rccontinue;
    changeStream.cache = [];
    changeStream.readPending = false;
    changeStream.done = false;
    changeStream._read = function() {
        while (changeStream.cache.length) {
            var obj = changeStream.cache.shift();
            if (!obj) break;
            if (!changeStream.push(obj)) break;
        }

        if (changeStream.cache.length) return;
        if (changeStream.readPending) return;
        if (changeStream.done) return changeStream.push(null);

        changeStream.readPending = true;

        getPage(options.start, options.end, changeStream.rccontinue, function(err, data) {
            if (err) return changeStream.emit('error', err);
            var page = data && data.query && data.query.recentchanges;
            if (page.length) {
                changeStream.cache = changeStream.cache.concat(page);
                if (data.continue && data.continue.rccontinue) {
                    changeStream.rccontinue = data.continue.rccontinue;
                } else {
                    changeStream.done = true;
                }
            } else {
                changeStream.done = true;
            }
            changeStream.readPending = false;
            changeStream._read();
        });
    };

    return changeStream;
}

function createEntityStream() {
    var stream = parallel.transform(function(change, encoding, callback) {
        if (!(/^Q\d+$/).test(change.title)) return callback();

        var entityUrl;
        try {
            entityUrl = wdk.getEntities({
                ids: change.title,
                properties: ['info', 'labels']
            });
        } catch(err) {
            return callback(err);
        }

        request({
            url: entityUrl,
            json: true
        }, function(err, res, body) {
            if (err) return callback(err);
            callback(null, body);
        });
    }, { objectMode: true, concurrency: 4 });
    return stream;
}

function getPage(rcstart, rcend, rccontinue, callback) {
    request({
        uri: module.exports.WIKIDATA_API,
        qs: {
            rcstart: rcstart,
            rcend: rcend,
            rccontinue: rccontinue,
            rcdir: 'newer',
            action: 'query',
            list: 'recentchanges',
            format: 'json',
            rclimit: 500
        },
        json: true
    }, function(err, res, body) {
        if (err) return callback(err);
        return callback(null, body);
    });
}

var changes = createChangeStream({
    start: 1478646620,
    end: 1478646680
});
changes
.pipe(createEntityStream())
.on('data', function(obj) {
    console.log(JSON.stringify(obj));
})
.on('error', function(err) {
    console.error(err);
});



wikidata-changes-stream
-----------------------
Create node streams of change event objects from Wikidata's RecentChanges API.

- https://www.wikidata.org/w/api.php?action=query&list=recentchanges
- https://www.mediawiki.org/wiki/API:RecentChanges

### createChangeStream()

Create a stream of change event objects from Wikidata.

### createEntityStream()

Transform stream that requests full entities from change event objects.

### Example

Stream the last 60 seconds of changes from Wikidata.

```js
var wcs = require('wikidata-changes-stream');

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
```

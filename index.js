var fs = require('fs');
var Lazy = require('lazy');
var Hash = require('hashish');

module.exports = function (cb) {
    var self = {};
    var dict = {};

    self.pronounce = function (word) {
        return dict[word.toUpperCase()];
    };

    self.syllables = function (word) {
        var prose = self.pronounce(word);
        return prose && prose[0].filter(function (ph) {
            return ph.match(/^[AEIOU]/);
        }).length;
    };

    self.rhyme = function (word) {
        word = word.toUpperCase();
        if (!dict[word]) return [];

        var xs = dict[word].reduce(function (acc, w) {
            acc[active(w)] = true;
            return acc;
        }, {});

        var rhymes = [];
        Object.keys(dict).forEach(function (w) {
            if (w === word) return;

            var some = dict[w].some(function (p) {
                return xs[active(p)];
            });
            if (some) rhymes.push(w);
        }, []);
        return rhymes;
    };

    function processDictionary (dictionary) {
        dictionary.split("\n").forEach(function (line) {
            if (!line.match(/^[A-Z]/i)) {
              return;
            }

            var words = line.split(/\s+/);
            var w = words[0].replace(/\(\d+\)$/, '');

            if (!dict[w]) dict[w] = [];
            dict[w].push(words.slice(1));
        })
    }

    fs.readFile(__dirname + '/data/cmudict.0.7a', 'utf8', function (err, data) {
        processDictionary(data);

        cb(self);
    });
}

function active (ws) {
    // active rhyming region: slice off the leading consonants
    for (
        var i = 0;
        i < ws.length && ws[i].match(/^[^AEIOU]/i);
        i++
    );
    return ws.slice(i).join(' ');
}

const test = require('ava');
const outputHelper = require('./outputHelper');
var Table = require('easy-table')

test('createTableRow formats the row correctly for 1 row without expanded layout', t => {
    var i = 1;
    var table = new Table;
    var score = {};

    score.username = 'johnsmith';
    score.score = 100;
    score.diff = 50;
    score.posted = '10/10/2021';

    outputHelper.createTableRow(i, table, score, false)

    t.is(table.toString(), "Rank  User       Score\n----  ---------  -----\n   1  johnsmith    100\n");
})

test('createTableRow formats the row correctly for 2 rows without expanded layout', t => {
    var i = 1;
    var table = new Table;
    var score = {};

    score.username = 'johnsmith';
    score.score = 100;
    score.diff = 50;
    score.posted = '10/10/2021';

    outputHelper.createTableRow(i, table, score, false)

    i = 2;
    score.username = 'goodplayer';
    score.score = 200;
    score.diff = 40;
    score.posted = '10/11/2021';

    outputHelper.createTableRow(i, table, score, false)

    t.is(table.toString(), "Rank  User        Score\n----  ----------  -----\n   1  johnsmith     100\n   2  goodplayer    200\n");
})

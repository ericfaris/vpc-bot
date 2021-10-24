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

test('generateWeeklyBoilerPlateText generates the correct text', t => {
    var scores = "[{\"username\":\"PinStratsDan\",\"score\":1159571490,\"diff\":385422550,\"posted\":\"10/19/2021 14:13:14\",\"points\":12},{\"username\":\"Lumigado\",\"score\":1048247800,\"diff\":368521570,\"posted\":\"10/20/2021 00:51:04\",\"points\":10}]";
    var teams = [];
    var week = "55";
    var periodStart = "10/10/2021"; 
    var periodEnd = "10/17/2021";
    var table = "Mystery Castle (Alvin G 1993)";
    var tableUrl = "htttp://www.google.com";
    var romUrl = "http://www.amazon.com";
    var notes = "Notes for testing.";

    const actual = outputHelper.generateWeeklyBoilerPlateText(JSON.parse(scores), teams, week, periodStart, periodEnd, 
        table, tableUrl, romUrl, notes);

    const expected = '\n\n**WEEKLY LEADERBOARD**\n\n**Week:** 55\n**Dates:** 10/10/2021 - 10/17/2021\n\n**Current Table:** Mystery Castle (Alvin G 1993)\n**Table Url:** htttp://www.google.com\n**Rom Url:** http://www.amazon.com\n**Notes:** Notes for testing.\n\n\n**Leaderboard:**\n\`Rank  User          Score        \n----  ------------  -------------\n   1  PinStratsDan  1,159,571,490\n   2  Lumigado      1,048,247,800\n\`\n\n**All Current & Historical Results:**\nhttps://www.iscored.info/?mode=public&user=ED209 \n'; 

    t.is(actual, expected);
}) 
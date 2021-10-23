const test = require('ava');
const dbHelper = require('../helpers/dbHelper');

test('current db can be fetched', t => {
    const db = dbHelper.getCurrentDB();
    t.not(db, null)
})

test('archive db can be fetched', t => {
    const db = dbHelper.getArchiveDB();
    t.not(db, null)
})

test('season db can be fetched', t => {
    const db = dbHelper.getSeasonDB();
    t.not(db, null)
})
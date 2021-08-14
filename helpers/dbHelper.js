const JSONdb = require('simple-json-db');

module.exports = {

    getCurrentDB: () => {
        return new JSONdb('./data/db.json');
    },
    
    getArchiveDB: () => {
        return new JSONdb('./data/archive.json');
    },

    getSeasonDB: () => {
        return new JSONdb('./data/season.json');
    }

}
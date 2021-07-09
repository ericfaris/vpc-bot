require('dotenv').config()

module.exports = {

    getRankChange: (username, previousScores, newScores) => {
        const newIndex = newScores.findIndex(x => x.username === username);
        const previousIndex = previousScores.findIndex(x => x.username === username);
        const indexDiff = ((newIndex - previousIndex) * -1);

        return indexDiff;
    },

    getCurrentRank: (username, newScores) => {
        const newIndex = newScores.findIndex(x => x.username === username) + 1;
        return newIndex + ' of ' + newScores.length;
    }

}
require('dotenv').config()

module.exports = {

    getRankChange: (username, previousScores, newScores) => {
        let indexDiff;
        const newIndex = newScores.findIndex(x => x.username === username);
        const previousIndex = previousScores.findIndex(x => x.username === username);

        if(previousIndex === -1) {
            indexDiff = newScores.length - newIndex;
        } else {
            indexDiff = newIndex - previousIndex;
            indexDiff = indexDiff === 0 ? indexDiff : indexDiff * -1;
        }

        return indexDiff;
    },

    getCurrentRank: (username, newScores) => {
        const newIndex = newScores.findIndex(x => x.username === username) + 1;
        return newIndex + ' of ' + newScores.length;
    }

}
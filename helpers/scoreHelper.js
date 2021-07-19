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
    },

    modifyPoints: (scores) => {

        if(scores.length > 0) {
            scores[0].points = 7;
        }

        if(scores.length > 1) {
            scores[1].points = 5;
        }

        if(scores.length > 2) {
            scores[2].points = 3;
        }

        if(scores.length > 3) {
            scores[3].points = 2;
        }

        if(scores.length > 4) {
            scores[4].points = 1;
        }

        if(scores.length > 5) {
            for (let index = 5; index < scores.length; index++) {
                scores[index].points = 0;
            }
        }
    },
}
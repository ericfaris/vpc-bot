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
            scores[0].points = 12;
        }

        if(scores.length > 1) {
            scores[1].points = 10;
        }

        if(scores.length > 2) {
            scores[2].points = 9;
        }

        if(scores.length > 3) {
            scores[3].points = 8;
        }

        if(scores.length > 4) {
            scores[4].points = 7;
        }

        if(scores.length > 5) {
            scores[5].points = 6;
        }

        if(scores.length > 6) {
            scores[6].points = 5;
        }

        if(scores.length > 7) {
            scores[7].points = 4;
        }

        if(scores.length > 8) {
            scores[8].points = 3;
        }

        if(scores.length > 9) {
            scores[9].points = 2;
        }

        if(scores.length > 10) {
            for (let index = 10; index < scores.length; index++) {
                scores[index].points = 1;
            }
        }
    },
}
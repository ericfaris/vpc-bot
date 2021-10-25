const test = require('ava');
const scoreHelper = require('./scoreHelper');

test ('getRankChange returns hte correct rank change', t => {
    var username = 'farise';
    var previousScores = 
        [
            {
                "username":"PinStratsDan",
                "score":1159571490,
                "diff":385422550,
                "posted":"10/19/2021 14:13:14",
                "points":12
            },
            {
                "username":"Lumigado",
                "score":1048247800,
                "diff":368521570,
                "posted":"10/20/2021 00:51:04",
                "points":10
            },
            {
                "username":"farise",
                "score":23423423,
                "diff":43,
                "posted":"10/20/2021 00:51:04",
                "points":9
            }
        ];
    var newScores = 
        [
            {
                "username":"farise",
                "score":3159571490,
                "diff":1159571490,
                "posted":"10/20/2021 00:51:04",
                "points":12
            },
            {
                "username":"PinStratsDan",
                "score":1159571490,
                "diff":385422550,
                "posted":"10/19/2021 14:13:14",
                "points":10
            },
            {
                "username":"Lumigado",
                "score":1048247800,
                "diff":368521570,
                "posted":"10/20/2021 00:51:04",
                "points":9
            },
        ];

    const actual = scoreHelper.getRankChange(username, previousScores, newScores);
    const expected = 2;

    t.is(actual, expected);
});

test('getCurrentRankText returns the correct text', t => {
    var username = 'farise';
    var scores = 
        [
            {
                "username":"PinStratsDan",
                "score":1159571490,
                "diff":385422550,
                "posted":"10/19/2021 14:13:14",
                "points":12
            },
            {
                "username":"Lumigado",
                "score":1048247800,
                "diff":368521570,
                "posted":"10/20/2021 00:51:04",
                "points":10
            },
            {
                "username":"farise",
                "score":23423423,
                "diff":43,
                "posted":"10/20/2021 00:51:04",
                "points":9
            }
        ];

    const actual = scoreHelper.getCurrentRankText(username, scores);
    const expected = '3 of 3';

    t.is(actual, expected);
})

test('modifyPoints adds the correct points to the scores', t => {
    var scores = 
        [
            {
                "username":"PinStratsDan",
                "score":1159571490,
                "diff":385422550,
                "posted":"10/19/2021 14:13:14"
            },
            {
                "username":"Lumigado",
                "score":1048247800,
                "diff":368521570,
                "posted":"10/20/2021 00:51:04"
            },
            {
                "username":"farise",
                "score":23423423,
                "diff":43,
                "posted":"10/20/2021 00:51:04"
            }
        ];

    scoreHelper.modifyPoints(scores);
    const actual = [scores[0].points, scores[1].points, scores[2].points];
    const expected = [ 12, 10, 9 ];

    t.deepEqual(actual, expected);
})
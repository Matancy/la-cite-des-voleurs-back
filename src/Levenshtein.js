"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levenshtein = void 0;
function minimum(nb1, nb2, nb3) {
    return Math.min(Math.min(nb1, nb2), nb3);
}
function levenshtein(str1, str2) {
    var i;
    var j;
    var cost;
    var str1Len = str1.length;
    var str2Len = str2.length;
    var dist = [];
    for (i = 0; i < str1Len; i++) {
        dist[i][0] = i;
    }
    console.log(dist);
}
exports.levenshtein = levenshtein;
levenshtein("aqsdfqsdfqsfd", "aqdfqsfdqsdfqsfd");

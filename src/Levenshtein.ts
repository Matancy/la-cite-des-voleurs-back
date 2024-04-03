function minimum(nb1: number, nb2: number, nb3: number): number {
    return Math.min(Math.min(nb1, nb2), nb3)
}

export function levenshtein(str1: string, str2: string) {

    let i: number;
    let j: number;
    let cost: number;
    let str1Len = str1.length;
    let str2Len = str2.length;
    let dist: number[][] = []


    for (i = 0; i <= str1Len; i++) {
        dist[i] = []
        dist[i][0] = i;
    }

    for (j = 0; j <=str2Len; j++) {
        dist[0][j] = j
    }

    for (i=1; i<=str1Len ; i ++){
        for (j=1; j<=str2Len ; j ++){
            if(str1.charAt(i-1) === str2.charAt(j-1)){
                cost = 0;
            }else{
                cost = 1;
            }
            dist[i][j] = minimum(
                dist[i-1][j]+1,
                dist[i][j-1] +1,
                dist[i-1][j-1] + cost
            )
        }
    }
    return dist[str1Len][str2Len]
}

levenshtein("toto", "lmpn");
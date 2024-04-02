function minimum(nb1: number, nb2: number, nb3: number): number {
    return Math.min(Math.min(nb1, nb2), nb3)
}


export function levenshtein(str1: string, str2: string){

    let i: number;
    let j: number;
    let cost : number;
    let str1Len = str1.length;
    let str2Len = str2.length;
    let dist : number[] = []


    for (i=0; i<str1Len; i++){
        dist[i][0] = i;
    }

    console.log(dist)
}

levenshtein("aqsdfqsdfqsfd", "aqdfqsfdqsdfqsfd");
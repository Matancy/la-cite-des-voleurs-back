function minimum(nb1: number, nb2: number, nb3: number): number {
    return Math.min(Math.min(nb1, nb2), nb3)
}


export function levenshtein(str1: string, str2: string) {
    let i: number;
    let j: number;

    let len1 = str1 ? str1.length : 0
    let len2 = str2 ? str2.length : 0

    if (len1 === 0) {
        return len2;
    }
    if (len2 === 0) {
        return len1;
    }

    const matrix = new Array<number[]>(len2 + 1);

    for (let i = 0; i <= len2; ++i) {
        let row = matrix[i] = new Array<number>(len1 + 1);
        row[0] = i;
    }
    const firstRow = matrix[0];
    for (let j = 1; j <= len1; ++j) {
        firstRow[j] = j;
    }
    for (let i = 1; i <= len2; ++i) {
        for (let j = 1; j <= len1; ++j) {
            if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = minimum(
                    matrix[i - 1][j - 1],
                    matrix[i][j - 1],
                    matrix[i - 1][j]
                ) + 1;
            }
        }
    }
    return matrix[len2][len1]

}

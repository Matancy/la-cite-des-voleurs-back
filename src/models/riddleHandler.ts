import { levenshtein } from "../Levenshtein"
import { getRandomNumber, loadRiddles } from "../utils"

export class RiddleHandler {
    static readonly RIDDLES = loadRiddles()


    async getRandomRiddle() {
        const riddles = await loadRiddles()
        return riddles[getRandomNumber(0, riddles.length - 1)]
    }

    async getRiddle(riddleID: number) {
        const riddles = await loadRiddles()
        return riddles[riddleID]
    }
}
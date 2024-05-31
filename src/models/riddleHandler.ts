import { levenshtein } from "../Levenshtein"
import { getRandomNumber, loadRiddles } from "../utils"
import { RiddleAnswer } from "./riddleAnswer"

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

    async checkAnswer(riddleAnswer: RiddleAnswer): Promise<boolean> {
        const minScore = 5
        console.log(riddleAnswer.answer)
        console.log((await this.getRiddle(riddleAnswer.id)).answer)

        return levenshtein((await this.getRiddle(riddleAnswer.id)).answer, riddleAnswer.answer) < minScore
    }
}
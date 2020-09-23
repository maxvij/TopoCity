import {shuffle} from "./shuffle";

export const getShuffledAnswerOptions = (facts, nextFact) => {
    // Get list of all incorrect answers
    let incorrectAnswers = facts.filter((fact) => {
        return fact[2] !== nextFact[2]
    })
    // Shuffle list of incorrect answers
    let answerOptions = shuffle(incorrectAnswers)
    // Limit list of incorrect answers to 2
    answerOptions = answerOptions.slice(0, 2)
    // Add the correct answer
    answerOptions.push(nextFact)
    // Shuffle once more
    return shuffle(answerOptions)
}

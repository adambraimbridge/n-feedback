const { expect } = require('chai');
const getQuestions = require('./../src/get-questions');
const surveyData = require('./fixtures/survey-data.json');

describe('getQuestions()', () => {
    const questions = getQuestions(surveyData);

    it('should return an array containing all the questions in the survey', () => {
        expect(questions).to.be.an('array');
        expect(questions.length).to.equal(2);
    });

    it('should only include the info we need for the questions in the survey', () => {
        expect(questions[0]).to.have.all.keys('text', 'id');
    });
});

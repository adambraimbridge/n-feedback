/**
 * Takes survey data we have received from the Feedback API, and returns all
 * the questions in a format needed for posting the survey response.
 * @param {Array} surveyData The survey data received from the Feedback API.
 * @returns {Array} An array of questions containing only the info we need for
 *                  submitting the survey response.
 */
function getQuestions (surveyData) {
	const blocksWithQuestions = surveyData.filter(block => block.questions && block.questions.length > 0);
	const blockQuestions = [].concat(...blocksWithQuestions.map(block => block.questions));
	const questions = blockQuestions.map(question => ({
		id: question.questionId,
		text: question.questionText
	}));

	return questions;
};

module.exports = getQuestions;

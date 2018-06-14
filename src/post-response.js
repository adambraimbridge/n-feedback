// ToDo:
// - Update tests to use the additional data param

const getQuestions = require('./get-questions');
const feedbackApi = 'https://www.ft.com/__feedback-api/v1';

/**
 * Takes the survey data and the responses and posts the responses to the
 * Feedback API.
 * @param {String} surveyId The ID of the survey are we posting the response for.
 * @param {Object} surveyData The original Feedback API data for the survey we
 *                            are posting the response for.
 * @param {Object} surveyResponse The responses to the survey, using the question
 *                                IDs as the keys for the object.
 * @param {Object} additionalData Additional data to be saved with the survey
 *                                response.
 * @returns {Promise} The fetch request to post the survey response to the
 *                    Feedback API.
 */
function postResponse (surveyId, surveyData, surveyResponse, additionalData) {
	const questions = getQuestions(surveyData);
	const questionsWithResponses = questions.map(question => {
		const { id, text } = question;
		const response = surveyResponse[question.id] || '';

		return { id, text, response };
	});

	const body = {
		surveyId,
		surveyResponse: questionsWithResponses,
		additionalData
	};

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	};

	return fetch(`${feedbackApi}/survey`, options);
};

module.exports = postResponse;

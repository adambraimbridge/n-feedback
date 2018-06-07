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

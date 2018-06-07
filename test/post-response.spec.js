const nock = require('nock');
const { expect } = require('chai');
const postResponse = require('./../src/post-response');

describe('postResponse()', () => {
	const feedbackApi = 'https://www.ft.com/__feedback-api/v1';
	const surveyId = '1234567890';

	afterEach(() => {
		nock.cleanAll();
	});

	it('should send the response to the Feedback API', async () => {
		const postNock = nock(feedbackApi)
			.post('/survey')
			.reply(200);

		await postResponse();
		expect(postNock.isDone()).to.be.true;
	});

	it('should include responses to each question', async () => {
		const postNock = nock(feedbackApi)
			.post('/survey', body => body.surveyResponse && body.surveyResponse.length === 3)
			.reply(200);

		await postResponse();
		expect(postNock.isDone()).to.be.true;
	});

	it('should include the survey ID', async () => {
		const postNock = nock(feedbackApi)
			.post('/survey', body => body.surveyId === surveyId)
			.reply(200);

		await postResponse();
		expect(postNock.isDone()).to.be.true;
	});

	describe('each question in the survey response', () => {
		const firstQuestionId = 'QuestionID1';
		const firstQuestionText = 'How fast was the site today?';
		const firstQuestionResponse = 4;

		it('should include the question ID', async () => {
			const postNock = nock(feedbackApi)
				.post('/survey', body => body.surveyResponse[0] && body.surveyResponse[0].id === firstQuestionId)
				.reply(200);

			await postResponse();
			expect(postNock.isDone()).to.be.true;
		});

		it('should include the question text', async () => {
			const postNock = nock(feedbackApi)
				.post('/survey', body => body.surveyResponse[0] && body.surveyResponse[0].text === firstQuestionText)
				.reply(200);

			await postResponse();
			expect(postNock.isDone()).to.be.true;
		});

		it('should include the response to the question', async () => {
			const postNock = nock(feedbackApi)
				.post('/survey', body => body.surveyResponse[0] && body.surveyResponse[0].response === firstQuestionResponse)
				.reply(200);

			await postResponse();
			expect(postNock.isDone()).to.be.true;
		});
	});
});
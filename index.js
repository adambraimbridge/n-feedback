const Overlay = require('o-overlay');
const surveyBuilder = require('./src/survey-builder');
const postResponse = require('./src/post-response');

async function getSurveyData ( surveyId ){
	// const surveyDataURL = 'http://local.ft.com:5005/public/survey.json';
	// const surveyDataURL = `http://local.ft.com:3002/v1/survey/${surveyId}`;
	const surveyDataURL = `https://www.ft.com/__feedback-api/v1/survey/${surveyId}`;
	return fetch(surveyDataURL).then( res => {
		return res.json();
	}).catch( () => {
		// console.error('getSurveyData: XHR: ', err);
	});
}

function setBehaviour (overlay, surveyData, surveyId) {
	const context = overlay.content;

	const nextButtons = document.querySelectorAll('.feedback__survey-next', context);
	nextButtons.forEach( button => {
		button.addEventListener('click', event => {
			event.preventDefault();

			const current = event.target;
			const block = current.closest('.feedback__survey-block');
			const nextBlockSelector = '.' + current.getAttribute('data-survey-next');
			const nextBlock = document.querySelector(nextBlockSelector);

			if( !nextBlock ){
				// console.error(`Next button: next block '${nextBlockSelector}' not found`);
				return false;
			}

			block.classList.add('hidden');
			nextBlock.classList.remove('hidden');
		}, true);
	});

	const submitButtons = document.querySelectorAll('.feedback__survey-submit', context);
	submitButtons.forEach( button => {
		button.addEventListener('click', event => {
			event.preventDefault();

			const surveyResponse = generateResponse(overlay);

			postResponse(surveyId, surveyData, surveyResponse)
				.then(() => {
					overlay.close();
					hideFeedbackButton();
				})
				.catch(() => {
					// ToDo: Add some actual error handling here
					overlay.close();
					hideFeedbackButton();
				});
		});
	});
}

function generateResponse (overlay){
	const context = overlay.content;
	const form = document.querySelector('.feedback__survey__wrapper-form', context);
	const response = {};
	(new FormData(form)).forEach((val, key) => {
		response[key] = val;
	});

	return response;
}

function toggleOverlay (overlay){
	overlay[ overlay.visible ? 'close' : 'open' ]();
}

function hideFeedbackButton (){
	document.querySelector('.feedback__container').classList.add('hidden');
}

module.exports.init = () => {
	const surveyId = 'SV_9mBFdO5zpERO0cZ';
	getSurveyData(surveyId).then( surveyData => {
		const container = document.querySelector('.feedback__container');
		const trigger = document.querySelector('.feedback__container .feedback__survey-trigger');

		let html = '';
		try {
			html = surveyBuilder.buildSurvey(surveyData);
		}catch( err ){
			container.classList.add('hidden');
			trigger.classList.add('hidden');
			return false;
		};

		const feedbackOverlay = new Overlay('feedback-overlay', {
			html: html,
			fullscreen: true,
			zindex: 110,
			customclose: '.feedback__survey__close-button'
		});

		trigger.addEventListener('click', () => {
			toggleOverlay(feedbackOverlay);
		}, true);

		document.querySelector('.feedback__container__close-button').addEventListener('click', event => {
			event.preventDefault();
			hideFeedbackButton();
		});

		document.addEventListener('oOverlay.ready', () => {
			setBehaviour(feedbackOverlay, surveyData, surveyId);
		}, true);
	});
};

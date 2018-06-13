const Overlay = require('o-overlay');
const surveyBuilder = require('./src/survey-builder');
const postResponse = require('./src/post-response');
const getAdditionalInfo = require('./src/get-additional-info');

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

function setBehaviour (overlay, surveyData, surveyId, appInfo) {
	const context = overlay.content;

	const nextButtons = document.querySelectorAll('.n-feedback__survey-next', context);
	nextButtons.forEach( button => {
		button.addEventListener('click', event => {
			event.preventDefault();

			const current = event.target;
			const block = current.closest('.n-feedback__survey-block');
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

	const submitButtons = document.querySelectorAll('.n-feedback__survey-submit', context);
	submitButtons.forEach( button => {
		button.addEventListener('click', event => {
			event.preventDefault();

			const surveyResponse = generateResponse(overlay);
			const additionalData = getAdditionalInfo(appInfo);

			postResponse(surveyId, surveyData, surveyResponse, additionalData)
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
	const form = document.querySelector('.n-feedback__survey__wrapper-form', context);
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
	document.querySelector('.n-feedback__container').classList.add('hidden');
}

function populateContainer (container) {
	container.innerHTML =
		`<div class="n-feedback__overlay__container"></div>
		<a class="n-feedback__container__close-button hidden" href="#void">
			<span>I don't want to give feedback</span>
		</a>

		<p class="n-feedback__desktop__prompt">
			How easy was it to use the FT.com today?
		</p>
		<button class="n-feedback__survey-trigger">
			<span>Feedback</span>
		</button>`;
}

module.exports.init = (appInfo) => {
	const surveyId = 'SV_9mBFdO5zpERO0cZ';


	getSurveyData(surveyId).then( surveyData => {
		const container = document.querySelector('.n-feedback__container');
		populateContainer(container);
		const trigger = document.querySelector('.n-feedback__container .n-feedback__survey-trigger');

		let html = '';
		try {
			html = surveyBuilder.buildSurvey(surveyData, surveyId);
		}catch( err ){
			container.classList.add('hidden');
			trigger.classList.add('hidden');
			return false;
		};

		const feedbackOverlay = new Overlay('feedback-overlay', {
			html: html,
			fullscreen: true,
			zindex: 110,
			customclose: '.n-feedback__survey__close-button'
		});

		trigger.addEventListener('click', () => {
			toggleOverlay(feedbackOverlay);
		}, true);

		document.querySelector('.n-feedback__container__close-button').addEventListener('click', event => {
			event.preventDefault();
			hideFeedbackButton();
		});

		document.addEventListener('oOverlay.ready', () => {
			setBehaviour(feedbackOverlay, surveyData, surveyId, appInfo);
		}, true);
	});
};

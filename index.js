const Overlay = require('o-overlay');
const surveyBuilder = require('./src/survey-builder');
const postResponse = require('./src/post-response');
const getAdditionalInfo = require('./src/get-additional-info');
require('formdata-polyfill');

function getSurveyData ( surveyId ){
	// const surveyDataURL = 'http://local.ft.com:5005/public/survey.json';
	// const surveyDataURL = `http://local.ft.com:3002/v1/survey/${surveyId}`;
	const surveyDataURL = `https://www.ft.com/__feedback-api/v1/survey/${surveyId}`;
	return fetch(surveyDataURL, {
		headers: {
			'Accept': 'application/json',
		}
	}).then( res => {
		return res.json();
	}).catch( () => {
		// console.error('getSurveyData: XHR: ', err);
	});
}

function setBehaviour (overlay, surveyData, surveyId, appInfo) {
	const context = overlay.content;
	const { containerSelector = 'body' } = appInfo;

	// Adding behaviour for Next and Back buttons, moving between blocks/pages
	const navButtons = document.querySelectorAll('.n-feedback__survey-next,.n-feedback__survey-back', context);
	navButtons.forEach( button => {
		button.addEventListener('click', event => {
			event.preventDefault();

			const current = event.target;
			const nextBlockSelector = '.' + current.getAttribute('data-survey-next');

			displayBlock(overlay, nextBlockSelector);
		}, true);
	});

	// onSubmit event for the form
	const surveyForm = document.querySelector('.n-feedback__survey__wrapper-form', context);
	if (surveyForm) {
		surveyForm.addEventListener('submit', event => {
			event.preventDefault();

			const surveyResponse = generateResponse(overlay);
			const additionalData = getAdditionalInfo(appInfo);

			postResponse(surveyId, surveyData, surveyResponse, additionalData)
				.then(() => {
					overlay.close();
					hideFeedbackButton(containerSelector);
				})
				.catch(() => {
					// ToDo: Add some actual error handling here
					overlay.close();
					hideFeedbackButton(containerSelector);
				});
		});
	}

	// Set up validation
	if (context) {
		context.addEventListener('change', event => {
			const block = event.target.closest('.n-feedback__survey-block');
			runValidation(block);
		});
	}
}

function displayBlock (overlay, blockClass){
	const context = overlay.content;
	const nextBlock = document.querySelector(blockClass, context);
	const allBlocks = document.querySelectorAll('.n-feedback__survey-block', context);

	runValidation(nextBlock);

	allBlocks.forEach( block => block.classList.add('n-feedback--hidden') );
	nextBlock.classList.remove('n-feedback--hidden');
}

function runValidation (block){
	const nextButton = document.querySelector('.n-feedback__survey-next', block);

	if( validate(block) ){
		nextButton.removeAttribute('disabled');
		return true;
	}else{
		nextButton.setAttribute('disabled', 'disabled');
		return false;
	}
}

function validate (block){
	const elements = document.querySelectorAll('[data-validation="true"]', block);

	// Valid form elements return false, only non-valid form elements are returned
	const invalides = Array.prototype.slice.call(elements).filter( el => {
		// TODO: Implement other questions types
		// For now we have only the radio button that needs validation
		if( el.classList.contains('n-feedback__question-radio') ){
			const radios = document.querySelectorAll('input[type="radio"]', el);
			const results = Array.prototype.slice.call(radios).filter( r => r.checked );
			// returns false if one of the radio buttons are selected
			return results.length === 0;
		}
	});

	return invalides.length === 0;
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

function hideFeedbackButton (containerSelector){
	document.querySelector(`${containerSelector} .n-feedback__container`).classList.add('n-feedback--hidden');
}

function populateContainer (container) {
	container.innerHTML =
		`<div class="n-feedback__overlay__container"></div>
		<p class="n-feedback__desktop__prompt">
			How easy or hard was it to use FT.com today?
		</p>
		<button class="n-feedback__survey-trigger" data-trackable="feedback-start">
			<span>Feedback</span>
		</button>`;
}

module.exports.init = (appInfo = {}) => {
	const surveyId = 'SV_9mBFdO5zpERO0cZ';
	const { containerSelector = 'body' } = appInfo;
	let feedbackOverlay;
	let setUpActions;

	getSurveyData(surveyId).then( surveyData => {
		const container = document.querySelector(`${containerSelector} .n-feedback__container`);
		container.classList.remove('n-feedback--hidden');
		populateContainer(container);
		const trigger = document.querySelector(`${containerSelector} .n-feedback__container .n-feedback__survey-trigger`);

		let html = '';
		try {
			html = surveyBuilder.buildSurvey(surveyData, surveyId);
		}catch( err ){
			container.classList.add('n-feedback--hidden');
			trigger.classList.add('n-feedback--hidden');
			return false;
		};

		const overlayId = `feedback-overlay-${containerSelector}`;
		feedbackOverlay = new Overlay(overlayId, {
			html: html,
			fullscreen: true,
			zindex: 1001,
			customclose: '.n-feedback__survey__close-button'
		});

		if (trigger) {
			trigger.addEventListener('click', () => {
				toggleOverlay(feedbackOverlay);
			}, true);
		}

		setUpActions = function (event) {
			if (event.detail.el.id === overlayId) { // ensure we only run for this overlay
				setBehaviour(feedbackOverlay, surveyData, surveyId, appInfo);

				// run Validation as soon as you display the first block
				const firstBlock = document.querySelectorAll('.n-feedback__survey-block', feedbackOverlay.content)[0];
				runValidation(firstBlock);
			}
		}

		document.addEventListener('oOverlay.ready', setUpActions, { once: true });
	});

	return {
		destroy: () => {
			if (feedbackOverlay) feedbackOverlay.destroy();
			document.removeEventListener('oOverlay.ready', setUpActions, { once: true });
		}
	};
};

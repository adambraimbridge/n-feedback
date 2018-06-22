const { expect } = require('chai');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const surveyBuilder = require('./../src/survey-builder');

describe('surveyBuilder()', () => {
	describe('for a well-formed survey JSON', () => {
		const wellFormedSurvey = require('./fixtures/working-survey.json');
		const html = surveyBuilder.buildSurvey(wellFormedSurvey);
		const { document } = (new JSDOM(html)).window;

		it('should return the right HTML', () => {
			// Checking to see if the basics of a survey HTML are there
			expect(document.querySelector('.n-feedback__survey')).to.exist;
			expect(document.querySelector('.n-feedback__survey__wrapper-form')).to.exist;

			// Should have the close button
			expect(document.querySelector('.n-feedback__survey__close-button')).to.exist;
		});

		// TODO: Should be testing for the button bar functionality
		// - no next button on last screen
		// - no back button on first screen
		// - submit button on last screen only
		it('should have next/back buttons', () => {
			expect(document.querySelector('.n-feedback__survey-next')).to.exist;
		});

		it('should have a submit button', () => {
			expect(document.querySelector('.n-feedback__survey-submit')).to.exist;
		});
	});

	describe('text area', () => {
		const onlyTextarea = require('./fixtures/only-textarea.json');
		const html = surveyBuilder.buildSurvey(onlyTextarea);
		const { document } = (new JSDOM(html)).window;

		it('should be rendered', () => {
			expect(document.querySelector('.n-feedback__survey-block p.n-feedback__question-text-entry label.o-forms__label')).to.exist;
			expect(document.querySelector('.n-feedback__survey-block p.n-feedback__question-text-entry textarea.o-forms__textarea')).to.exist;
		});
	});

	describe('text block', () => {
		const onlyText = require('./fixtures/only-text.json');
		const html = surveyBuilder.buildSurvey(onlyText);
		const { document } = (new JSDOM(html)).window;

		it('should be rendered', () => {
			expect(document.querySelector('.n-feedback__survey-block p.n-feedback__question-text')).to.exist;
			expect(document.querySelector('.n-feedback__survey-block p.n-feedback__question-text').textContent).to.have.string('Sample text');
		});
	});
});

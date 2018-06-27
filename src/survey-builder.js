
function buildHeader (question) {
	return `<h3 class="n-feedback__question-header">${question.questionText}</h3>`;
}

function buildText (question) {
	return `<p class="n-feedback__question-text">${question.questionText}</p>`;
}

function buildFooter (question) {
	return `<p class="n-feedback__question-footer">${question.questionText}</p>`;
}

function buildQuestion (question) {
	const questionBuilderMap = {
		// MC - Multiple Choice
		'MC': buildMultipleChoiceQuestion,
		// TE - Text Entry
		'TE': buildTextEntryQuestion
	};

	const questionType = question.questionType.type;
	if ( questionType in questionBuilderMap ) {
		return questionBuilderMap[questionType](question);
	} else {
		// console.log('Feedback: buildQuestion - question type not defined: ', questionType, question);
	}

	return '';
}

function buildMultipleChoiceQuestion (question) {
	const validation = question.validation.doesForceResponse;

	const html = [
		`<fieldset class="n-feedback__question-radio" data-validation=${validation}>
			<legend>${question.questionText}</legend>
			<div class="n-feedback__question-radio__container">`
	]; // fieldsets can't display: flex

	Object.entries(question.choices).forEach( ([choiceId, choice], current, choices) => {
		let textVisibility = '';
		// if not the first or the last element
		if ( !(choiceId === choices[0][0] || choiceId === choices[choices.length-1][0]) ) {
			textVisibility = 'hidden-label';
		}
		const fieldId = `choice-${choiceId}-${~~(Math.random()*0xffff)}`;

		html.push(
			`<div class="n-feedback__question-radio__choice-container">
				<input type="radio" id="${fieldId}" class="o-forms__radio" name="${question.questionId}" value="${choiceId}" />
				<label for="${fieldId}" class="o-forms__label ${textVisibility}">
					<span class="n-feedback__question-radio-text">${choice.choiceText}</span>
				</label>
			</div>`
		);
	});

	html.push(
			`</div>
		</fieldset>`
	);
	return html.join('\n');
}

function buildTextEntryQuestion (question) {
	const fieldId = `text-${question.questionId}-${~~(Math.random()*0xffff)}`;

	const html =
		`<p class="n-feedback__question-text-entry o-forms">
			<label for="${fieldId}" class="o-forms__label">${question.questionText}</label>
			<textarea id="${fieldId}" name="${question.questionId}" class="o-forms__textarea"></textarea>
		</p>`;

	return html;
}

function buildButtonBar (surveyLength, blockId){
	const blockHTML = [];
	blockHTML.push('<p class="n-feedback__survey__button-bar">');

	if( blockId > 0 ) {
		blockHTML.push(
			`<button class="n-feedback__primary-button n-feedback__survey-back"
				data-survey-next="n-feedback__survey-block-${blockId-1}">
				Back
			</button>`
		);
	}

	// if this not the last block on the survey
	if ( surveyLength - 1 > blockId ) {
		blockHTML.push(
			`<button class="n-feedback__primary-button n-feedback__survey-next"
				data-survey-next="n-feedback__survey-block-${blockId+1}">
				Next
			</button>`
		);
	} else {
		blockHTML.push(
			`<button class="n-feedback__primary-button n-feedback__survey-submit">
				Submit
			</button>`
		);
	}

	blockHTML.push('</p>');

	return blockHTML.join('\n');
}

function buildSurvey (surveyData, surveyId) {
	const builderMap = {
		header: buildHeader,
		footer: buildFooter,
		text: buildText,
		question: buildQuestion
	};

	if ( surveyData && surveyData.length === 0 ) {
		throw new Error('Bad survey data');
	}

	const surveyHTML = [
		`<div class="n-feedback__survey">
			<a class="n-feedback__survey__close-button o-overlay__close" href="#void">
				<span>I don't want to give feedback</span>
			</a>
			<form class="n-feedback__survey__wrapper-form">
				<input type="hidden" name="surveyId" value="${surveyId}" />`
	];

	surveyData.forEach( (block, blockId) => {
		// Only show the first block initially, hide the others
		const hiddenClass = (blockId === 0 ? '': 'n-feedback--hidden');
		const blockHTML = [`<div class="n-feedback__survey-block ${hiddenClass} n-feedback__survey-block-${blockId}">`];

		block.questions.forEach( question => {
			const blockType = question.questionName.toLowerCase();
			if( blockType in builderMap ){
				const questionHTML = builderMap[blockType]( question );
				blockHTML.push(questionHTML);
			}else{
				// console.log('Feedback: Qualtrics survey question type not defined: ', blockType, question);
			}
		});

		blockHTML.push(buildButtonBar( surveyData.length, blockId ));
		blockHTML.push('</div>');
		surveyHTML.push(blockHTML.join('\n'));
	});

	surveyHTML.push('</form></div>');
	return surveyHTML.join('\n');
}

module.exports = {
	buildSurvey
};

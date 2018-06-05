const Overlay = require('o-overlay');

module.exports.init = () => {
	const feedbackElement = document.createElement('button');

	feedbackElement.classList.add('feedback__prompt');
	feedbackElement.innerText = 'Feedback';
	document.body.appendChild(feedbackElement);

	feedbackElement.addEventListener('click', (event) => {
		event.preventDefault();

		const feedbackOverlay = new Overlay('feedbackOverlay', {
			modal: false,
			compact: true,
			html: 'GIVE ME FEEDBACK'
		});

		console.log(feedbackOverlay); // eslint-disable-line no-console
		console.log('clicked'); // eslint-disable-line no-console
	});
};

const feedbackApi = 'https://www.ft.com/__feedback-api/v1';

function postResponse () {
	return fetch(`${feedbackApi}/survey`);
};

module.exports = postResponse;
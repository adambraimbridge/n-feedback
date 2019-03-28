/**
 * This module produces a singleton to be use ad a service to provide fault tolerancy in case of network issue in the client.
 * The module attempt to send a response of the survey and in case of failure will retry.
 * Once loaded, the module will check if a pre-existent response was stored without been send, if it found the response it will try to send it again.
 **/
let _defaultPostResponse = require('../post-response');
let _postResponse = null;
// Number of retries before abandon.
let defaultMaxRetries = 10;
let maxRetries = null;
// Time between attempts.
const threeMinutesInMilliseconds = 180000;
let defaultIntervalBetweenAttempts = threeMinutesInMilliseconds;
let intervalBetweenAttempts = null;
let storage = null;
let isStorageWritable = null;
let isStorageReadable = null;
// Name for the key in the web storage.
const storageUniqueIdentifier = 'n-feedback-response';
let attempts = null;
let scheduledRetry = null;
// Customise error for simple identification.
function customError (errorDescription, error) {
	return new Error(`n-feedback: ${errorDescription}`, error);
}
// Save response locally if the storage is supported and a response has not been stored yet.
function saveResponse (surveyId, surveyData, surveyResponse, additionalData) {
	if (
		isStorageWritable &&
		isStorageReadable &&
		!storage.getItem(storageUniqueIdentifier)
	) {
		try {
			storage.setItem(
				storageUniqueIdentifier,
				JSON.stringify({ surveyId, surveyData, surveyResponse, additionalData })
			);
		} catch (error) {
			// It shouldn't happen, but in case of error we log it.
			throw customError('unable to write on storage', error);
		}
	}
}

async function tryToSendResponse (
	surveyId,
	surveyData,
	surveyResponse,
	additionalData
) {
	attempts++;
	if (attempts > maxRetries) {
		stopRetry();
		return Promise.resolve(
			`Reached the maximum amount of retries (${maxRetries})`
		);
	} else {
		try {
			await _postResponse(surveyId, surveyData, surveyResponse, additionalData);
			stopAndClearLocalData();
			return Promise.resolve(`Suceeded at attempts number ${attempts}`);
		} catch (err) {
			// Store data, if not already existing, in case we are not able to resolve the retries succesfully.
			saveResponse(surveyId, surveyData, surveyResponse, additionalData);
			return retryAfterTimeout(
				surveyId,
				surveyData,
				surveyResponse,
				additionalData
			);
		}
	}
}
// setTimeout doesn't return (yet) a promise so we promisify it.
async function retryAfterTimeout (
	surveyId,
	surveyData,
	surveyResponse,
	additionalData
) {
	return new Promise((resolve) => {
		scheduledRetry = setTimeout(async () => {
			return tryToSendResponse(
				surveyId,
				surveyData,
				surveyResponse,
				additionalData
			).then(resolutionReason => {
				resolve(resolutionReason);
			});
		}, intervalBetweenAttempts);
	});
}

function stopRetry () {
	clearTimeout(scheduledRetry);
}

function clearData () {
	return isStorageWritable && storage.removeItem(storageUniqueIdentifier);
}

function stopAndClearLocalData () {
	clearData();
	stopRetry();
}

class StoreAndRetry {
	constructor (config = {}, bypassSingleton = false) {
		if (!StoreAndRetry.instance || bypassSingleton) {
			attempts = 0;
			// Override defaults values.
			maxRetries = config.maxRetries || defaultMaxRetries;
			storage = config.storage || localStorage;
			isStorageWritable = storage && typeof storage.setItem === 'function';
			isStorageReadable = storage && typeof storage.getItem === 'function';
			_postResponse = config.postResponse || _defaultPostResponse;
			intervalBetweenAttempts =
				config.intervalBetweenAttempts || defaultIntervalBetweenAttempts;
			StoreAndRetry.instance = this;
		}
		return StoreAndRetry.instance;
	}

	async attemptToPostPrestoredResponses () {
		const previousStoredResponse =
			isStorageReadable && storage.getItem(storageUniqueIdentifier);
		if (previousStoredResponse) {
			const {
				surveyId,
				surveyData,
				surveyResponse,
				additionalData
			} = JSON.parse(previousStoredResponse);
			return tryToSendResponse(
				surveyId,
				surveyData,
				surveyResponse,
				additionalData
			);
		} else {
			const resolutionReason = !isStorageReadable
				? 'Storage not supported'
				: 'No previous stored response present';
			return Promise.resolve(resolutionReason);
		}
	}

	async postResponseWithRetry (
		surveyId,
		surveyData,
		surveyResponse,
		additionalData
	) {
		return tryToSendResponse(
			surveyId,
			surveyData,
			surveyResponse,
			additionalData
		);
	}
}

module.exports = {
	init (config, bypassSingleton) {
		const instance = new StoreAndRetry(config, bypassSingleton);
		Object.freeze(instance);
		return instance;
	}
};

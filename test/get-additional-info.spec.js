const { expect } = require('chai');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const getAdditionalInfo = require('./../src/get-additional-info');

describe('getAdditionalInfo()', () => {
	const domOptions = {
		url: 'https://www.ft.com/world',
		referrer: 'https://www.ft.com/'
	};
	const { document } = (new JSDOM('', domOptions)).window;
	const appInfo = {
		name: 'stream'
	};

	let originalDoc;
	let additionalInfo;

	before(() => {
		originalDoc = global.document;
		global.document = document;
		additionalInfo = getAdditionalInfo(appInfo);
	});

	after(() => {
		global.document = originalDoc;
	});

	it('should return an object', () => {
		expect(additionalInfo).to.be.an('object');
	});

	it('should return the current URL', () => {
		expect(additionalInfo.currentUrl).to.equal('https://www.ft.com/world');
	});

	it('should return the referrer URL', () => {
		expect(additionalInfo.referrerUrl).to.equal('https://www.ft.com/');
	});

	it('should return the app name from the app info it receives', () => {
		expect(additionalInfo.appName).to.equal('stream');
	});
});

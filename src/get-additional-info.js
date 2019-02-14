function getAdditionalInfo (appInfo) {
	const {
		referrer: referrerUrl,
		URL: currentUrl
	} = document;

	const {
		name: appName,
		product,
		version,
		nativeAppVersion
	} = appInfo;

	const additionalInfo = {
		appName,
		currentUrl,
		referrerUrl,
		product,
		version
	};

	if (nativeAppVersion) {
		additionalInfo.nativeAppVersion = nativeAppVersion;
	}

	return additionalInfo;
}

module.exports = getAdditionalInfo;

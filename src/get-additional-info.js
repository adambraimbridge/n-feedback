function getAdditionalInfo (appInfo) {
	const {
		referrer: referrerUrl,
		URL: currentUrl
	} = document;

	const {
		appName,
		product,
		version,
		nativeAppVersion,
		domain
	} = appInfo;

	const additionalInfo = {
		// TODO: Once Page Kit has been rolled out across all apps, this appInfo.name bit should be removed.
		appName: appName || appInfo.name,
		currentUrl,
		referrerUrl,
		product,
		version,
		domain
	};

	if (nativeAppVersion) {
		additionalInfo.nativeAppVersion = nativeAppVersion;
	}

	return additionalInfo;
}

module.exports = getAdditionalInfo;

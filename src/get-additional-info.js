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

	return {
		appName,
		currentUrl,
		referrerUrl,
		product,
		version,
		...(nativeAppVersion ? { nativeAppVersion } : {})
	};
}

module.exports = getAdditionalInfo;

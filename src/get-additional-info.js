function getAdditionalInfo (appInfo) {
    const appName = appInfo.name;
    const referrerUrl = document.referrer;
    const currentUrl = document.URL;

    return {
        appName,
        currentUrl,
        referrerUrl
    };
}

module.exporets = getAdditionalInfo;

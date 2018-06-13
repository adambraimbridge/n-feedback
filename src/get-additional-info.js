function getAdditionalInfo () {
    const htmlElem = document.documentElement;
    const appName = htmlElem.getAttribute('data-next-app');
    const referrerUrl = document.referrer;
    const currentUrl = document.URL;

    return {
        appName,
        currentUrl,
        referrerUrl
    };
}

module.exporets = getAdditionalInfo;

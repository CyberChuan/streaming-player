const keySystemName = 'org.w3.clearkey'
const clearKeyOptions = [
    {
        initDataTypes: ['cenc'],
        videoCapabilities: [{contentType: 'video/mp4; codecs="avc1.64001F"'}]
    }
];

// get license from remote
const getLicenseFromServer = (event) => {
    const licenseUrl = '/license';
    const {message: licenseRequest, target: keySession} = event;

    return new Promise((resolve, reject) => {
        const xmlHttpRequest = new XMLHttpRequest();

        xmlHttpRequest.responseType = 'json';
        xmlHttpRequest.open('POST', licenseUrl);
        xmlHttpRequest.setRequestHeader('content-type', 'application/json');
        xmlHttpRequest.onreadystatechange = function () {
            if (xmlHttpRequest.readyState === 4) {
                const textEncoder = new TextEncoder();
                const newLicense = textEncoder.encode(JSON.stringify(xmlHttpRequest.response));

                resolve(newLicense);
            }
        }

        const payload = String.fromCharCode.apply(null, new Uint8Array(licenseRequest));
        xmlHttpRequest.send(payload);
    });
}

const onLicenseRequestGenerated = (event) => {
    const {target: keySession} = event;

    getLicenseFromServer(event).then((newLicense) => {
        keySession.update(newLicense);
    });
}

const generateRequest = (videoElement, initDataType, initData) => {
    const {mediaKeys} = videoElement;
    const keySession = mediaKeys.createSession();
    // request 生成之后通过 message 事件进行通知
    keySession.addEventListener('message', onLicenseRequestGenerated, false);
    // 开始生成 request
    keySession.generateRequest(initDataType, initData);
};

const setMediaKeysTo = (videoElement) => {
    return navigator.requestMediaKeySystemAccess(keySystemName, clearKeyOptions)
        .then(function (keySystemAccess) {
            return keySystemAccess.createMediaKeys();
        })
        .then(function (createdMediaKeys) {
            return videoElement.setMediaKeys(createdMediaKeys);
        })
}

const onEncrypted = (event) => {
    const {target: videoElement, initDataType, initData} = event;

    generateRequest(videoElement, initDataType, initData);
}

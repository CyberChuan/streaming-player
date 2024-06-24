const keys = {
    '2fef8ad812df429783e9bf6e5e493e53': '7f412f0575f44f718259beef56ec7771',
    '7eaa636ee7d142fd945d1f764877d8db': '624db3d757bb496fb93e51f341d11716',
};

const base64ToHex = str => {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    let res = "";
    for (let i = 0; i < bin.length; i++) {
        res += ('0' + bin.charCodeAt(i).toString(16)).substr(-2);
    }
    return res;
};

const hexToBase64 = hex => {
    let bin = "";
    for (let i = 0; i < hex.length; i += 2) {
        bin += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return btoa(bin)
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};

const getNewLicense = (licenseRequest) => {
    const licenseRequestObject = licenseRequest;
    const outKeys = [];

    for (let i = 0; i < licenseRequestObject.kids.length; i++) {
        const id64 = licenseRequestObject.kids[i];
        const idHex = base64ToHex(licenseRequestObject.kids[i]).toLowerCase();
        const key = keys[idHex];

        if (key) {
            outKeys.push({
                'kty': 'oct',
                'alg': 'A128KW',
                'kid': id64,
                'k': hexToBase64(key)
            });
        }
    }

    return {
        keys: outKeys,
        type: licenseRequestObject.type
    };
}

module.exports = {
    getNewLicense
}

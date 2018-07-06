'use strict';
module.exports = {

    // Settings for Microsoft Azure Auth
    // documented at https://github.com/AzureADQuickStarts/AppModelv2-WebApp-OpenIDConnect-nodejs/blob/master/config.js
    auth: {

        // Required settings

        identityMetadata: process.env.MS_IDENTITY_URL,
        clientID: process.env.MS_CLIENT_ID,
        redirectUrl: process.env.MS_REDIRECT_URL,
        allowHttpForRedirectUrl: !!process.env.MS_ALLOW_HTTP, // cast to boolean
        clientSecret: process.env.MS_CLIENT_SECRET,

        responseType: 'code id_token',
        responseMode: 'form_post',
        validateIssuer: true,
        isB2C: false,
        issuer: null,
        passReqToCallback: false,
        useCookieInsteadOfSession: true,
        cookieEncryptionKeys: [
            {
                'key': process.env.MS_COOKIE_ENC_KEY_1,
                'iv': process.env.MS_COOKIE_ENC_IV_1
            },
            {
                'key': process.env.MS_COOKIE_ENC_KEY_2,
                'iv': process.env.MS_COOKIE_ENC_IV_2
            },
        ],

        // Optional settings

        scope: null,
        loggingLevel: 'info',
        nonceLifetime: null,
        nonceMaxAmount: 5,
        clockSkew: null,
        resourceURL: 'https://graph.windows.net',
        destroySessionUrl: `https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=${process.env.MS_LOGOUT_URL}`,
    }
};


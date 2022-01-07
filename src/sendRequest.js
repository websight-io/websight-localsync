const axios = require('axios');
const FormData = require('form-data');

async function sendRequest(method, url, formData, headers) {
    try {
        return await axios({
            url,
            data: formData,
            method,
            headers: {
                ...((formData != null && formData.getHeaders != null)
                    ? formData.getHeaders()
                    : {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }),
                ...headers
            },
            auth: {
                username: 'admin',
                password: 'admin'
            },
            validateStatus: (status) => status >= 200 && status <= 302,
            maxRedirects: 0
        });
    } catch (error) {
        if (error.response) {
            return error.response;
        } else {
            console.error('Could not connect to the server');
            throw error;
        }
    }
}

function toFormData(obj) {
    const formData = new FormData();
    Object.entries(obj).forEach(([key, value]) => formData.append(key, value));
    return formData;
}

module.exports = { sendRequest, toFormData };


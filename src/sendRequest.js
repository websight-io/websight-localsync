import axios from 'axios';
import { default as FormData } from 'form-data';

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
                username: 'wsadmin',
                password: 'wsadmin'
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

export { sendRequest, toFormData };

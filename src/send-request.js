import axios, {AxiosResponse} from 'axios';
import { default as FormData } from 'form-data';

/**
 * @param {string} method HTTP method of the request
 * @param {string} url URL of the request
 * @param {Object} formData form data to send with the request
 * @param {Object} headers additional headers to send with the request
 * @returns {Promise<AxiosResponse<any>>} promise that resolves with the response of the request
 */
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

/**
 * Converts an object to FormData
 * @param {Object} obj object to convert
 * @returns {Object} FormData object
 */
function toFormData(obj) {
    const formData = new FormData();
    Object.entries(obj).forEach(([key, value]) => formData.append(key, value));
    return formData;
}

export { sendRequest, toFormData };

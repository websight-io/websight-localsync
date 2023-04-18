/*
 * Copyright (C) 2023 Dynamic Solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios from 'axios';
import FormData from 'form-data';

/**
 * @param {string} method HTTP method of the request
 * @param {string} url URL of the request
 * @param {Object} [formData] form data to send with the request
 * @param {Object} [headers] additional headers to send with the request
 * @returns {Promise<any>} promise that resolves with the response of the request
 */
async function sendRequest(method, url, formData, headers) {
    try {
        return await axios({
            url,
            data: formData,
            method,
            headers: {
                ...(formData != null && formData.getHeaders != null
                    ? formData.getHeaders()
                    : {
                          'Content-Type': 'application/x-www-form-urlencoded',
                      }),
                ...headers,
            },
            auth: {
                username: 'wsadmin',
                password: 'wsadmin',
            },
            validateStatus: (status) => status >= 200 && status <= 302,
            maxRedirects: 0,
        });
    } catch (error) {
        if (error.response) {
            return error.response;
        }
        console.error('Could not connect to the server');
        throw error;
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

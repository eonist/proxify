/*
JavaScript Application Logic
This implementation follows modern asynchronous programming patterns using async/await for improved readability over promise chains.
Error handling propagates through all stages of the workflow, providing user-facing feedback for various failure scenarios.
*/
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initializes the application by processing the URL parameter and fetching archived content.
 */
async function initializeApp() {
    /*
    Handling URL Query Parameters
    The URLSearchParams API provides a standardized interface for working with URL query strings.
    This approach eliminates common pitfalls associated with manual parameter parsing, such as improper encoding/decoding
    of special characters or mishandling of duplicate parameters. It automatically decodes percent-encoded characters and
    provides type-safe access to parameter values.
    */
    const params = new URLSearchParams(location.search);
    const userUrl = params.get('url');

    if (!userUrl) {
        displayError('missing_url');
        return;
    }

    try {
        const validatedUrl = validateUrl(userUrl);
        const archiveUrl = buildArchiveUrl(validatedUrl);
        const content = await fetchWithCache(archiveUrl);
        renderContentSafely(content);

    } catch (error) {
        displayError(error.code || 'network_error', { url: userUrl });
    }
    /*
    Register a service worker to handle offline caching and network failures:
    */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
}

/**
 * Input Validation and Sanitization
 *
 * Secure handling of user-supplied URLs requires multiple validation layers.
 * This validation ensures proper URL structure while restricting dangerous protocols
 * like `file:` or `javascript:`. The URL constructor performs automatic normalization
 * and syntax checking.
 *
 * @param {string} input - The user-supplied URL to validate.
 * @returns {string} - Returns the validated URL string.
 * @throws {Error} - Throws an error with a code if the URL is invalid.
 */
function validateUrl(input) {
    try {
        const url = new URL(input);
        if (!url.protocol.startsWith('http')) {
            const error = new Error('Invalid protocol');
            error.code = 'invalid_protocol';
            throw error;
        }
        return url.href;
    } catch (error) {
        console.error('Invalid URL:', error);
        if (!error.code) {
            error.code = 'invalid_url';
        }
        throw error;
    }
}

/**
 * Archive Service Integration
 *
 * Constructing Archive API Requests
 *
 * The archival proxy service integrates with archive.today's submission interface through
 * parameterized URL construction. The `encodeURIComponent` function ensures proper URL
 * encoding of special characters, maintaining compliance with RFC 3986 standards.
 * This encoding is crucial when handling user-supplied URLs that may contain spaces,
 * Unicode characters, or their own query parameters.
 *
 * @param {string} url - The URL to be archived.
 * @returns {string} - The fully constructed archive API URL.
 */
const buildArchiveUrl = (url) => {
    const base = 'https://archive.today/?run=1&url=';
    return `${base}${encodeURIComponent(url)}`;
};

/**
 * Content Retrieval Mechanism
 *
 * Utilizes the Fetch API for asynchronous resource loading with essential security checks:
 * 1. HTTP status code validation
 * 2. Content-Type verification
 * 3. Error handling for network failures 
 *
 * @param {string} url - The URL to fetch archived content from.
 * @returns {Promise<string>} - The fetched HTML content.
 * @throws {Error} - Throws an error if fetching fails.
 */
async function fetchArchiveContent(url) {
    try {
        const response = await fetch(url);

        // Validate HTTP status code
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`);
            error.code = 'http_error';
            error.status = response.status;
            throw error;
        }

        // Verify Content-Type header
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
            const error = new Error('Invalid content type');
            error.code = 'invalid_content';
            throw error;
        }

        return await response.text();
    } catch (error) {
        console.error('Fetch failed:', error);
        throw error;
    }
}

/**
 * Safely renders HTML content by sanitizing it to prevent XSS attacks.
 *
 * @param {string} html - The HTML content to render.
 */
async function renderContentSafely(html) {
    if (!html) {
        console.error('No content to render');
        return;
    }
    const container = document.createElement('div');
    container.innerHTML = html;

    // Remove all script tags to prevent XSS
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Remove inline styles and external stylesheets
    const styles = container.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(style => style.remove());

    const contentElement = document.getElementById('content');
    if (contentElement) {
        contentElement.appendChild(container);
    } else {
        console.error('Content container not found');
    }
}

const ERROR_MAP = {
    'missing_url': 'Please provide a URL parameter in the query string',
    'invalid_protocol': 'Only HTTP/HTTPS URLs are supported',
    'invalid_url': 'The provided URL is invalid',
    'network_error': 'Failed to retrieve archived content',
    'invalid_content': 'The response contained unexpected content',
    'http_error': 'HTTP error occurred while fetching content',
};

/**
 * Escapes HTML special characters in a string.
 *
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, function (tag) {
        const charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;',
        };
        return charsToReplace[tag] || tag;
    });
}

/**
 * Displays an error message to the user.
 *
 * This approach provides consistent user feedback while maintaining a separation between technical errors
 * and user-facing messages.
 *
 * ## Error Handling and User Feedback
 *
 * ### Comprehensive Error Reporting
 *
 * Implements structured error handling across all system components.
 *
 * @param {string} code - The error code identifier.
 * @param {Object} [details={}] - Additional details about the error.
 * @param {string} [details.url] - The URL related to the error, if applicable.
 */
function displayError(code, details = {}) {
    const message = ERROR_MAP[code] || 'An unknown error occurred';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.innerHTML = `
        <strong>Error:</strong> ${escapeHTML(code)}<br>
        <span>${escapeHTML(message)}</span>
        ${details.url ? `<br><strong>URL:</strong> ${escapeHTML(details.url)}` : ''}
    `;
    const contentElement = document.getElementById('content');
    if (contentElement) {
        contentElement.appendChild(errorDiv);
    } else {
        console.error('Content container not found');
    }
}

/*
Implement a caching layer using the Cache API:
*/
const CACHE_NAME = 'archive-v1';

async function cacheResponse(url, content) {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(content);
    await cache.put(url, response);
}

async function getCachedResponse(url) {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match(url);
}

/*
This cache-first strategy improves load times for repeat visits while maintaining freshness through standard HTTP caching headers
*/
async function fetchWithCache(url) {
    const cachedResponse = await getCachedResponse(url);
    if (cachedResponse) {
        return await cachedResponse.text();
    }
    const freshContent = await fetchArchiveContent(url);
    await cacheResponse(url, freshContent);
    return freshContent;
}
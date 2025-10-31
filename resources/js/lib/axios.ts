import axios from 'axios';

// Configure axios defaults
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Get CSRF token from meta tag
const token = document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// Track if CSRF cookie has been initialized
let csrfInitialized = false;
let csrfInitializing: Promise<void> | null = null;

// Initialize CSRF cookie for Sanctum
const initializeCsrf = async (): Promise<void> => {
    if (csrfInitialized) return;

    if (csrfInitializing) {
        return csrfInitializing;
    }

    csrfInitializing = axios
        .get('/sanctum/csrf-cookie')
        .then(() => {
            csrfInitialized = true;
            csrfInitializing = null;
        })
        .catch((error) => {
            console.error('Failed to initialize CSRF cookie:', error);
            csrfInitializing = null;
            throw error;
        });

    return csrfInitializing;
};

// Intercept requests that need CSRF token
axios.interceptors.request.use(
    async (config) => {
        // Only initialize CSRF for state-changing requests
        if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
            await initializeCsrf();
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axios;

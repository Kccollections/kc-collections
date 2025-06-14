// This file controls which API implementation to use (mock or real)

import mockApi from '../constraint/index';
import realApi from '../services/realApi';

// Set to true to use real API, false to use mock API
const USE_REAL_API = true;

// Export the appropriate API implementation
export const api = USE_REAL_API ? realApi : mockApi;

export default api;
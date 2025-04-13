// API Configuration
const API = {
  // Base URLs
  BASE_URL: 'https://stage.suniyenetajee.com/api/v1',

  // Auth headers
  AUTH_TOKEN: '7b257e1452f1115b0c70f80a1d54ccd8615aa52c',
  getHeaders: () => ({
    'Authorization': `Token ${API.AUTH_TOKEN}`
  }),

  // Image URL helper
  getImageUrl: (path) => path ? `https://stage.suniyenetajee.com${path}` : null,

  // Endpoints
  ENDPOINTS: {
    // Posts
    POSTS: '/web/posts',
    POST_DETAIL: (id) => `/web/posts/${id}`,
    POST_APPROVE: (id) => `/web/posts/${id}/approve`,
    POST_FLAG: (id) => `/web/posts/${id}/flag`,
    POST_DELETE: (id) => `/web/posts/${id}/delete`,

    // Users
    USERS: '/web/users',
    USER_DETAIL: (id) => `/web/users/${id}`,

    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',

    // Access Control
    ACCESS_CONTROL: '/web/access-control',
  }
};

export default API;

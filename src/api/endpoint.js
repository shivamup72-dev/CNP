// API Configuration
const API = {
  // Base URLs
  BASE_URL: 'https://stage.suniyenetajee.com',

  // Auth headers
  AUTH_TOKEN: '7b257e1452f1115b0c70f80a1d54ccd8615aa52c',
  getHeaders: () => ({
    'Authorization': `Token ${API.AUTH_TOKEN}`
  }),

  // Image URL helper
  getImageUrl: (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API.BASE_URL}${path}`;
  },

  // Endpoints
  ENDPOINTS: {
    // Posts
    POSTS: '/api/v1/web/posts',
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

    // New endpoint for fetching admin choices
    ADMIN_CHOICES: '/api/v1/web/global-admin-choice'
  },

  // Fetch admin choices for a specific type
  getAdminChoices: async (type = 'post') => {
    try {
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.ADMIN_CHOICES}?applicable_for=${type}`, {
        headers: API.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch admin choices: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching admin choices:', error);
      return [];
    }
  }
};

export default API;

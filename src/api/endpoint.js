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
    POST_STATUS_UPDATE: (id) => `/api/v1/web/post-status-update/${id}/`,

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
  },

  // Update post status (approve, reject, flag)
  updatePostStatus: async (postId, action, reasonId, remarks = "") => {
    try {
      const url = `${API.BASE_URL}${API.ENDPOINTS.POST_STATUS_UPDATE(postId)}`;
      
      // Create the request body
      const body = {
        action: action, // "approve", "reject", "red_flag"
        reason: reasonId
      };

      // Add remarks if provided
      if (remarks) {
        body.remarks = remarks;
      }

      console.log(`[API] Updating post ${postId} status with action: ${action}`, { 
        url, 
        requestBody: body,
        headers: {
          ...API.getHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...API.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`[API] Error response (${response.status}):`, data);
        throw new Error(data.message || `Failed to update post status: ${response.status}`);
      }
      
      console.log(`[API] Success response for ${action} on post ${postId}:`, data);
      return data;
    } catch (error) {
      console.error('[API] Error updating post status:', error);
      throw error;
    }
  }
};

export default API;

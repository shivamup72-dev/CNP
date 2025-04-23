// API Configuration
const API = {
  // Base URLs
  BASE_URL: 'https://stage.suniyenetajee.com',

  // Auth headers
  AUTH_TOKEN: '7b257e1452f1115b0c70f80a1d54ccd8615aa52c',
  getHeaders: () => {
    // Get token from localStorage if available, otherwise use the default token
    const token = localStorage.getItem('api_token') || API.AUTH_TOKEN;
    return {
      'Authorization': `Token ${token}`
    };
  },

  // Image URL helper
  getImageUrl: (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API.BASE_URL}${path}`;
  },

  // Centralized fetch wrapper with authentication
  fetchWithAuth: async (endpoint, options = {}) => {
    // Construct full URL if a relative endpoint is provided
    const url = endpoint.startsWith('http') ? endpoint : `${API.BASE_URL}${endpoint}`;
    
    // Ensure headers exist and include authentication
    const headers = {
      ...API.getHeaders(),
      ...(options.headers || {})
    };
    
    // If content type is not explicitly set and we're sending data, default to JSON
    if (options.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      
      // Convert body to JSON string if it's not already a string and not FormData
      if (typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }
    }
    
    try {
      console.log(`[API] ${options.method || 'GET'} request to: ${url}`, options.body ? { body: options.body } : '');
      
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      // Parse response based on content type
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      if (!response.ok) {
        console.error(`[API] Error response (${response.status}):`, data);
        
        // Handle 401 errors (unauthorized)
        if (response.status === 401) {
          console.error('[API] Authentication error. Token may be invalid or expired.');
          // Here you could implement token refresh logic or redirect to login
        }
        
        throw new Error(data.message || data.detail || `Request failed with status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('[API] Request error:', error);
      throw error;
    }
  },
  
  // HTTP method helpers
  get: (endpoint, options = {}) => {
    return API.fetchWithAuth(endpoint, { ...options, method: 'GET' });
  },
  
  post: (endpoint, data, options = {}) => {
    return API.fetchWithAuth(endpoint, { ...options, method: 'POST', body: data });
  },
  
  put: (endpoint, data, options = {}) => {
    return API.fetchWithAuth(endpoint, { ...options, method: 'PUT', body: data });
  },
  
  patch: (endpoint, data, options = {}) => {
    return API.fetchWithAuth(endpoint, { ...options, method: 'PATCH', body: data });
  },
  
  delete: (endpoint, options = {}) => {
    return API.fetchWithAuth(endpoint, { ...options, method: 'DELETE' });
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
    POST_REPOST: (id) => `/api/v1/web/repost/${id}/`,

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
      return await API.get(`${API.ENDPOINTS.ADMIN_CHOICES}?applicable_for=${type}`);
    } catch (error) {
      console.error('Error fetching admin choices:', error);
      return [];
    }
  },

  // Update post status (approve, reject, flag)
  updatePostStatus: async (postId, action, reasonId, remarks = "") => {
    try {
      const url = API.ENDPOINTS.POST_STATUS_UPDATE(postId);
      
      // Create the request body
      const body = {
        action: action, // "approve", "reject", "red_flag"
        reason: reasonId
      };

      // Add remarks if provided
      if (remarks) {
        body.remarks = remarks;
      }

      console.log(`[API] Updating post ${postId} status with action: ${action}`);
      
      return await API.post(url, body);
    } catch (error) {
      console.error('[API] Error updating post status:', error);
      throw error;
    }
  },

  // Repost a post
  repostPost: async (postId) => {
    try {
      const url = API.ENDPOINTS.POST_REPOST(postId);
      
      console.log(`[API] Reposting post ${postId}`);
      
      return await API.post(url);
    } catch (error) {
      console.error('[API] Error reposting post:', error);
      throw error;
    }
  },

  // Fetch reposted posts
  getRepostedPosts: async () => {
    try {
      const url = `${API.ENDPOINTS.POSTS}?status=all&is_reposted=true`;
      
      console.log(`[API] Fetching reposted posts from: ${url}`);
      
      // Use direct fetch instead of API.get to avoid triggering dependencies
      const headers = API.getHeaders();
      const response = await fetch(`${API.BASE_URL}${url}`, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reposted posts: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[API] Error fetching reposted posts:', error);
      throw error;
    }
  }
};

export default API;

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  V1_BASE: function() {
    return `${this.BASE_URL}/v1`;
  },
  USER_BASE: function() {
    return `${this.BASE_URL}/user`;
  }
};

export default API_CONFIG;

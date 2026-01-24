// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TASK_BASE: function() {
    return `${this.BASE_URL}/task`;
  },
  USER_BASE: function() {
    return `${this.BASE_URL}/user`;
  }
};

export default API_CONFIG;

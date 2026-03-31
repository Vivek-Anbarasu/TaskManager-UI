// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TASK_BASE: function() {
    return `${this.BASE_URL}/task`;
  },
  USER_BASE: function() {
    return `${this.BASE_URL}/user`;
  },
  AI_BASE: function() {
    return `${this.BASE_URL}/ai/task`;
  }
};

export default API_CONFIG;

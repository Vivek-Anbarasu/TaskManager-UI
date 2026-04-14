// API Configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const TASK_BASE = () => `${BASE_URL}/task`;
export const USER_BASE = () => `${BASE_URL}/user`;
export const AI_BASE   = () => `${BASE_URL}/ai/task`;

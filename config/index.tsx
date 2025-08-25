const BACKEND_URL = "http://192.168.0.7/backoffice_web_master/api";

export const GET_ALL_PRODUCTS = `${BACKEND_URL}/product`;
export const LOGIN_USER = `${BACKEND_URL}/auth/login`;
export const VALIDATE_TOKEN = `${BACKEND_URL}/auth/validateToken`;
export const SAVE_PUSH_TOKEN = `${BACKEND_URL}/auth/savePushToken`;
export const GET_NOTIFICATIONS = `${BACKEND_URL}/get_notifications`;
export const MARK_NOTIFICATION_READ = `${BACKEND_URL}/backoffice/get_notifications/markRead`; // POST { id, userId?, deviceId? }
export const MARK_NOTIFICATIONS_READ_BULK = `${BACKEND_URL}/backoffice/get_notifications/read-bulk`; // POST { ids:[], userId?, deviceId? }
export const GET_UNREAD_COUNT = `${BACKEND_URL}/backoffice/get_notifications/unreadCount`; // GET ?userId=

export const AUTHORIZATION_TOKEN = "aH3KCew1YsWhWqW0tqNU3ndzHb3RdblI";

export const CONFIG = {
  headers: {
    "Content-Type": "application/json",
    // Authorization: "Bearer " + AUTHORIZATION_TOKEN,
  },
};

export const ENDPOINTS = {
  BACKEND_URL,
  GET_ALL_PRODUCTS,
  LOGIN_USER,
  VALIDATE_TOKEN,
  SAVE_PUSH_TOKEN,
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_NOTIFICATIONS_READ_BULK,
  GET_UNREAD_COUNT,
};

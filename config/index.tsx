const BACKEND_URL = "http://192.168.0.5/backoffice_web_master/api";

export const GET_ALL_PRODUCTS = `${BACKEND_URL}/product`;
export const LOGIN_USER = `${BACKEND_URL}/auth/login`;
export const VALIDATE_TOKEN = `${BACKEND_URL}/auth/validateToken`;

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
};

import axios from "axios";
import { store } from "./stores/store";
import { setToken, clearToke } from "./stores/feature/AuthSclice";

const attachInterceptors = (instance, refreshUrl) => {
  instance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.token.accesstoken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post(
            refreshUrl,
            {},
            { withCredentials: true }
          );

          const newAccessToken = refreshResponse.data.accessToken;
          store.dispatch(setToken(newAccessToken));

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          store.dispatch(clearToke());
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

const api = axios.create({
  baseURL: "http://localhost:4002/api/v1/auth",
  withCredentials: true, 
});
attachInterceptors(api, "http://localhost:4002/api/v1/auth/refresh");

export const productApi = axios.create({
  baseURL: "http://localhost:4002/api/v1/products",
  withCredentials: true,
});
attachInterceptors(productApi, "http://localhost:4002/api/v1/auth/refresh");

export default api;

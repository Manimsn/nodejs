import { useEffect } from "react";
import { axiosPrivate } from "../api/axios";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
  const refresh = useRefreshToken(); // Custom hook to get a new Access Token.
  const { auth } = useAuth(); // Get the current authentication state (includes accessToken).

  useEffect(() => {
    // Add a request interceptor to axiosPrivate
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        // If the Authorization header is not already set, add the Access Token
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
        }
        return config; // Return the modified request
      },
      (error) => Promise.reject(error) // Handle request errors
    );

    // Add a response interceptor to handle errors
    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response, // Pass through successful responses unchanged
      async (error) => {
        const prevRequest = error?.config; // The failed request configuration
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          // If the error is 403 (Forbidden) and the request hasn't been retried
          prevRequest.sent = true; // Mark the request as retried
          const newAccessToken = await refresh(); // Get a new Access Token
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`; // Update the Authorization header
          return axiosPrivate(prevRequest); // Retry the failed request
        }
        return Promise.reject(error); // Propagate other errors
      }
    );

    return () => {
      // Clean up interceptors when the component using this hook unmounts
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]); // Dependencies: Reapply interceptors if auth or refresh changes

  return axiosPrivate; // Return the enhanced axios instance
};

export default useAxiosPrivate;

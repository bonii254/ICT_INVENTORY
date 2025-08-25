import axios, { AxiosInstance, AxiosResponse } from "axios";
import { LOGIN_ABSOLUTE } from "./url_helper";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import config from "config";

const { api } = config;

// 🛠️ Axios instance configured for cookie-based auth
const apiClient: AxiosInstance = axios.create({
  baseURL: api.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 🔐 Only store user info (not tokens)
export const setUserInfo = (user?: object) => {
  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
  }
};

export const getUserInfo = (): object | null => {
  const user = localStorage.getItem("authUser");
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, response?: any) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(response);
  });
  failedQueue = [];
};

// 🧠 Intercept 401 errors and try refreshing token via cookie
apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: any) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${api.API_URL}/auth/refresh`, null, {
          withCredentials: true,
        });

        const user = response.data?.user;
        if (user) setUserInfo(user);

        processQueue(null);
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("authUser");
        sessionStorage.setItem(
          "postLoginRedirect",
          window.location.pathname + window.location.search,
        );
        window.location.href = LOGIN_ABSOLUTE;
        return Promise.reject("Session expired. Please log in again.");
      } finally {
        isRefreshing = false;
      }
    }

    const serverError = error?.response?.data;
    const message =
      typeof serverError === "string"
        ? serverError
        : serverError?.error ||
          serverError?.message ||
          error.message ||
          "Unexpected error occurred";
    error.message = message;
    return Promise.reject(error);
  },
);

export const useApiGet = <TData = any>(
  key: QueryKey,
  url: string,
  params?: Record<string, any>,
  enabled: boolean = true,
  options?: Omit<
    UseQueryOptions<TData, Error, TData, QueryKey>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> => {
  return useQuery<TData, Error, TData, QueryKey>({
    queryKey: key,
    queryFn: async () => {
      const query = params ? new URLSearchParams(params).toString() : "";
      const fullUrl = query ? `${url}?${query}` : url;

      const response = await apiClient.get<TData>(fullUrl);
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const prefetchApiGet = async <T = any>(
  queryClient: ReturnType<typeof useQueryClient>,
  key: QueryKey,
  url: string,
  params?: Record<string, any>,
) => {
  const query = params ? new URLSearchParams(params).toString() : "";
  const fullUrl = query ? `${url}?${query}` : url;

  await queryClient.prefetchQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get<T>(fullUrl);
      return data;
    },
  });
};

export const useApiPost = <TResponse, TPayload>(
  url: string,
  onSuccess?: (data: TResponse) => void,
  onError?: (error: any) => void,
) => {
  return useMutation<TResponse, any, TPayload>({
    mutationFn: async (payload: TPayload): Promise<TResponse> => {
      const response = await apiClient.post(url, payload);
      return response.data as TResponse;
    },
    onSuccess,
    onError,
  });
};

export function useApiPut<T = any>(
  url: string,
  onSuccess?: (data: any) => void,
  onError?: (error: any) => void,
) {
  return useMutation({
    mutationFn: async (body: T) => {
      const res = await apiClient.put(url, body);
      return res.data;
    },
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => {
      if (onError) onError(err);
    },
  });
}

export const useApiDelete = <T = any>(url: string) => {
  return useMutation<T, unknown, void>({
    mutationFn: async () => {
      const { data } = await apiClient.delete<T>(url);
      return data;
    },
  });
};

export default apiClient;

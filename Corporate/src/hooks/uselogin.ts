import { useApiPost, setUserInfo } from "../helpers/api_helper";
import { useQueryClient } from "@tanstack/react-query";

interface LoginPayload {
  email: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  fullname: string;
  must_change_password: boolean;
  [key: string]: any;
}

interface LoginResponse {
  user: User;
}

export const useLogin = (
  onSuccess?: (data: LoginResponse) => void,
  onError?: (msg: string) => void,
) => {
  const queryClient = useQueryClient();

  return useApiPost<LoginResponse, LoginPayload>(
    "/auth/login",
    (data) => {
      setUserInfo(data.user);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      onSuccess?.(data); // pass the data
    },
    (err: any) => {
      const msg = 
      err?.response?.data?.error || 
      err?.response?.data?.message ||
      err.message || 
      "Login failed";
    onError?.(msg);
    },
  );
};


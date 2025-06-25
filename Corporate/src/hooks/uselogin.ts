import { useApiPost, setUserInfo } from "../helpers/api_helper";
import { useQueryClient } from "@tanstack/react-query";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  user: object;
}

export const useLogin = (
  onSuccess?: () => void,
  onError?: (msg: string) => void,
) => {
  const queryClient = useQueryClient();

  return useApiPost<LoginResponse, LoginPayload>(
    "/auth/login",
    (data) => {
      setUserInfo(data.user);

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      onSuccess?.();
    },
    (err: any) => {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      onError?.(msg);
    },
  );
};

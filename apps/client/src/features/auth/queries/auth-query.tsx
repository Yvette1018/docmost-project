//在 Service 层的基础上，加上缓存、状态管理、自动刷新等能力。
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getCollabToken, verifyUserToken } from "../services/auth-service";
import { ICollabToken, IVerifyUserToken } from "../types/auth.types";
import { isAxiosError } from "axios";

export function useVerifyUserTokenQuery(
  verify: IVerifyUserToken,
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ["verify-token", verify],
    queryFn: () => verifyUserToken(verify),
    enabled: !!verify.token, //条件请求
    staleTime: 0,
  });
}

export function useCollabToken(): UseQueryResult<ICollabToken, Error> {
  return useQuery({
    queryKey: ["collab-token"],
    queryFn: () => getCollabToken(),
    staleTime: 20 * 60 * 60 * 1000, //20hrs
    //refetchInterval: 12 * 60 * 60 * 1000, // 12hrs
    //refetchIntervalInBackground: true,
    refetchOnMount: true,
    //@ts-ignore
    retry: (failureCount, error) => {  //重试策略
      if (isAxiosError(error) && error.response.status === 404) {
        return false;
      }
      return 10;
    },
    retryDelay: (retryAttempt) => {  //重试延迟
      // Exponential backoff: 5s, 10s, 20s, etc.
      return 5000 * Math.pow(2, retryAttempt - 1);
    },
  });
}

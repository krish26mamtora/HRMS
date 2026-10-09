import React from "react";
import api from "../../auth/api/axios";
import { useQuery } from "@tanstack/react-query";

export interface ReferalCreate {}

const SendJobMail = async (): Promise<ReferalCreate[]> => {
  const response = await api.get<ReferalCreate[]>("/send");
  console.log(response);
  return response.data;
};

const useSendMail = () => {
  return useQuery<ReferalCreate[], Error>({
    queryKey: ["SendMail"],
    queryFn: SendJobMail,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
export default useSendMail;

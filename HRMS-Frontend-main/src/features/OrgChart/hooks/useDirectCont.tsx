import { useQuery } from "@tanstack/react-query";
import api from "../../auth/api/axios";
import type { UserProfileDisplayDto } from "./useProfile";

const fetchDirectContactEmployee = async(id:number):Promise<UserProfileDisplayDto[]>=>{
    const response = await api.get<UserProfileDisplayDto[]>(`/Organisation/direct-reports/${id}`);
    console.log("Employee Profile : " , response.data);
    return response.data;
}

const useDirectCont = (id?:number) =>{
    return useQuery<UserProfileDisplayDto[], Error>({
        queryKey: ['fetchDirectContactEmployee' , id],
        queryFn: () => fetchDirectContactEmployee(id),
        enabled: true
    });
}
export default  useDirectCont;
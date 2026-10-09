import { useQuery } from "@tanstack/react-query";
import api from "../../auth/api/axios";

export interface UserProfileDisplayDto {
  userProfileId: number;
  firstName: string;
  lastName: string;
  address: string;
  gender: string;
  managerId: number;
  age: number;
  designation:string;
  department: string;
  favouriteSport: string;
  joinDate: string; 
  isActive: boolean;
}

const fetchOrgChart = async(id:number):Promise<UserProfileDisplayDto[]>=>{
    const response = await api.get<UserProfileDisplayDto[]>(`/Organisation/${id}`);
    console.log("Employee Profile : " , response.data);
    return response.data;
}

const useOrg = (id:number) =>{
    return useQuery<UserProfileDisplayDto[], Error>({
        queryKey: ['fetchuserManagers', 'assigned', id],
        queryFn: () => fetchOrgChart(id),
    });
}
export default  useOrg;
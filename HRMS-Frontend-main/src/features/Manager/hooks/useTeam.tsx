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
  designation : string;
  department: string;
  favouriteSport: string;
  joinDate: string; 
  isActive: boolean;
}


const fetchAllEmployeesForManager = async(managerId:number):Promise<UserProfileDisplayDto[]>=>{
    const response = await api.get<UserProfileDisplayDto[]>(`/UserProfile/team/${managerId}`);
    console.log("All Employee Profile : " , response.data);
    return response.data;
}

const useProfile = (managerId:number) =>{
    return useQuery<UserProfileDisplayDto[], Error>({
        queryKey: ['fetchuserForManager' , managerId],
        queryFn: () => fetchAllEmployeesForManager(managerId),
    });
}
export default  useProfile;
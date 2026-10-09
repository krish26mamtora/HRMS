import { useQuery } from '@tanstack/react-query';
import api from '../../auth/api/axios';

export interface UserProfile{
    address :string,
    department : string ,
    firstName : string , 
    lastName : string, 
    age:number,
    gender:string , 
    userProfileId : number, 
    isActive : boolean,
    favouriteSport:string,
    managerId : number,
}
async function fetchEmployeeIds(planId: number): Promise<number[]> {
  try {
    const response = await api.get(`/EmployeePlan/employeeForTravelPlan/${planId}`);
    console.log(response.data); 
    return response.data;
  } catch (error) {
    console.error("Error fetching employee IDs:", error);
    return [];
  }
}

async function fetchUserProfile(empId: number): Promise<UserProfile | null> {
  try {
    const response = await api.get(`/UserProfile/${empId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for empId ${empId}:`, error);
    return null;
  }
}

async function handleEmployeeData(planId: number) {
    try {
        const employeeIds: number[] = await fetchEmployeeIds(planId);
        // console.log("Stored Employee IDs:", employeeIds);
        const profilePromises = employeeIds.map((id) => fetchUserProfile(id));
        const profiles = await Promise.all(profilePromises);
        //   console.log("Stored Profiles : ", profiles);
          return profiles;
    } catch (error) {
        console.error("error:", error);
    }
}

const useEmployeesForPlan = (planId: number) => {
    
  return useQuery({
    queryKey: ['employeesForPlan', planId],
    queryFn: () => handleEmployeeData(planId),
       staleTime: 1000 * 60 * 5,
           retry: 2, 
  });

};

export default useEmployeesForPlan;

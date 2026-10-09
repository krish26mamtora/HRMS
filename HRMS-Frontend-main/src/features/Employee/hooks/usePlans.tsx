import api from "../../auth/api/axios";
import { useQuery } from "@tanstack/react-query";

interface AssignedPlan {
  empId: number;
  pId: number;
  status: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface TravelPlanData {
  startDate: string;
  endDate: string;
  destination: string;
  travelMode: string;
  tripType: string;
  purpose: string;
  createdByUserId: number;
  id: number;
  CreatedAt: Date;
}

const fetchAssignedPlan = async (): Promise<AssignedPlan[][]> => {
  var currentEmployee = localStorage.getItem("id");
  if (!currentEmployee) {
    throw new Error("No Employee Found in localstorage");
  }
  const { data: assignedPlan } = await api.get<AssignedPlan[]>(
    `/EmployeePlan/employee/${currentEmployee}`,
  );

  const travelPlans = await Promise.all(
    assignedPlan.map(async (plan) => {
      const { data } = await api.get<TravelPlanData[]>(
        `TravelPlan/${plan.pId}`,
      );
      return data;
    }),
  );
  console.log(travelPlans);
  return travelPlans;
};

export const usePlans = () => {
  return useQuery<TravelPlanData[], Error>({
    queryKey: ["assignedPlan"],
    queryFn: fetchAssignedPlan,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

export default usePlans;

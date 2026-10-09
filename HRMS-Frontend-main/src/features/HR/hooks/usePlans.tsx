import api from '../../auth/api/axios';
import { useQuery } from '@tanstack/react-query';

export interface TravelPlan {
  startDate: string;
  endDate: string;
  destination: string;
  purpose: string;
    createdByUserId : number;
    travelMode:string;
    tripType:string;
    Id :number,
     CreatedAt : Date;
}

const fetchPlans = async () :Promise<TravelPlan[]>=>{
    console.log("fetching from db!");
    const response = await api.get<TravelPlan[]>('/TravelPlan');
     console.log(response)
    return response.data;
}


export const usePlans = () => {
  return useQuery<TravelPlan[], Error>({
    queryKey: ['TravelPlans'],
    queryFn: fetchPlans,
    staleTime: 1000 * 60 * 5,   
    gcTime: 1000 * 60 * 10,    
    refetchOnWindowFocus: false, // Stops refetch when clicking back to tab
    refetchOnMount: false,       //  Stops refetch when navigating back to page
    retry: 2,
  });
}

export default usePlans;
import api from '../../auth/api/axios';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export interface TravelPlan {
  startDate: string;
  endDate: string;
  destination: string;
  purpose: string;
    createdByUserId : number;
    travelMode:string;
    tripType:string;
    id :number,
     CreatedAt : Date;
}

const fetchPlans = async () :Promise<TravelPlan[]>=>{
    try {
      const response = await api.get<TravelPlan[]>('/TravelPlan');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
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
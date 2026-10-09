import React from 'react'
import api from '../../auth/api/axios';
import { useQuery } from '@tanstack/react-query';
type Props = {}
interface JobCreate {
  title: string;
  description: string;
  status : string;
  expYearsReq: number;
  role: string;
  totalPositions: number;
  jdUrl:string;
  contactMail:string
  managedBy : number;
}

const fetchJobs = async():Promise<JobCreate[]>=>{
    const response = await api.get<JobCreate[]>('/jobListing');
     console.log(response)
    return response.data;
}

const useJobs = () => {
   return useQuery<JobCreate[],Error>({
        queryKey : ['JobCreate'],
        queryFn : fetchJobs,
          staleTime: 1000 * 60 * 5,   
            gcTime: 1000 * 60 * 10,    
            refetchOnWindowFocus: false,
            refetchOnMount: false,      
            retry: 2, 
    });
}
export default useJobs
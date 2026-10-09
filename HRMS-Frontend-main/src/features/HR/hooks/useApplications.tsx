import React from 'react'
import api from '../../auth/api/axios';
import { useQuery } from '@tanstack/react-query';

type Props = {}

export interface JobReferals{
    jobId :number,
    reffName : string ,
    reffMail : string , 
    reffResumeUrl : string , 
    empId : number , 
    description : string ,  
}

const fetchApplicationsFromJobId = async(jobId:number):Promise<JobReferals[]>=>{
    
    const response = await api.get<JobReferals[]>(`/Referal/job/${jobId}`);
     console.log("response data : ",response.data)
    return response.data;
}

const useApplications = (jobId:number) => {
    return useQuery<JobReferals[],Error>({
        queryKey : ['JobReferals' , jobId],
        queryFn :()=> fetchApplicationsFromJobId(jobId),
                   staleTime: 1000 * 60 * 5,   
            gcTime: 1000 * 60 * 10,    
            refetchOnWindowFocus: false,
            refetchOnMount: false,      
            retry: 2,
    });
}
export default useApplications;
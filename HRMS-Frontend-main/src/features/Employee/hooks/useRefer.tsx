import React from 'react'
import api from '../../auth/api/axios';
import { useQuery } from '@tanstack/react-query';

export interface ReferalCreate {
    JobId: number,
    ReffName: string,
    ReffMail: string,
    ResumeFile: File | null;
    EmpId: number,
    Description: string,
    Status: string,
}

const fetchJobs = async (): Promise<ReferalCreate[]> => {
    const response = await api.get<ReferalCreate[]>('/jobListing');
    console.log(response)
    return response.data;
}

const useRefer = () => {
    return useQuery<ReferalCreate[], Error>({
        queryKey: ['JobCreate'],
        queryFn: fetchJobs,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 2,
    });
}
export default useRefer;
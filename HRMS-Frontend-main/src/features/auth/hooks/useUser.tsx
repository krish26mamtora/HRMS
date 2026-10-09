import React from 'react'
import api from '../../auth/api/axios';
import { useQuery } from '@tanstack/react-query';
type Props = {}

export interface GetUser {
    FirstName : string,
    LastName : string ,

}

const fetchUser = async(id:number):Promise<GetUser[]>=>{
    const response = await api.get<GetUser[]>(`/UserProfile/${id}`);
     console.log(response)
    return response.data;
}

const useJobs = (id:number) => {
   return useQuery<GetUser,Error>({
        queryKey : ['GetUserName' , id],
        queryFn : ()=>fetchUser(id),
        staleTime: 5 * 60 * 1000, 
        cacheTime: 30 * 60 * 1000, 
          retry: 2,    
    });
}
export default useJobs
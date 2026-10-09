import React from 'react'
import { useQueries, useQuery } from "@tanstack/react-query";
import api from '../../auth/api/axios';
type Props = {}

export interface Game {
    id: number,
    name: string,
    location: string,
    isAvailable: boolean,
    config?: GameConfig;
}
export interface GameConfig {
    id: number;
    gamesId: number;
    startTime: string;
    overTime: string;
    slotDuration: number;
    capacity: number;
}
const fetchGameWithConfigs = async (): Promise<Game[]> => {

    try{
        const gamesResponse = await api.get<Game[]>('/Game');
        if (!Array.isArray(gamesResponse.data)) {
            throw new Error("Invalid response: Expected an array of games");
        }
        const games = gamesResponse.data;
        
    }catch(err){

    }
}
const useGamesWithConfigs = (props: Props) => {
   return useQuery<Game[], Error>({
        queryKey: ['fetchGameWithConfigs'],
        queryFn: () => fetchGameWithConfigs(),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 2,
    });
}


export default useGamesWithConfigs;
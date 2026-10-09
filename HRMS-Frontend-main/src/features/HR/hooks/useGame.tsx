import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../auth/api/axios";

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
const fetchGame = async():Promise<Game[]>=>{
    try{
        const gamesResponse = await api.get<Game>('/Game'); 
        if (!Array.isArray(gamesResponse.data)) {
            throw new Error("Invalid response: Expected an array of games");
        }

        return gamesResponse.data;
    }catch(error){
        console.error("error occured" , error);
        throw error;
    }
}

const useGame = () =>{
    return useQuery<Game[], Error>({
        queryKey: ['fetchGame' ],
        queryFn: () => fetchGame(),
        staleTime: 1000 * 60 * 5,   
        gcTime: 1000 * 60 * 10,    
        refetchOnWindowFocus: false, 
        refetchOnMount: false,      
        retry: 2,
    });
}
export default  useGame;
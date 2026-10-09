import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../auth/api/axios";

export interface Configure {
    Id: number,
    GamesId: number,
    StartTime: string,
    OverTime: string,
    SlotDuration: number,
    Capacity: number,
}

const fetchGameConfig = async (gameId: number): Promise<Configure[]> => {
    try {
        const gamesResponse = await api.get<Configure[]>(`/GameConfig/${gameId}`);

        if (!Array.isArray(gamesResponse.data)) {
            throw new Error('Invalid response');
        }
        return gamesResponse.data;
    } catch (error) {
        console.error('Error occurred:', error);
        throw error;
    }
}

const useGameConfig = (gameId: number) => {
    return useQuery<Configure[], Error>({
        queryKey: ['gameConfig', gameId],
        queryFn: () => fetchGameConfig(gameId),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 2,
    });
};
export default useGameConfig;
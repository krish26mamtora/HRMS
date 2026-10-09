
import { useQuery } from '@tanstack/react-query';
import api from '../../auth/api/axios';

export interface GameSlot {
  id: number;
  gamesId: number;
  startTime: string; 
  endTime: string; 
  capacity: number;
  assigned: number;
  availableSeats: number;
  isBookingOpen: boolean; 
}

const fetchGameSlots = async (gameId: number, date: string): Promise<GameSlot[]> => {
  const response = await api.get<GameSlot[]>('/GameSlots/slots', {
    params: { id: gameId, dt: date },
  });
  return response.data;
};


const useGameSlots = (gameId: number, date: string) => {
  return useQuery<GameSlot[], Error>({
    queryKey: ['gameSlots', gameId, date], 
    queryFn: () => fetchGameSlots(gameId, date),
      enabled: !!gameId,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10,  
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export default useGameSlots;

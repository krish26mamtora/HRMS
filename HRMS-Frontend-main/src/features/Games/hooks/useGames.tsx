
import { useQuery } from '@tanstack/react-query';
import api from '../../auth/api/axios';


interface Game {
  id: number;
  name: string;
  location: string;
  isAvailable: string;
}

const fetchGames = async (): Promise<Game[]> => {
  const response = await api.get<Game[]>('/Game');
  console.log(response); 
  return response.data;
};

const useGames = () => {
  return useQuery<Game[], Error>({
    queryKey: ['games'], 
    queryFn: ()=>fetchGames(),
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false, 
    refetchOnMount: false,
    retry: 2,
  });
};

export default useGames;

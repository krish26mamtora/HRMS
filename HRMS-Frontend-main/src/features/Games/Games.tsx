import React from 'react'
import useGames from './hooks/useGames';
import { redirect, useNavigate } from 'react-router-dom';

interface Game {
  id: number;
  name: string;
  location: string;
  isAvailable: boolean | string;
}

type Props = {}

const Games = (props: Props) => {
  const userId = localStorage.getItem('id');
  const gotoMyBookings = () =>{
   
        navigate(`my-bookings/${userId}`);
    }
  const openConfiguration = () => {
    navigate('/hr/games/config');
  }
     const gotoMyWaitings = () =>{
   
    const userId = localStorage.getItem('id');
        navigate(`my-waitings/${userId}`);
    }
   const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGames();
  const isHr = localStorage.getItem('role')==='HR' ? true:false;
  const handleAction = (gameId: number) => {
    navigate(`${gameId}`);
  };
  if (isLoading) return <div className="p-4 text-center">Loading...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">Error: {(error)?.message}</div>;

  return (
   <>
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Games</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={()=>gotoMyBookings()}  className="mt-2 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors mr-4">My Bookings</button>
                <button onClick={()=>gotoMyWaitings()}  className="mt-2 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Waiting </button>
                {
                 isHr && 
                  <button className="mt-2 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors" onClick={() => { openConfiguration() }}>Configure</button>
               }  
            </div>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Game Name</th>
              <th scope="col" className="px-6 py-3">Location</th>
              <th scope="col" className="px-6 py-3">Availability</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((game: Game) => (
              <tr key={game.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {game.name}
                </td>
                <td className="px-6 py-4">
                  {game.location}
                </td>
                <td className="px-6 py-4">
                  {game.isAvailable ?
                    <span className="text-green-600">Available</span> :
                    <span className="text-red-600">Unavailable</span>
                  }
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleAction(game.id)} className="font-medium text-blue-600 hover:text-blue-800" >
                    Book
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
   </>
  )
}

export default Games;

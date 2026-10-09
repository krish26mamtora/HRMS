import React, { useEffect, useState } from 'react';
import useGame from '../hooks/useGame';
import useGameConfig from '../hooks/useGameConfig'; 
import type Game from '../hooks/useGame'; 
import api from '../../auth/api/axios';
import { useNavigate } from 'react-router-dom';

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
const GameConfig = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<any>(null);

    const fetchAllData = async () => {
        setIsLoading(true);
        try{
            const gamesRes = await api.get<Game[]>('/Game');
            const gamesList = gamesRes.data;
            
            const combinedData = await Promise.all(
                gamesList.map( async (game)=>{
                    try{
                        const configRes = await api.get<GameConfig>(`/GameConfig/${game.id}`);
                        return { ...game , config:configRes.data};
                    }catch(err){
                        return { ...game, config: undefined };
                    }
                })
            );
            setGames(combinedData);
            setError(null);
        }catch(err:any){
            setError(err.message || "Failed to load games");
        }   
    }

    useEffect(()=>{
        fetchAllData();
    },[])
    
    const startEditing = (game:Game) => {
        setEditingId(game.id);
        setFormData({ ...game.config }); 
    };
     const handleInputChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numval = (name==='slotDuration' || name==='capacity') ? Number(value):value;
        setFormData({ ...formData,[name]:numval });
    };

    const updateConfig =  async()=>{
        try{
            await api.put(`/GameConfig/${formData.id}`, formData);
            setGames(games.map(g=>g.id===editingId?{...g,config:formData}:g));
            setEditingId(null);
            alert("Slot Configured");
        }catch(err){
             alert("Failed to modify configuration");
        }
    };
    const navigateBack = ()=>{
  var role = (localStorage.getItem('role')=="HR")?'hr':(localStorage.getItem('role')=="Employee"?"employee":'manager');
  navigate(`/${role}/games`);
}
    return (
        <div>
             <h1 className="text-2xl font-bold mb-4">Game Configuration</h1>
            <button onClick={() => navigateBack()} className="mb-4 text-blue-600 underline">Back</button>

              <div className="mt-5 relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                <table id="search-table" className="w-full text-sm text-left rtl:text-right text-body">
                    <thead className="bg-neutral-secondary-soft border-b border-default">
                        <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                              <th className="px-6 py-3 font-medium">Location</th>
                            <th className="px-6 py-3 font-medium">isAvailable </th>
                              <th className="px-6 py-3 font-medium">Start Time</th>
                            <th className="px-6 py-3 font-medium">End Time </th>
                                <th className="px-6 py-3 font-medium">Slot Duration (Min)</th>
                            <th className="px-6 py-3 font-medium">Slot Capacity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games?.map((game, index) => (
                            <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                                <td className="px-6 py-4">{game.name}</td>
                                <td className="px-6 py-4">{game.location}</td>
                                <td className="px-6 py-4">{game.isAvailable?"Yes":"No"}</td>
                                   <td className="px-4 py-2">
                                        <EditableCell name="startTime" type="time" isEditing={editingId === game.id} value={(editingId === game.id) ? formData?.startTime : game.config?.startTime} onChange={handleInputChanges} />
                                    </td>
                                    <td className="px-4 py-2">
                                        <EditableCell name="overTime" type="time" isEditing={editingId === game.id} value={(editingId === game.id) ? formData?.overTime : game.config?.overTime} onChange={handleInputChanges} />
                                    </td>
                                    <td className="px-4 py-2">
                                        <EditableCell name="slotDuration" type="number" isEditing={editingId === game.id} value={(editingId === game.id) ? formData?.slotDuration : game.config?.slotDuration} onChange={handleInputChanges} />
                                    </td>
                                    <td className="px-4 py-2">
                                        <EditableCell name="capacity" type="number" isEditing={editingId === game.id} value={(editingId === game.id) ? formData?.capacity : game.config?.capacity} onChange={handleInputChanges} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {(editingId === game.id)?(
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={updateConfig} className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm">Save</button>
                                                <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs border">Cancel</button>
                                            </div>
                                        ):(
                                            <button onClick={() => startEditing(game)} className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
                                                Edit
                                            </button>
                                        )}
                                    </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
const EditableCell = ({ name, type, isEditing, value, onChange }: any) => (
    isEditing ? (
        <input type={type} name={name} value={value || ""} onChange={onChange} className="w-full p-1 border-2 border-blue-100 rounded focus:border-blue-500 outline-none" />
    ):(
        <p className="text-gray-800 font-medium">{value || "--"}</p>
    )
);
export default GameConfig;

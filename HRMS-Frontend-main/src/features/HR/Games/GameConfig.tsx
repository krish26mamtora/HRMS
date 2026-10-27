import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../auth/api/axios";
import { useNavigate } from "react-router-dom";

export interface Game {
  id: number;
  name: string;
  location: string;
  isAvailable: boolean;
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
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<
    (Omit<GameConfig, "id"> & { id?: number }) | null
  >(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [gamesRes, configs] = await Promise.all([
        api.get<Game[]>("/Game"),
        api
          .get<GameConfig[]>("/GameConfig")
          .then((response) => response.data)
          .catch((requestError: unknown) => {
            if (
              axios.isAxiosError(requestError) &&
              requestError.response?.status === 404
            ) {
              return [];
            }
            throw requestError;
          }),
      ]);
      const combinedData = gamesRes.data.map((game) => ({
        ...game,
        config: configs.find((config) => config.gamesId === game.id),
      }));
      setGames(combinedData);
      setError(null);
    } catch (fetchError: unknown) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load games",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const startEditing = (game: Game) => {
    setEditingId(game.id);
    setError(null);
    setFormData(
      game.config
        ? { ...game.config }
        : {
            gamesId: game.id,
            startTime: "",
            overTime: "",
            slotDuration: 30,
            capacity: 1,
          },
    );
  };
  const handleInputChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numval =
      name === "slotDuration" || name === "capacity" ? Number(value) : value;
    setFormData((current) =>
      current ? { ...current, [name]: numval } : current,
    );
  };

  const updateConfig = async () => {
    if (
      !formData ||
      !formData.startTime ||
      !formData.overTime ||
      formData.slotDuration <= 0 ||
      formData.capacity < 1 ||
      formData.capacity > 10
    ) {
      setError(
        "Enter valid start and end times, a positive slot duration, and a capacity between 1 and 10.",
      );
      return;
    }

    try {
      const { id, ...configValues } = formData;
      let savedConfig: GameConfig;
      if (id === undefined) {
        const response = await api.post<GameConfig>(
          "/GameConfig",
          configValues,
        );
        savedConfig = response.data;
      } else {
        await api.put(`/GameConfig/${id}`, formData);
        savedConfig = { ...formData, id };
      }
      setGames((currentGames) =>
        currentGames.map((game) =>
          game.id === editingId ? { ...game, config: savedConfig } : game,
        ),
      );
      setEditingId(null);
      setFormData(null);
      setError(null);
      alert("Slot Configured");
    } catch (saveError: unknown) {
      const serverMessage = axios.isAxiosError(saveError)
        ? (saveError.response?.data?.title ?? saveError.response?.data?.message)
        : undefined;
      setError(
        typeof serverMessage === "string"
          ? serverMessage
          : saveError instanceof Error
            ? saveError.message
            : "Failed to modify configuration",
      );
    }
  };
  const navigateBack = () => {
    const role =
      localStorage.getItem("role") == "HR"
        ? "hr"
        : localStorage.getItem("role") == "Employee"
          ? "employee"
          : "manager";
    navigate(`/${role}/games`);
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Game Configuration</h1>
      <button
        onClick={() => navigateBack()}
        className="mb-4 text-blue-600 underline"
      >
        Back
      </button>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}
      {isLoading && (
        <p className="mb-4 text-sm text-slate-600">Loading games...</p>
      )}

      <div className="mt-5 relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
        <table
          id="search-table"
          className="w-full text-sm text-left rtl:text-right text-body"
        >
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
              <tr
                key={index}
                className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default"
              >
                <td className="px-6 py-4">{game.name}</td>
                <td className="px-6 py-4">{game.location}</td>
                <td className="px-6 py-4">{game.isAvailable ? "Yes" : "No"}</td>
                <td className="px-4 py-2">
                  <EditableCell
                    name="startTime"
                    type="time"
                    isEditing={editingId === game.id}
                    value={
                      editingId === game.id
                        ? formData?.startTime
                        : game.config?.startTime
                    }
                    onChange={handleInputChanges}
                  />
                </td>
                <td className="px-4 py-2">
                  <EditableCell
                    name="overTime"
                    type="time"
                    isEditing={editingId === game.id}
                    value={
                      editingId === game.id
                        ? formData?.overTime
                        : game.config?.overTime
                    }
                    onChange={handleInputChanges}
                  />
                </td>
                <td className="px-4 py-2">
                  <EditableCell
                    name="slotDuration"
                    type="number"
                    isEditing={editingId === game.id}
                    value={
                      editingId === game.id
                        ? formData?.slotDuration
                        : game.config?.slotDuration
                    }
                    onChange={handleInputChanges}
                  />
                </td>
                <td className="px-4 py-2">
                  <EditableCell
                    name="capacity"
                    type="number"
                    isEditing={editingId === game.id}
                    value={
                      editingId === game.id
                        ? formData?.capacity
                        : game.config?.capacity
                    }
                    onChange={handleInputChanges}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  {editingId === game.id ? (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={updateConfig}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs border"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(game)}
                      className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
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
const EditableCell = ({
  name,
  type,
  isEditing,
  value,
  onChange,
}: {
  name: string;
  type: "time" | "number";
  isEditing: boolean;
  value: string | number | undefined;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) =>
  isEditing ? (
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      className="w-full p-1 border-2 border-blue-100 rounded focus:border-blue-500 outline-none"
    />
  ) : (
    <p className="text-gray-800 font-medium">{value ?? "--"}</p>
  );
export default GameConfig;

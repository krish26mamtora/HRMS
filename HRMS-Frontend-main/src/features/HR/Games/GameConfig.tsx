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

interface GameCycle {
  cycleId: number;
  gamesId: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
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
  const [cycles, setCycles] = useState<GameCycle[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [cycleStartTime, setCycleStartTime] = useState("");
  const [cycleEndTime, setCycleEndTime] = useState("");
  const [cycleError, setCycleError] = useState<string | null>(null);
  const [cycleLoadError, setCycleLoadError] = useState<string | null>(null);
  const [cycleSuccess, setCycleSuccess] = useState<string | null>(null);
  const [isStartingCycle, setIsStartingCycle] = useState(false);
  const [generatingSlotsFor, setGeneratingSlotsFor] = useState<number | null>(
    null,
  );
  const [slotGenerationMessage, setSlotGenerationMessage] = useState<
    string | null
  >(null);
  const [slotGenerationError, setSlotGenerationError] = useState<string | null>(
    null,
  );

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const gamesRes = await api.get<Game[]>("/Game");
      setGames(gamesRes.data);
      setSelectedGameId((currentGameId) =>
        gamesRes.data.some((game) => game.id === Number(currentGameId))
          ? currentGameId
          : gamesRes.data[0]
            ? String(gamesRes.data[0].id)
            : "",
      );
      setError(null);

      try {
        const configsRes = await api.get<GameConfig[]>("/GameConfig");
        setGames(
          gamesRes.data.map((game) => ({
            ...game,
            config: configsRes.data.find(
              (config) => config.gamesId === game.id,
            ),
          })),
        );
      } catch (configError: unknown) {
        if (
          !(
            axios.isAxiosError(configError) &&
            configError.response?.status === 404
          )
        ) {
          setError(
            `Games loaded, but configurations could not be loaded: ${
              configError instanceof Error
                ? configError.message
                : "Unknown error"
            }`,
          );
        }
      }

      try {
        const cyclesRes = await api.get<GameCycle[]>("/GameCycle");
        setCycles(cyclesRes.data);
        setCycleLoadError(null);
      } catch (cycleFetchError: unknown) {
        const status = axios.isAxiosError(cycleFetchError)
          ? cycleFetchError.response?.status
          : undefined;
        setCycleLoadError(
          status === 405
            ? "Current cycles are unavailable because the running backend does not expose GET /api/GameCycle. Restart the backend so it loads the updated API."
            : `Games loaded, but current cycles could not be loaded: ${
                cycleFetchError instanceof Error
                  ? cycleFetchError.message
                  : "Unknown error"
              }`,
        );
      }
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

  const startGameCycle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const startDate = new Date(cycleStartTime);
    const endDate = new Date(cycleEndTime);

    if (
      !selectedGameId ||
      !cycleStartTime ||
      !cycleEndTime ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      setCycleError("Choose a game and a valid end date/time after the start.");
      setCycleSuccess(null);
      return;
    }

    setIsStartingCycle(true);
    setCycleError(null);
    setCycleSuccess(null);
    try {
      const response = await api.post<GameCycle>("/GameCycle", {
        gamesId: Number(selectedGameId),
        startTime: cycleStartTime,
        endTime: cycleEndTime,
        isActive: true,
      });
      setCycles((currentCycles) => [
        ...currentCycles.map((cycle) =>
          cycle.gamesId === response.data.gamesId
            ? { ...cycle, isActive: false }
            : cycle,
        ),
        response.data,
      ]);
      setCycleStartTime("");
      setCycleEndTime("");
      setCycleSuccess("Game cycle started successfully.");
    } catch (saveError: unknown) {
      const serverMessage = axios.isAxiosError(saveError)
        ? (saveError.response?.data?.title ?? saveError.response?.data?.message)
        : undefined;
      setCycleError(
        typeof serverMessage === "string"
          ? serverMessage
          : saveError instanceof Error
            ? saveError.message
            : "Failed to start game cycle.",
      );
    } finally {
      setIsStartingCycle(false);
    }
  };

  const generateGameSlots = async (gameId: number) => {
    setGeneratingSlotsFor(gameId);
    setSlotGenerationMessage(null);
    setSlotGenerationError(null);
    try {
      const response = await api.post<{ generatedSlots: number }>(
        `/GameSlots/${gameId}`,
      );
      setSlotGenerationMessage(
        `${response.data.generatedSlots} game slot${response.data.generatedSlots === 1 ? "" : "s"} generated.`,
      );
    } catch (generationError: unknown) {
      const serverMessage = axios.isAxiosError(generationError)
        ? (generationError.response?.data?.message ??
          generationError.response?.data?.title)
        : undefined;
      setSlotGenerationError(
        typeof serverMessage === "string"
          ? serverMessage
          : generationError instanceof Error
            ? generationError.message
            : "Failed to generate game slots.",
      );
    } finally {
      setGeneratingSlotsFor(null);
    }
  };

  const activeCycles = games.map((game) => ({
    game,
    cycle: cycles
      .filter((cycle) => cycle.gamesId === game.id && cycle.isActive)
      .sort(
        (first, second) =>
          new Date(second.startTime).getTime() -
          new Date(first.startTime).getTime(),
      )[0],
  }));

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

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Start a game cycle
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose a game and set when its cycle should begin and end. Starting a
          new cycle makes it the active cycle for that game.
        </p>
        <form
          onSubmit={startGameCycle}
          className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4 md:items-end"
        >
          <label className="text-sm font-medium text-slate-700">
            Game
            <select
              value={selectedGameId}
              onChange={(event) => setSelectedGameId(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-300 p-2"
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Start date and time
            <input
              type="datetime-local"
              value={cycleStartTime}
              onChange={(event) => setCycleStartTime(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-300 p-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            End date and time
            <input
              type="datetime-local"
              value={cycleEndTime}
              onChange={(event) => setCycleEndTime(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-300 p-2"
            />
          </label>
          <button
            type="submit"
            disabled={isStartingCycle || games.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStartingCycle ? "Starting..." : "Start cycle"}
          </button>
        </form>
        {cycleError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {cycleError}
          </p>
        )}
        {cycleSuccess && (
          <p role="status" className="mt-3 text-sm text-green-700">
            {cycleSuccess}
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          Current game cycles
        </h2>
        {cycleLoadError && (
          <p role="alert" className="mb-3 text-sm text-amber-700">
            {cycleLoadError}
          </p>
        )}
        {slotGenerationMessage && (
          <p role="status" className="mb-3 text-sm text-green-700">
            {slotGenerationMessage}
          </p>
        )}
        {slotGenerationError && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {slotGenerationError}
          </p>
        )}
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Game</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeCycles.map(({ game, cycle }) => (
                <tr key={game.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {game.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {cycleLoadError
                      ? "--"
                      : cycle
                        ? new Date(cycle.startTime).toLocaleString()
                        : "--"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {cycleLoadError
                      ? "--"
                      : cycle
                        ? new Date(cycle.endTime).toLocaleString()
                        : "--"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        cycleLoadError
                          ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
                          : cycle
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {cycleLoadError
                        ? "Unavailable"
                        : cycle
                          ? "Active"
                          : "No active cycle"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {cycle && (
                      <button
                        type="button"
                        onClick={() => generateGameSlots(game.id)}
                        disabled={generatingSlotsFor !== null}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {generatingSlotsFor === game.id
                          ? "Generating..."
                          : "Generate slots"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {activeCycles.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No games found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
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

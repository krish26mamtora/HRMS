import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../auth/api/axios";

interface WaitingEntry {
  queueId: number;
  slotId: number;
  slotStartTime: string;
  slotEndTime: string;
  status: string;
}

const GAME_TIME_ZONE = "Asia/Kolkata";

const formatSlotDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: GAME_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatSlotTime = (start: string, end: string) => {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: GAME_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
};

const MyWating = () => {
  const handleCancel = (bookingId: number) => {};
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [waitings, setWaitings] = useState<WaitingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWaitings = async () => {
      try {
        setLoading(true);
        const response = await api.get<WaitingEntry[]>(`/WaitingQueue/user/${userId}`);
        setWaitings(response.data);
        console.log(response.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(
            `Error: ${err.response.status} - ${err.response.statusText}`,
          );
        } else {
          setError("An unexpected error occurred");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchWaitings();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-4 text-blue-500">Loading your Waiting slots...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Waiting Slots</h1>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 underline"
      >
        Back
      </button>

      {waitings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left text-gray-600">Slot</th>
                <th className="px-4 py-2 text-left text-gray-600">Slot Date</th>
                <th className="px-4 py-2 text-left text-gray-600">Slot Time</th>
                <th className="px-4 py-2 text-left text-gray-600">Status</th>
                <th className="px-4 py-2 text-left text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {waitings.map((waiting) => (
                <tr key={waiting.queueId} className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-2 font-medium">
                    {waiting.slotId || "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {formatSlotDate(waiting.slotStartTime)}
                  </td>
                  <td className="px-4 py-2">
                    {formatSlotTime(waiting.slotStartTime, waiting.slotEndTime)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${waiting.status === "Waiting" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                    >
                      {waiting.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleCancel(waiting.queueId)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-4 text-gray-500">
          No entries found in the waiting queue.
        </p>
      )}
    </div>
  );
};
export default MyWating;

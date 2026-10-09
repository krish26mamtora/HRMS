import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../auth/api/axios';

interface Booking {
  bId: number;
  slotId: number;
  bookedBy: number;
  status: string;
  bookedAt: string;
  slotPlayed: boolean;
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get<Booking[]>(`/Booking/user/${userId}`);
        setBookings(response.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(`Error: ${err.response.status} - ${err.response.statusText}`);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  const handleCompleteSlot = async (slotId: number, bookingId: number) => {
    if (!window.confirm("Mark this game as completed?")) return;

    try {
      await api.post(`/Booking/slot/${slotId}/complete`);
      
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.bId === bookingId ? { ...b, slotPlayed: true } : b
        )
      );
      alert("Slot marked as completed!");
    } catch (err) {
      console.error("Failed to complete slot", err);
      alert("Error updating slot status.");
    }
  };
    const handleCancleSlot = async (slotId: number, bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel this slot?")) return;

    try {
      await api.put(`/Booking/cancel/${slotId}`);
      
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.bId === bookingId ? { ...b, status: "Cancelled" } : b
        )
      );
      alert("Slot marked as Cancelled!");
    } catch (err) {
      console.error("Failed to Cancel slot", err);
      alert("Error updating slot status.");
    }
  };
  
  if (loading) return <div className="p-4 text-blue-500">Loading bookings...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
     <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 underline">Back</button>

      {bookings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left text-gray-600">Booking ID</th>
                <th className="px-4 py-2 text-left text-gray-600">Slot ID</th>
                <th className="px-4 py-2 text-left text-gray-600">Status</th>
                <th className="px-4 py-2 text-left text-gray-600">Booked At</th>
                <th className="px-4 py-2 text-left text-gray-600">Slot Played</th>
                <th className="px-4 py-2 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.bId} className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-2">{booking.bId}</td>
                  <td className="px-4 py-2">{booking.slotId}</td>
                  <td className={`px-4 py-2 font-semibold ${booking.status === 'Booked' ? 'text-green-600' : 'text-red-600'}`}>
                    {booking.status}
                  </td>
                  <td className="px-4 py-2">{new Date(booking.bookedAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm ${booking.slotPlayed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {booking.slotPlayed ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
           
                    {!booking.slotPlayed && (
                      <button disabled={booking.status=="Completed" || booking.status=="Cancelled"} onClick={() => handleCompleteSlot(booking.slotId, booking.bId)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm" >
                        Complete
                      </button>
                    )}
                    <button  disabled={booking.status=="Completed" || booking.status=="Cancelled"} onClick={() => handleCancleSlot(booking.slotId, booking.bId)}  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"> Cancel  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-4 text-gray-500">No bookings found.</p>
      )}
    </div>
  );
};

export default MyBookings;
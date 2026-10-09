import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGameSlots, { type GameSlot } from "./hooks/useGameSlots";
import useCreateBooking from "./hooks/useCreateBooking";
import useProfile from "../OrgChart/hooks/useProfile";


interface UserBookingDetail {
  userId: number;
  status: string;
  message: string;
}

const GameDetails = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { data: allEmployees } = useProfile();
  
  const [bookingResults, setBookingResults] = useState<UserBookingDetail[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GameSlot | null>(null);
  const [displayMessage, notifyUser] = useState<string | null>(null);

  const getInitialDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    if (dayOfWeek === 6) today.setDate(today.getDate() + 2);
    else if (dayOfWeek === 0) today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  const [userIds, setUserIds] = useState<number[]>([0]);
  const [userSearchTerms, setUserSearchTerms] = useState<string[]>([""]);

  const loggedInUserId = localStorage.getItem('id');
  const { data: slots, isLoading } = useGameSlots(gameId, selectedDate);
  const createBookingMutation = useCreateBooking();

  const handleAddUser = () => {
    const availableSeats = selectedSlot ? selectedSlot.capacity - selectedSlot.assigned:0;
    if (userIds.length >= availableSeats) {
      alert(`You can only add ${availableSeats} users for this slot.`);
      return;
    }
    setUserIds([...userIds, 0]);
    setUserSearchTerms([...userSearchTerms, ""]);
  };

  const handleSelectUser = (index: number, emp: any) => {
    const updatedIds = [...userIds];
    updatedIds[index] = emp.userProfileId;
    setUserIds(updatedIds);

    const updatedTerms = [...userSearchTerms];
    updatedTerms[index] = `${emp.firstName} ${emp.lastName}`;
    setUserSearchTerms(updatedTerms);
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setBookingResults([]); 
    notifyUser("Processing...");

    try {
      const result = await createBookingMutation.mutateAsync({
        SlotId: selectedSlot.id,
        BookedBy: Number(loggedInUserId),
        status: "Pending",
        userIds: userIds.filter(id => id > 0)
      });

      if (result && result.userResults) {
        setBookingResults(result.userResults);
        notifyUser(null); 
      } else {
        notifyUser("Booking completed with no specific status messages.");
      }
    } catch (error: any) {
      notifyUser("Connection error. Please try again.");
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const todayDate = new Date().toISOString().split("T")[0];
    if (e.target.value < todayDate) {
      alert("You cannot select a past date.");
      return;
    }
    const day = new Date(e.target.value).getDay();
    if (day === 0 || day === 6) {
      alert("Only Monday to Friday allowed.");
      return;
    }
    setSelectedDate(e.target.value);
  };
const navigateBack = ()=>{
  var role = (localStorage.getItem('role')=="HR")?'hr':(localStorage.getItem('role')=="Employee"?"employee":'manager');
  navigate(`/${role}/games`);
}
  return (
    <div className="p-6">
      <button onClick={() => navigateBack()} className="mb-4 text-blue-600 underline">Back</button>
      <div className="flex justify-between">
        <h1 className="text-xl font-bold mb-4">Book Slot</h1>
        <input type="date" value={selectedDate} onChange={handleDateChange} className="border p-2 rounded mb-6" />
      </div>

      <div className="flex gap-4 mb-4 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Open</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Full</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Closed</div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
        {slots?.map((slot, index) => {
          const isFull = slot.capacity - slot.assigned === 0;
          const now = new Date();
          const endTime = new Date(slot.endTime);
          const isPast = endTime < now;
          const isOpen = slot.isBookingOpen && !isPast;

         let bgColor = !isOpen ? "bg-red-500 hover:bg-red-600" : isFull ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600";
          return (
            <div key={slot.id} onClick={() => {  if (isOpen) {setSelectedSlot(slot);  setBookingResults([]);}}} className={`group relative flex items-center justify-center aspect-square rounded shadow-md cursor-pointer transition-all transform hover:scale-110 text-white font-bold ${bgColor}`}> 
              {index + 1}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-48 bg-gray-900 text-white text-[10px] p-2 rounded shadow-xl pointer-events-none">
                <p>Start: {slot.startTime.replace('T', ' ').substring(0, 16)}</p>
                <p>Ends: {slot.endTime.replace('T', ' ').substring(0, 16)}</p>
                <p>Available: {slot.capacity - slot.assigned}</p>
                <p className="mt-1 border-t border-gray-700 pt-1">Status: {isOpen ? "Open" : "Closed"}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">Slot Details</h2>

            <div className="text-sm mb-4 grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded">
              <div>Capacity: {selectedSlot.capacity}</div>
              <div>Available: {selectedSlot.capacity - selectedSlot.assigned}</div>
              <div className="col-span-2">Time: {selectedSlot.startTime.replace('T', ' ').substring(11, 16)} - {selectedSlot.endTime.replace('T', ' ').substring(11, 16)}</div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-visible mb-2">
              {userIds.map((id, index) => (
                <div key={index} className="relative flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search Player Name..."
                      value={userSearchTerms[index]}
                      onChange={(e) => {
                        const newTerms = [...userSearchTerms];
                        newTerms[index] = e.target.value;
                        setUserSearchTerms(newTerms);
                        const newIds = [...userIds];
                        newIds[index] = 0;
                        setUserIds(newIds);
                      }}
                      className="w-full border p-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {userSearchTerms[index].length > 0 && id === 0 && (
                      <ul className="absolute left-0 right-0 z-[100] bg-white border border-blue-400 rounded shadow-xl max-h-48 overflow-y-auto mt-1">
                        {allEmployees?.filter(emp => `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(userSearchTerms[index].toLowerCase()))
                          .map(emp => (
                            <li key={emp.userProfileId} onMouseDown={(e) => { e.preventDefault(); handleSelectUser(index, emp); }} className="p-3 hover:bg-blue-100 cursor-pointer text-sm border-b">
                              <div className="font-bold">{emp.firstName} {emp.lastName}</div>
                              <div className="text-gray-500 text-[11px]">{emp.designation} | ID: {emp.userProfileId}</div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                  {userIds.length > 1 && (
                    <button onClick={() => {
                      setUserIds(userIds.filter((_, i) => i !== index));
                      setUserSearchTerms(userSearchTerms.filter((_, i) => i !== index));
                    }} className="p-2 text-red-500"> ✕ </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={handleAddUser} disabled={userIds.length >= 4} className={`text-sm underline mb-4 ${userIds.length >= 4 ? 'text-gray-400' : 'text-blue-600'}`}>
              {userIds.length >= 4 ? "Maximum 4 users reached" : "+ Add Another User"}
            </button>

            {bookingResults.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 max-h-48 overflow-y-auto">
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">Status Update:</h4>
                <ul className="space-y-2">
                  {bookingResults.map((res, index) => (
                    <li key={index}>
                      <div className="flex justify-between text-xs font-bold">
                        <span>User {res.userId}</span>
                        <span className={res.status === 'Failed' ? 'text-red-700' : 'text-green-700'}>{res.status}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{res.message}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displayMessage && <div className="mb-4 text-sm text-center font-medium text-blue-600 animate-pulse">{displayMessage}</div>}

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => { setSelectedSlot(null); setBookingResults([]); notifyUser(null); }} className="px-4 py-2 bg-gray-200 rounded">Close</button>
              <button onClick={handleSubmit} disabled={createBookingMutation.isPending} className="px-4 py-2 bg-green-600 text-white rounded font-bold">
                {createBookingMutation.isPending ? "Validating..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;
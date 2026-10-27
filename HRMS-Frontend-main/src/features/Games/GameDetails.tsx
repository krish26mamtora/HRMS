import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useGameSlots, { type GameSlot } from "./hooks/useGameSlots";
import useCreateBooking from "./hooks/useCreateBooking";
import useProfile from "../OrgChart/hooks/useProfile";

interface UserBookingDetail {
  userId: number;
  status: string;
  message: string;
}

const GAME_TIME_ZONE = "Asia/Kolkata";

const getDateInGameTimeZone = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GAME_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find((datePart) => datePart.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
};

const formatGameDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: GAME_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));

const formatGameTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: GAME_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));

const GameDetails = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { data: allEmployees } = useProfile();

  const [bookingResults, setBookingResults] = useState<UserBookingDetail[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GameSlot | null>(null);
  const [displayMessage, notifyUser] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const getInitialDate = () => {
    const today = getDateInGameTimeZone(new Date());
    const [year, month, day] = today.split("-").map(Number);
    const nextWeekday = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = nextWeekday.getUTCDay();
    if (dayOfWeek === 6) nextWeekday.setUTCDate(nextWeekday.getUTCDate() + 2);
    else if (dayOfWeek === 0)
      nextWeekday.setUTCDate(nextWeekday.getUTCDate() + 1);
    return getDateInGameTimeZone(nextWeekday);
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  const [userIds, setUserIds] = useState<number[]>([0]);
  const [userSearchTerms, setUserSearchTerms] = useState<string[]>([""]);

  const loggedInUserId = localStorage.getItem("id");
  const parsedGameId = gameId ? Number(gameId) : 0;
  const {
    data: slots,
    isLoading,
    refetch,
  } = useGameSlots(parsedGameId, selectedDate);
  const sortedSlots = [...(slots ?? [])].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
  const createBookingMutation = useCreateBooking();

  const getAvailableSeats = (slot: GameSlot) =>
    Math.max(0, slot.capacity - slot.assigned);

  const handleOpenSlot = async (slot: GameSlot) => {
    setSelectedSlot(slot);
    setBookingResults([]);
    notifyUser(null);

    const refreshedSlots = await refetch();
    const currentSlot = refreshedSlots.data?.find(
      (refreshedSlot) => refreshedSlot.id === slot.id,
    );
    if (currentSlot) {
      setSelectedSlot(currentSlot);
    }
  };

  const handleAddUser = () => {
    if (userIds.length >= 4) {
      alert("You can add up to 4 users for this slot.");
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
    const selectedUserIds = userIds.filter((id) => id > 0);
    if (selectedUserIds.length === 0) {
      notifyUser("Select at least one player before submitting.");
      return;
    }

    setBookingResults([]);
    setBookingError(null);
    notifyUser("Processing...");

    try {
      const result = await createBookingMutation.mutateAsync({
        SlotId: selectedSlot.id,
        BookedBy: Number(loggedInUserId),
        Status: "Pending",
        userIds: selectedUserIds,
      });

      if (result && result.userResults) {
        setBookingResults(result.userResults);
        notifyUser(null);
      } else {
        notifyUser("Booking completed with no specific status messages.");
      }
      const refreshedSlots = await refetch();
      const currentSlot = refreshedSlots.data?.find(
        (slot) => slot.id === selectedSlot.id,
      );
      if (currentSlot) {
        setSelectedSlot(currentSlot);
      }
    } catch (error: unknown) {
      const responseData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const serverMessage =
        typeof responseData === "string"
          ? responseData
          : typeof responseData?.message === "string"
            ? responseData.message
            : typeof responseData?.title === "string"
              ? responseData.title
              : undefined;
      setBookingError(
        serverMessage ??
          (axios.isAxiosError(error) && error.response
            ? `Booking failed (${error.response.status}). Please try again.`
            : error instanceof Error
              ? error.message
              : "Unable to submit the booking request."),
      );
      notifyUser(null);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const todayDate = getDateInGameTimeZone(new Date());
    if (e.target.value < todayDate) {
      alert("You cannot select a past date.");
      return;
    }
    const day = new Date(`${e.target.value}T00:00:00Z`).getUTCDay();
    if (day === 0 || day === 6) {
      alert("Only Monday to Friday allowed.");
      return;
    }
    setSelectedDate(e.target.value);
  };
  const navigateBack = () => {
    var role =
      localStorage.getItem("role") == "HR"
        ? "hr"
        : localStorage.getItem("role") == "Employee"
          ? "employee"
          : "manager";
    navigate(`/${role}/games`);
  };
  return (
    <div className="p-6">
      <button
        onClick={() => navigateBack()}
        className="mb-4 text-blue-600 underline"
      >
        Back
      </button>
      <div className="flex justify-between">
        <h1 className="text-xl font-bold mb-4">Book Slot</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border p-2 rounded mb-6"
        />
      </div>

      <div className="flex gap-4 mb-4 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded"></span> All seats
          available
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-amber-500 rounded"></span> Partially
          booked
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-500 rounded"></span> Full
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded"></span> Closed
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
        {isLoading && <p className="col-span-full">Loading slots...</p>}
        {sortedSlots.map((slot) => {
          const isFull = slot.assigned >= slot.capacity;
          const now = new Date();
          const endTime = new Date(slot.endTime);
          const isPast = endTime < now;
          const isOpen = slot.isBookingOpen && !isPast;

          let bgColor = !isOpen
            ? "bg-red-500 hover:bg-red-600"
            : isFull
              ? "bg-yellow-500 hover:bg-yellow-600"
              : slot.assigned > 0
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-green-500 hover:bg-green-600";
          return (
            <div
              key={slot.id}
              onClick={() => {
                void handleOpenSlot(slot);
              }}
              className={`group relative flex items-center justify-center aspect-square rounded shadow-md cursor-pointer transition-all transform hover:scale-110 text-white font-bold ${bgColor}`}
            >
              <span className="text-center text-xs leading-tight">
                {formatGameTime(slot.startTime)}
              </span>
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-48 bg-gray-900 text-white text-[10px] p-2 rounded shadow-xl pointer-events-none">
                <p>Start: {formatGameDateTime(slot.startTime)}</p>
                <p>Ends: {formatGameDateTime(slot.endTime)}</p>
                <p>Booked: {slot.assigned}</p>
                <p>Available: {getAvailableSeats(slot)}</p>
                <p className="mt-1 border-t border-gray-700 pt-1">
                  Status: {isOpen ? "Open" : "Closed"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">
              Slot Details
            </h2>

            <div className="text-sm mb-4 grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded">
              <div>Capacity: {selectedSlot.capacity}</div>
              <div>Booked: {selectedSlot.assigned}</div>
              <div>Available: {getAvailableSeats(selectedSlot)}</div>
              <div className="col-span-2">
                Time: {formatGameTime(selectedSlot.startTime)} -{" "}
                {formatGameTime(selectedSlot.endTime)}
              </div>
            </div>
            {getAvailableSeats(selectedSlot) === 0 && (
              <p className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                This slot is full. You can still submit a request; eligible
                players will be added to the waiting queue.
              </p>
            )}

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
                        {allEmployees
                          ?.filter((emp) =>
                            `${emp.firstName} ${emp.lastName}`
                              .toLowerCase()
                              .includes(userSearchTerms[index].toLowerCase()),
                          )
                          .map((emp) => (
                            <li
                              key={emp.userProfileId}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectUser(index, emp);
                              }}
                              className="p-3 hover:bg-blue-100 cursor-pointer text-sm border-b"
                            >
                              <div className="font-bold">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="text-gray-500 text-[11px]">
                                {emp.designation} | ID: {emp.userProfileId}
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                  {userIds.length > 1 && (
                    <button
                      onClick={() => {
                        setUserIds(userIds.filter((_, i) => i !== index));
                        setUserSearchTerms(
                          userSearchTerms.filter((_, i) => i !== index),
                        );
                      }}
                      className="p-2 text-red-500"
                    >
                      {" "}
                      ✕{" "}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAddUser}
              disabled={userIds.length >= 4}
              className={`text-sm underline mb-4 ${userIds.length >= 4 ? "text-gray-400" : "text-blue-600"}`}
            >
              {userIds.length >= 4
                ? "Maximum 4 users reached"
                : "+ Add Another User"}
            </button>

            {bookingResults.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 max-h-48 overflow-y-auto">
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">
                  Status Update:
                </h4>
                <ul className="space-y-2">
                  {bookingResults.map((res, index) => (
                    <li key={index}>
                      <div className="flex justify-between text-xs font-bold">
                        <span>User {res.userId}</span>
                        <span
                          className={
                            res.status === "Failed"
                              ? "text-red-700"
                              : res.status === "Waiting"
                                ? "text-amber-700"
                                : "text-green-700"
                          }
                        >
                          {res.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {res.status === "Waiting"
                          ? `Added to waiting queue. ${res.message}`
                          : res.message}
                      </p>
                    </li>
                  ))}
                </ul>
                {bookingResults.some((result) => result.status === "Waiting") && (
                  <p className="mt-3 border-t border-gray-200 pt-3 text-sm font-medium text-amber-800">
                    One or more players are in the waiting queue and may be
                    promoted if seats become available.
                  </p>
                )}
              </div>
            )}

            {bookingError && (
              <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {bookingError}
              </p>
            )}

            {displayMessage && (
              <div className="mb-4 text-sm text-center font-medium text-blue-600 animate-pulse">
                {displayMessage}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  setBookingResults([]);
                  setBookingError(null);
                  notifyUser(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  createBookingMutation.isPending ||
                  !selectedSlot.isBookingOpen
                }
                className="px-4 py-2 bg-green-600 text-white rounded font-bold"
              >
                {createBookingMutation.isPending
                  ? "Validating..."
                  : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;

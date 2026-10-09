import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useGameSlots from './hooks/useGameSlots';

type Props = {}

const GD = (props: Props) => {
  const [openmodel, setOpenmodel] = useState(false);
  const [selectedSlot, setselectedSlot] = useState(null);
  const handleClick = (slot: any) => {
    setOpenmodel(true);
    setselectedSlot(slot);
    console.log(slot)
  }
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(`/hr/games`);
  }
  const handleSubmit = () => {

  }
  const { gameId } = useParams();
  console.log(gameId);
  const { data, isLoading, isError, error } = useGameSlots(gameId, '2026-02-26T00:00:00Z');
  console.log(data);
  return (
    <>
      <div>
        Booking Slot on
      </div>
      <label htmlFor="date">Please Select Date to Book a slot</label>
      <input type="date" name="date"/>
      <button onClick={() => handleBack()}>Back</button>
      <div className="flex flex-wrap gap-4 p-2">
        {openmodel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Teammate Details</h2>
              <h5> Booked Positions :   {selectedSlot.assigned}</h5>
              <h5> Empty Position :   {selectedSlot.availableSeats}</h5>
              <h5> Capacity :   {selectedSlot.capacity}</h5>
              <h5> Start Time :   {selectedSlot.availableSeats}</h5>
              <h5> End Time :   {selectedSlot.capacity}</h5>
              <form className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700"> Member {i} Name</label>
                    <input type="text" placeholder={`Enter name ${i}`} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setOpenmodel(false)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Close</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" >Submit </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {data && data.map((slot) => (
          <div key={slot.id} onClick={() => handleClick(slot)} className="border p-4 rounded shadow-sm hover:bg-gray-50 cursor-pointer mb-2"  >
            <div className="gap-2 text-sm">
              <div><strong>Available:</strong> {slot.availableSeats}</div>
              <div><strong>Capacity:</strong> {slot.capacity}</div>
              <div><strong>Start:</strong> {slot.startTime}</div>
              <div><strong>End:</strong> {new Date(slot.endTime).toLocaleTimeString()}</div>
              <div><strong>Open:</strong> {slot.isBookingOpen ? "Yes" : "No"}</div>
            </div>
            <button hidden  onClick={(e) => { handleClick(slot); }}  className="mt-3 w-full bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700" >Book</button>
          </div>
        ))}

      </div>
    </>
  )
}

export default GD;

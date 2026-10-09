import { useMutation } from '@tanstack/react-query';
import React from 'react'
import api from '../../auth/api/axios';

type Props = {}
export interface BookingRequestCreateDto {
    SlotId:number,
    BookedBy :number;
    userIds:number[],
    Status : string;
}


function useCreateBooking() {
  return useMutation({
    mutationFn : async (data:BookingRequestCreateDto)=>{
        const res = await api.post("/Booking" , data);
        return res.data;
    }
  }
  )
  
}
export default useCreateBooking;

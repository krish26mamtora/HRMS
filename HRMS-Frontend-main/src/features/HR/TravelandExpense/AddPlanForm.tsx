import React, { useState, type ChangeEvent, type FormEvent } from 'react'
import api from '../../auth/api/axios';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { usePlans } from '../hooks/usePlans';
import { useNavigate } from 'react-router-dom';
type Props = {}

export interface TravelPlanData {
  startDate: string;
  endDate: string;
  TravelMode : string;
  TripType: string;
  destination: string;
  purpose: string;
  createdByUserId : number;
}

const AddPlanForm = (props: Props) => {
       const [feedback , setFeedback]= useState({message:'' , error:''});
        
        const [formData , setFormData] = useState<TravelPlanData>({
            startDate : '',
            endDate : '',
            destination : '',
            purpose : '',
            TravelMode: '',
            TripType:'',
            createdByUserId : Number(localStorage.getItem('id'))||0
        });
    
        const handleChange = (e:ChangeEvent<HTMLInputElement| HTMLSelectElement | HTMLTextAreaElement>)=>{
           const {name , value} = e.target;
            setFormData ((prevData)=>({
                ...prevData , [name]:value,
            }))
        }
        const navigate = useNavigate();

            const handleClose = () =>{
                navigate('/hr/travel/');
            }
    const handleSubmit =async (e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        // console.log(formData);
        console.log(localStorage.getItem('id'));
        console.log(formData.createdByUserId);
       if(!formData.TravelMode||!formData.TripType||!formData.startDate||!formData.createdByUserId||!formData.destination||!formData.endDate||!formData.purpose){
            setFeedback(prev => ({ ...prev, error: 'Please enter all fields' }));
                return;
       }try{
            const res = await api.post("/TravelPlan" , formData)
            if(res.status >= 200 && res.status<=300){
                alert("Plan created");
            }
        }catch(err){
            if(axios.isAxiosError(err)){
                const axiosError = err as AxiosError<{message:string}>;
                setFeedback(prev=>({...prev , error:axiosError.response?.data?.message || 'failed to add plan'}))
            }else{
                setFeedback(prev=>({...prev , error:'An error occured'}));
            }
       }
    }

  return (
    <>
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Create New Plan</h2>
              <button onClick={handleClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Close</button>
    </div> 
    {/* <div>AddPlanForm</div> */}
    <div className="">
        <form onSubmit={handleSubmit}  className="space-y-4">
            <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination : </label>
                <input type="text" id="destination" name="destination" className="w-full border border-gray-300 rounded-md px-3 py-2"  value={formData.destination} onChange={handleChange} required />
            </div>
             <div>
               <label htmlFor="purpose"  className="block text-sm font-medium text-gray-700 mb-1">purpose : </label>
                <input type="text" id="purpose" name="purpose" className="w-full border border-gray-300 rounded-md px-3 py-2"  value={formData.purpose} onChange={handleChange} required />
            </div>
             <div>
               <label htmlFor="startDate"  className="block text-sm font-medium text-gray-700 mb-1">startdate : </label>
                <input type="date" id="startDate" name="startDate" className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.startDate} onChange={handleChange} required/>
            </div>
              <div>
               <label htmlFor="endDate"  className="block text-sm font-medium text-gray-700 mb-1">enddate : </label>
                 <input type="date" id="endDate" name="endDate" className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.endDate} onChange={handleChange} required/>
              </div>
              <div>
              <label htmlFor="TravelMode" className="block text-sm font-medium text-gray-700 mb-1">Select an option</label>
                <select id="TravelMode" name="TravelMode"  value={formData.TravelMode} onChange={handleChange} required className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body">
                <option value="" disabled>Select Transport Mode</option> 
                <option value="road">Road Transport</option>
                <option value="rail">Rail Transport</option>
                <option value="water">Water Transport</option>
                <option value="air">Air Transport</option>
            </select>
            </div>
            <div>
            <label htmlFor="TripType" className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
            <select id="TripType" name="TripType" value={formData.TripType} onChange={handleChange} required className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body">
                <option value="" disabled>Select Trip Type</option>
                <option value="Client Meeting">Client Meeting</option>
                <option value="Conferences and Trade Showst">Conferences and Trade Showst</option>
                <option value="Incentive Travel">Incentive Travel</option>
                <option value="Training and Development Programs">Training and Development Programs</option>
                <option value="Corporate Retreats">Corporate Retreats</option>
            </select>
            </div>
            <input type="hidden" id="createdByUserId" name="createdByUserId" value={localStorage.getItem('id')||''} required/>

            <button type='submit' className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">Create Plan</button>
        </form>        
    </div>
</div>
    </>
  )
}
export default AddPlanForm
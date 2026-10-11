import { useState, type ChangeEvent, type FormEvent } from 'react'
import api from '../../auth/api/axios';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export interface TravelPlanData {
  startDate: string;
  endDate: string;
  travelMode : string;
  tripType: string;
  destination: string;
  purpose: string;
  createdByUserId : number;
}

const AddPlanForm = () => {
       const [feedback , setFeedback]= useState({message:'' , error:''});
       const [isSubmitting, setIsSubmitting] = useState(false);
        
        const [formData , setFormData] = useState<TravelPlanData>({
            startDate : '',
            endDate : '',
            destination : '',
            purpose : '',
            travelMode: '',
            tripType:'',
            createdByUserId : Number(localStorage.getItem('id'))||0
        });
    
        const handleChange = (e:ChangeEvent<HTMLInputElement| HTMLSelectElement | HTMLTextAreaElement>)=>{
           const {name , value} = e.target;
            setFormData ((prevData)=>({
                ...prevData , [name]:value,
            }))
        }
        const navigate = useNavigate();
        const queryClient = useQueryClient();

            const handleClose = () =>{
                navigate('/hr/travel/');
            }
    const handleSubmit =async (e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        // console.log(formData);
       if(!formData.travelMode||!formData.tripType||!formData.startDate||!formData.createdByUserId||!formData.destination||!formData.endDate||!formData.purpose){
            setFeedback({ message: '', error: 'Please complete all required fields.' });
            return;
       }
       if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setFeedback({ message: '', error: 'The end date must be on or after the start date.' });
            return;
       }
       setIsSubmitting(true);
       setFeedback({ message: '', error: '' });
       try{
            await api.post("/TravelPlan", {
              ...formData,
              startDate: `${formData.startDate}T00:00:00.000Z`,
              endDate: `${formData.endDate}T00:00:00.000Z`,
            });
            await queryClient.invalidateQueries({ queryKey: ['TravelPlans'] });
            navigate('/hr/travel');
        } catch(err) {
            if(axios.isAxiosError(err)){
                const responseMessage = err.response?.data;
                const validationMessage =
                  typeof responseMessage === 'string'
                    ? responseMessage
                    : responseMessage && typeof responseMessage === 'object' && 'errors' in responseMessage
                      ? Object.values(responseMessage.errors as Record<string, string[]>).flat().join(' ')
                      : err.response?.status === 401 || err.response?.status === 403
                        ? 'Your session may have expired or your account is not permitted to create travel plans. Please sign in again or contact an administrator.'
                        : undefined;
                setFeedback({
                  message: '',
                  error: validationMessage || 'Could not create the travel plan. Please check your details and try again.',
                });
            } else {
                setFeedback({
                  message: '',
                  error: 'Could not create the travel plan. Please try again.',
                });
            }
        } finally {
            setIsSubmitting(false);
       }
    }

  return (
    <>
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Create New Plan</h2>
              <button onClick={handleClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Close</button>
    </div> 
    {feedback.error && <p role="alert" className="mb-4 text-sm text-red-600">{feedback.error}</p>}
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
              <label htmlFor="travelMode" className="block text-sm font-medium text-gray-700 mb-1">Select an option</label>
                <select id="travelMode" name="travelMode"  value={formData.travelMode} onChange={handleChange} required className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body">
                <option value="" disabled>Select Transport Mode</option> 
                <option value="road">Road Transport</option>
                <option value="rail">Rail Transport</option>
                <option value="water">Water Transport</option>
                <option value="air">Air Transport</option>
            </select>
            </div>
            <div>
            <label htmlFor="tripType" className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
            <select id="tripType" name="tripType" value={formData.tripType} onChange={handleChange} required className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body">
                <option value="" disabled>Select Trip Type</option>
                <option value="Client Meeting">Client Meeting</option>
                <option value="Conferences and Trade Showst">Conferences and Trade Showst</option>
                <option value="Incentive Travel">Incentive Travel</option>
                <option value="Training and Development Programs">Training and Development Programs</option>
                <option value="Corporate Retreats">Corporate Retreats</option>
            </select>
            </div>
            <input type="hidden" id="createdByUserId" name="createdByUserId" value={localStorage.getItem('id')||''} required/>

            <button type='submit' disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-bold py-2 px-4 border border-blue-700 rounded">
              {isSubmitting ? 'Creating plan...' : 'Create Plan'}
            </button>
        </form>        
    </div>
</div>
    </>
  )
}
export default AddPlanForm
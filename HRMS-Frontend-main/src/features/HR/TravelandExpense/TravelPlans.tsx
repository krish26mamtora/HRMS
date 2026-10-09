import React, { useState, type ChangeEvent, type FormEvent } from 'react'
import api from '../../auth/api/axios';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { usePlans } from '../hooks/usePlans';
import AddPlanForm from './AddPlanForm';
import { Outlet, useNavigate } from 'react-router-dom';
type Props = {}

export interface TravelPlanData {
  startDate: string;
  endDate: string;
  destination: string;
  travelMode: string;
  tripType:string;
  purpose: string;
  createdByUserId : number;
  id : number;
  CreatedAt : Date;
}

const TravelPlans = (props: Props) => {
    const navigate = useNavigate();
    const [planType , setplanType] = useState("");
    const isCreating = location.pathname.includes('/create');

    const handleRedirect = () =>{
        navigate('/hr/travel/create');
    }

    const {data , isLoading , isError , error} = usePlans();
    if(!data){
      return <h2>No Plan Found..</h2>
    }
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    const handleAssign = (planId:number)=>{
      console.log("from handle : ",planId , typeof(planId));
      navigate(`/hr/travel/${planId}`);
    }

    const managePlan = (planId : number)=>{
      navigate(`/hr/travel/expense/${planId}`);
      console.log(planId);
    } 
    const manageDocuments = (planId : number)=>{
      navigate(`/hr/travel/documents/${planId}`);
    console.log(planId);
    } 
    const now = new Date();
    const pastTravels = data.filter(item=> new Date(item.endDate) <now);
     const FurtureTravels = data.filter(item=> new Date(item.startDate) >now);
    const ongoingPlans = data.filter(item => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      return now >= start && now <= end;
    });

   
  return (
    <>
    <h2 className='font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>TravelPlans</h2>
        <div>
          Plans Type
          <select name="filterType" id="filtreType" value={planType} onChange={(e)=>setplanType(e.target.value)}>
            <option value="">All</option>
             <option value="Client Meeting">Client Meeting</option>
             <option value="Training and Development Programs">Training and Development Programs</option>
            <option value="Conferences and Trade Showst"> Conferences and Trade Showst</option>
          </select>
          Plan Type
          <select name="filterStatus" id="filterStatus">
             <option value="">All</option>
            <option value="Past">Past</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Future">Future</option>
          </select>
        </div>
         <div className='flex justify-end'>
                    {!isCreating && (
                        <button 
                            onClick={handleRedirect} 
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                           Create New
                        </button>
                    )}
                </div>       
               <div>
                  <Outlet />
                </div>
             <div>
    
        </div>
                    
        <div className="p-4">
             <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.filter( (plan)=>planType===""|| plan.tripType.toString()==planType ).map((plan) => (
                <li key={plan.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-slate-900">Destination : {plan.destination}</h2>
                    <span className="text-sm text-sky-700 font-medium">Travel Mode :</span> {plan.travelMode} <br/>
                    <span className="text-sm text-sky-700 font-medium">Purpose :  </span>{plan.purpose}<br/>
                    <span className="text-sm text-sky-700 font-medium">Type : </span> {plan.tripType}<br/>
                    <span className="text-sm text-sky-700 font-medium">Start Date : </span>{new Date(plan.startDate).toLocaleDateString()}<br/>
                    <span className="text-sm text-sky-700 font-medium">End Date :</span> {new Date(plan.endDate).toLocaleDateString()}<br/>
                  
                    <h2>Created by : {plan.createdByUserId}</h2>
                    <h2>ID : {plan.id}</h2>
                    <button onClick={()=>managePlan(plan.id)} className="mr-3 mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 border border-blue-700 rounded">Manage Membres</button>
                     <button onClick={()=>handleAssign(plan.id)} className="mr-3 mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 border border-blue-700 rounded">Assign Plan</button>
                </li>
                ))}
            </ul>
         </div>
    </>
  )
}


export default TravelPlans;
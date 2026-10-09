
import React from 'react'
import useEmployeePlans from '../hooks/useEmployeePlans';
import { Outlet, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

type Props = {}

const EmpTravelPlans = (props: Props) => {
  const navigate = useNavigate();
  const { empProfileId } = useParams<{ empProfileId: string }>();
   const {data , isLoading , isError , error} = useEmployeePlans(empProfileId);
    console.log(data);
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
   
    const handleDocuments = (id:number)=>{
      console.log( 'Value Sent', id);
      navigate(`/manager/employee-plans/documents/${empProfileId}/${id}`);

      // navigate(`/employee/travel/${id}`);
    }
    const handleExpense = (planid:number)=>{
         console.log(empProfileId , planid);
          navigate(`/manager/employee-plans/expense/${empProfileId}/${planid}`);
    }

  return (
    <>
        <div className='font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>Travel Plan List</div>
            <button onClick={()=>navigate(-1)} className='underline text-blue-500'>Back</button>

        <div>

        </div>
     
        <div className="p-4">
             <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.map((plan) => (
                <li key={plan.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-slate-900">Destination : {plan.destination}</h2>
                    <span className="text-sm text-sky-700 font-medium">Purpose :  </span>{plan.purpose}<br/>
                    <span className="text-sm text-sky-700 font-medium">Type : </span> {plan.tripType}<br/>
                    <span className="text-sm text-sky-700 font-medium">Start Date : </span>{plan.startDate}<br/>
                    <span className="text-sm text-sky-700 font-medium">End Date :</span> {plan.endDate}<br/>
                      <button onClick={()=>handleExpense(plan.id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 mr-3 mt-2">Expenses</button>

                     <button onClick={()=>handleDocuments(plan.id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600">Documents</button>
                </li>
                ))}
            </ul>
         </div>
    </>
   
  )
}
export default EmpTravelPlans;
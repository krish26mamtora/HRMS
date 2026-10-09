import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import useExpense from '../hooks/useExpense';
import useEmployeesForPlan from '../hooks/useEmployeesForPlan';
type Props = {}
interface AssignedUser {
    UserProfileId: number;
}



const ManageTravel = (props: Props) => {

        const navigate = useNavigate();

    const ViewProfile = (empProfileId : number) =>{
            navigate(`/HR/organization/profile/${empProfileId}`);
    }
    const [selectedDepartment , setSelectedDepartment] = useState('');
    
    const { planId } = useParams<{ planId: string }>();

    const planIdNum = planId ? Number(planId) : 0;

    const { data, isLoading, isError, error } = useEmployeesForPlan(planIdNum);
    if (!data) {
        return <h2>No Employee Found..</h2>
    }
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    console.log(data);

    const manageExpense = ( empId : number )=>{
          navigate(`/hr/travel/expense/${planIdNum}/${empId}`);
    }

    const manageDocuments = ( empId : number )=>{
           navigate(`/hr/travel/documents/${planIdNum}/${empId}`);
    }

    return (
        <>

            <div className='font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>Travel Members</div>
 <button onClick={()=>navigate(-1)} className='underline text-blue-500'>Back</button>
        <div className="flex justify-end p-2 bg-gray-50 border-b">
        <label htmlFor="departmentFilter">Select Department : </label>
        <select name='departmentFilter' value={selectedDepartment} onChange={(e)=>setSelectedDepartment(e.target.value)}>
          <option value="">All</option>
          <option value="IT">IT</option>
          <option value="Sales">Sales</option>
          <option value="Finance">Finance</option>
          <option value="Human Resources (HR)">Human Resources (HR)</option>
          <option value="Customer Service">Customer Service</option>
          <option value="Quality Assurance">Quality Assurance</option>
        </select>
      </div>



            <div className="mt-5 relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                <table id="search-table" className="w-full text-sm text-left rtl:text-right text-body">
                    <thead className="bg-neutral-secondary-soft border-b border-default">
                        <tr>
                            <th className="px-6 py-3 font-medium">Id</th>
                            <th className="px-6 py-3 font-medium">First Name </th>
                            <th className="px-6 py-3 font-medium">Last Name </th>
                            <th className="px-6 py-3 font-medium">Department </th>

                            <th className="px-6 py-3 font-medium">Age </th>
                            <th className="px-6 py-3 font-medium">Gender </th>

                            <th className="px-6 py-3 font-medium">Manager</th>
                            <th className="px-6 py-3 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.filter((item)=>selectedDepartment===""||item?.department===selectedDepartment).map((item, index) => (
                            <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                                <td className="px-6 py-4">{item.userProfileId}</td>
                                <td className="px-6 py-4">{item.firstName}</td>
                                <td className="px-6 py-4">{item.lastName}</td>
                                <td className="px-6 py-4">{item.department}</td>
                                <td className="px-6 py-4">{item.age}</td>
                                <td className="px-6 py-4">{item.gender}</td>
                                <td className='px-6 py-4'>{item.managerId}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => ViewProfile(item.userProfileId)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-3">View Profile</button>
                                    <button  onClick={()=>manageDocuments(item.userProfileId)} className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-800 mr-3">Documents</button>

                                    <button onClick={() => manageExpense(item.userProfileId )} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600">Manage Expense</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>

    )
}
export default ManageTravel;
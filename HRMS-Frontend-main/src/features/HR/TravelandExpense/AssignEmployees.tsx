import React, { useEffect, useState } from 'react'
import useAssignEmp from '../hooks/useAssignEmp'
import api from '../../auth/api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { DataTable } from "simple-datatables";
// import type { UserProfileDisplayDto } from '../../OrgChart/Profile';
import { fetchEmployeesProfileById } from '../../OrgChart/hooks/useProfile';
type Props = {}

export interface AssignPlan {
  EmpId: number[];
  PId: number;
  Status: string;
  CreatedAt: Date;
}

const AssignEmployees = (props: Props) => {


  const navigate = useNavigate();

  const ViewProfile = (empProfileId: number) => {
    navigate(`/hr/UserProfile/${empProfileId}`);

  }
  // const [profile, setProfile] = useState<UserProfileDisplayDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const { data, isLoading, isError, error } = useAssignEmp();
      console.log(data)

  const { planId } = useParams<{ planId: string }>();

  const planIdNum = planId ? Number(planId) : 0;

  console.log("from use : ", planId, typeof (planId));

  if (!data) {
    return <h2>No Plan Found..</h2>
  }
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const assignEmployee = async (EmployeeProfileId: number) => {

    const Data = {
      EmpId: [EmployeeProfileId],
      PId: planIdNum,
      Status: 'Assigned',
      CreatedAt: new Date(),
    }
    console.log(EmployeeProfileId);

    try {
      const response = await api.post('/EmployeePlan', Data);

      if (response.status === 200) {

        const emailResponse = await api.get<{ email: string }>(`/UserProfile/getusetemailfromId/${EmployeeProfileId}`);
       const userEmail = emailResponse.data?.email;
        console.log(userEmail);
        if (userEmail) {
           const notifyResponse = await api.post('/EmployeePlan/notifyTravel', {
            PId: planIdNum,
            EmpId: EmployeeProfileId,
            ReceiverMail: userEmail,
            Subject: "Travel Plan Assigned",
            Message: "A new travel plan has been assigned to you. Please check the portal for details and upload verification documents."
         });

          if (notifyResponse.status === 200) {
            alert("Employee assigned and notification Email sent!");
          }
        } else {
          alert("Employee assigned, but no email address was found to send notification.");
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message: string }>;
        alert(axiosError.response?.data?.message);
      } else {
        alert(err);
      }
    }
  }

  return (
    <>
      <div>
        <div className='font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>Add Travel Members</div>
        <button onClick={()=>navigate(-1)} className='underline text-blue-500'>Back</button>
        <div className="flex justify-end p-2 bg-gray-50 border-b">
          <label htmlFor="departmentFilter">Select Department : </label>
          <select name='departmentFilter' value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
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
              {data?.filter((item) =>{ const departmentMatch =  selectedDepartment === "" || item.department === selectedDepartment;
                const isnotManager =  item.managerId !== item.userProfileId;
                const notHr = item.department != 'HR';
                return departmentMatch && isnotManager && notHr;
              }).map((item, index) => (
                <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                  <td className="px-6 py-4">{item.userProfileId}</td>
                  <td className="px-6 py-4">{item.firstName}</td>
                  <td className="px-6 py-4">{item.lastName}</td>
                  <td className="px-6 py-4">{item.department}</td>
                  <td className="px-6 py-4">{item.age}</td>
                  <td className="px-6 py-4">{item.gender}</td>
                  <td className='px-6 py-4'>{item.managerId}</td>
                  <td className="px-6 py-4">
                    {/* <button onClick={() => ViewProfile(item.userProfileId)} className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-3'>View Profile</button> */}
                    <button onClick={() => assignEmployee(item.userProfileId)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600">Assign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default AssignEmployees
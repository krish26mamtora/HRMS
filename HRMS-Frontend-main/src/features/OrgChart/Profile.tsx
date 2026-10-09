import React, { useEffect, useState } from 'react'
import api from '../auth/api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useProfile from './hooks/useProfile';
import useOrg from './hooks/useOrg';      
import useDirectCont from './hooks/useDirectCont';

type Props = {}

const Profile = () => {
  
  const { userProfileId } = useParams();
  const navigate = useNavigate();
    const role = (localStorage.getItem('role') === "HR") ? 'hr' : (localStorage.getItem('role') === "Employee" ? "employee" : 'manager');
    
  const redirectBack = () =>{
    navigate(`/${role}/organization`);
  }
  const numuserProfileId = userProfileId ? Number(userProfileId) : 0;
 const { data:directContact} = useDirectCont(numuserProfileId);

  const { data, isLoading, isError, error } = useOrg(numuserProfileId);

  if (!data) {
    return <h2>No Profile Found..</h2>
  }
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <div>

        <div className="p-4">
          <button className='underline text-blue-500' onClick={()=>redirectBack()}>Back</button>
          <h2>Top-level managerial chain</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.map((profile) => (
              <li key={profile.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-slate-900">Name: {profile.firstName} {profile.lastName} ,,,  Reports to -<code>&gt;</code> </h2>
                {/* <span className="text-sm text-sky-700 font-medium">Manager Id : {profile.managerId}</span><br /> */}
                <span className="text-sm text-sky-700 font-medium">Department: {profile.department}</span><br />
                 <span className="text-sm text-sky-700 font-medium">Designation: {profile.designation}</span><br />
                <span className="text-sm text-sky-700 font-medium">Age: {profile.age}</span><br />
                <span className="text-sm text-sky-700 font-medium">Address: {profile.address}</span><br />
                <span className="text-sm text-sky-700 font-medium">Gender: {profile.gender}</span><br />
                <span className="text-sm text-sky-700 font-medium">Favourite Sport: {profile.favouriteSport}</span><br />
                <span className="text-sm text-sky-700 font-medium">Status: {profile.isActive ? 'Active' : 'Inactive'}</span><br />
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4">
          <h2>One level of direct reports</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {directContact?.map((profile) => (
              <li key={profile.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-slate-900">Name: {profile.firstName} {profile.lastName} </h2>
                {/* <span className="text-sm text-sky-700 font-medium">Manager Id : {profile.managerId}</span><br /> */}
                <span className="text-sm text-sky-700 font-medium">Department: {profile.department}</span><br />
                 <span className="text-sm text-sky-700 font-medium">Designation: {profile.designation}</span><br />
                <span className="text-sm text-sky-700 font-medium">Age: {profile.age}</span><br />
                <span className="text-sm text-sky-700 font-medium">Address: {profile.address}</span><br />
                <span className="text-sm text-sky-700 font-medium">Gender: {profile.gender}</span><br />
                <span className="text-sm text-sky-700 font-medium">Favourite Sport: {profile.favouriteSport}</span><br />
                <span className="text-sm text-sky-700 font-medium">Status: {profile.isActive ? 'Active' : 'Inactive'}</span><br />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
export default Profile
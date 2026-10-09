import React, { useState } from 'react'
import useProfile, { type UserProfileDisplayDto } from './hooks/useProfile'
import { useNavigate } from 'react-router-dom';

type Props = {}

const ListUser = (props: Props) => {
  
     const navigate = useNavigate();
     const [searchTerm, setSearchTerm] = useState('');
    const openOrgChart = (userProfileId:number)=>{
          navigate(`/${localStorage.getItem('role')}/organization/profile/${userProfileId}`);
    }

    const {data , isLoading , isError, error} = useProfile();
       if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const filteredData = data?.filter((user) => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  console.log(data);

  return (
    <>
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">All Employee Profiles</h2>
           <div className="flex flex-wrap items-center relative w-full md:w-80">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-sm"  placeholder="Search by name or department..."  />
             <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
         </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Dept</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Age</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Sport</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Chart</th>

            </tr>
          </thead>
          <tbody className="divide-gray-100">
            {filteredData.map((user) => (
              <tr key={user.userProfileId} >
                <td className="px-4 py-3 font-medium text-gray-700">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-gray-600">{user.department || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-600">{user.age}</td>
                <td className="px-4 py-3 text-gray-600">{user.favouriteSport || '-'}</td>
                <td className="px-4 py-3  text-gray-600">{user.isActive ? 'Active' : 'Inactive'} </td>
                <td className="px-4 py-3 text-gray-500">
                  {user.joinDate}
                </td>
                <td>
                    <button onClick={()=>openOrgChart(user.userProfileId)} className="mr-3 mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 border border-blue-700 rounded">View Chart</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    {/* </div> */}
    </>
  )
}

export default ListUser;
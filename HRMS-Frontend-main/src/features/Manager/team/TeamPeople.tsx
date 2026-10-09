import React from 'react'
import useTeam from '../hooks/useTeam';
import { useNavigate } from 'react-router-dom';

type Props = {}

const TeamPeople = (props: Props) => {
    const navigate = useNavigate();
      const viewAssignedPlans = (empProfileId : number) =>{
        navigate(`/manager/employee-plans/${empProfileId}`);
    }
    const { data, isLoading, isError, error } = useTeam(Number(localStorage.getItem('id')));
    console.log("Here", data)
    console.log(typeof (data));
    if (isLoading) return <div>Loading...</div>;
    if (isError || error) return <div>Error: {error?.message}</div>;

    return (
        <>
            <div className="p-6">
                <h2  className="text-2xl font-bold mb-4">Team Members Profiles</h2>
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
                                <th className="px-4 py-3 text-left font-medium text-gray-900">Details</th>

                            </tr>
                        </thead>
                        <tbody className="divide-gray-100">
                            {data.map((user) => (
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
                                        <div>
                                            <button onClick={() => viewAssignedPlans(user.userProfileId)} className="mr-3 mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 border border-blue-700 rounded">View Plans</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

}

export default TeamPeople;
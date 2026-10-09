import React, { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../../auth/api/axios';

type Props = {}

const MyReferrals = (props: Props) => {
  const navigate = useNavigate();
const userId = localStorage.getItem('id');
   const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const getJobShare = async ()=>{
            try{
                if (!userId) {
                    setLoading(false);
                    return;
                }
                const respose = await api.get(`/Referal/user/${userId}`);
                setReferrals(respose.data);
                console.log(respose.data);
            }catch(err:any){
                if (err.response?.status !== 404) {
                    console.log(err.message);
                }
            }finally{
                setLoading(false);
            }
        }
           getJobShare(); 
    },[userId])

  return (
    <>
    <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 underline">Back</button>
    <div>My Refferals</div>
    {loading ? (<p>Loading...</p>) : referrals ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Job </th>
                                <th className="border p-2">Referral Name</th>
                                <th className="border p-2">Referral Email</th>
                                <th className="border p-2">Status</th>
                                <th className="border p-2">Resume</th>
                                  <th className="border p-2">Description</th>
                                   <th className="border p-2">Refered at</th>
                            </tr>
                        </thead>
                        <tbody>
                           {referrals.map((item, index) => (
                                <tr key={index}>
                                    <td className="border p-2 text-center">{item.jobId}</td>
                                    <td className="border p-2">{item.reffName}</td>
                                    <td className="border p-2">{item.reffMail}</td>
                                    <td className="border p-2">{item.status}</td>
                                     <td className="border p-2 ">{item.reffResumeUrl}</td>
                                    <td className="border p-2">{item.description}</td> 
                                    <td className="border p-2">{item.createdAt}</td> 

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>No Referral Found</div>
            )
        
        }
    </>
  )
}

export default MyReferrals;
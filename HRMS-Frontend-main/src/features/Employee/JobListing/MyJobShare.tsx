import React, { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../../auth/api/axios';

type Props = {}

const MyJobShare = (props: Props) => {
const navigate = useNavigate();
const userId = localStorage.getItem('id');
  const [jobsahres, setJobsahres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const getJobShare = async ()=>{
            try{
                if (!userId) {
                    setLoading(false);
                    return;
                }
                const respose = await api.get(`/ShareJob/user/${userId}`);
                setJobsahres(respose.data);
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
    <div>MyJobShare</div>
    {loading ? (<p>Loading...</p>) : jobsahres ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Job</th>
                                <th className="border p-2">Receiver Email</th>
                                <th className="border p-2">Subject</th>
                                <th className="border p-2">Message</th>
                                 <th className="border p-2">Shared at</th>
                            </tr>
                        </thead>
                          <tbody>
                            {jobsahres.map((item, index) => (
                                <tr key={index}>
                                    <td className="border p-2 text-center">{item.jobId}</td>
                                    <td className="border p-2">{item.receiverMail}</td>
                                    <td className="border p-2">{item.subject}</td>
                                    <td className="border p-2">{item.message}</td>
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
export default MyJobShare;
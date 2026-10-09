import React from 'react'
import { useParams } from 'react-router-dom';
import useApplications from '../hooks/useApplications';
import api from '../../auth/api/axios';
import { resume } from 'react-dom/server';

export const JobApplications = () => {
      const {jobId} = useParams<{jobId: string}>();

    if (!jobId) 
    {
        return <div>No Job Id Found</div>
    }

    const handleDownload = async (e: React.MouseEvent, resumeUrl: string) => {
        e.preventDefault();

        try {
            const response = await fetch(`https://localhost:7035/api/getresume/download-resume/${resumeUrl}`);
            if (!response.ok) {
                throw new Error('Could not download the file. Please check if the file exists.');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            const fileName = resumeUrl.includes('_')?resumeUrl.split('_').slice(1).join('_') : resumeUrl;
            a.download = fileName; 

            document.body.appendChild(a);
            a.click();
           window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to download resume. Please try again.");
        }
    };

    const numJobid = Number(jobId);
    const { data, isLoading, isError, error } = useApplications(numJobid);
    console.log("Here", data)
    console.log(typeof(data));
    if (isLoading) return <div>Loading...</div>;
    if (isError || error) return <div>Error: {error?.message}</div>;

    return (
        <>
            <div>
            <div className='font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>Job Applications</div>

                <div className="mt-5 relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                    <table className="w-full text-sm text-left rtl:text-right text-body">
                        <thead className="bg-neutral-secondary-soft border-b border-default">
                            <tr>
                                <th className="px-6 py-3 font-medium">Job Id</th>
                                <th className="px-6 py-3 font-medium">Name </th>
                                <th className="px-6 py-3 font-medium">Email </th>
                                <th className="px-6 py-3 font-medium">Resume </th>
                                <th className="px-6 py-3 font-medium">Referred By</th>
                                <th className="px-6 py-3 font-medium">Description</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((item, index) => (
                                <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                                    <td className="px-6 py-4">{item.jobId}</td>
                                    <td className="px-6 py-4">{item.reffName}</td>
                                    <td className="px-6 py-4">{item.reffMail}</td>
                                    <td className="px-6 py-4 col ">
                                        <a 
                                        href="#" 
                                        onClick={(e) => handleDownload(e, item.reffResumeUrl)} 
                                        className='font-medium text-blue-600 hover:underline flex items-center'
                                    >
                                        Download Resume
                                    </a>
                                    </td >
                                    <td className="px-6 py-4">{item.empId}</td>
                                    <td className="px-6 py-4">{item.description}</td>
                                    <td className="px-6 py-4">{item.status}</td>

                                    <td  className="px-6 py-4">
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600">Action</button>
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

export default JobApplications;

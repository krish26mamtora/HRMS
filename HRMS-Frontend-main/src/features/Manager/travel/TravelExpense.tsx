import React, { useEffect, useState, FormEvent } from 'react';
import api from '../../auth/api/axios';
import { useParams } from 'react-router-dom';
import useExpense from '../../Employee/hooks/useExpense';
import type { ExpenseProof } from '../../HR/hooks/useProofDocument';

export const TravelExpense = () => {
    const [travelAssignId, setTravelAssignId] = useState('');
    const [selectedStatusType , setselectedStatusType] = useState('');
    const[selectedType , setselectedType] = useState('');

    const { id } = useParams();
    const numPlanId = id ? Number(id) : 0;
    const EmpId = localStorage.getItem('id');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/Expense/getId?EmpId=${EmpId}&PId=${numPlanId}`);
                setTravelAssignId(response.data);
            } catch (error) {
                console.error("Error fetching travel assign id:", error);
            }
        };
        if (EmpId && numPlanId) fetchData();
    }, [EmpId, numPlanId]);

    const { data, isLoading, isError, error } = useExpense(Number(travelAssignId));
    console.log('Previous Expenses : ', data);
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;


    const handleDownload = async (e: React.MouseEvent, id:number) => {
        e.preventDefault();
        console.log(id);
        const proofUrl = await api.get<ExpenseProof[]>(`ExpenseProof/getExpenseProofForExpenseid/${id}`);
        const documentpath = proofUrl.data[0].proofDocumentUrl;
        console.log(documentpath);
        try {
            const response = await fetch(`https://localhost:7035/api/ExpenseProof/download-expense-proof/${encodeURIComponent(documentpath)}`);
            console.log(response)
            
            if (!response.ok) {
                throw new Error('Could not download the file. Please check if the file exists.');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            const fileName = documentpath.includes('_') ? documentpath.split('_').slice(1).join('_') : documentpath;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to download proof. Please try again.");
        }
    };

   
    return (
        <>

            <div className="flex items-center justify-end gap-4 p-3 bg-gray-50 border-b text-sm text-gray-700">
                <div  className="flex items-center gap-2">
                    <label htmlFor="selectedStatusType" className="font-medium">Expense Status</label>
                    <select name="selectedStatusType" id="selectedStatusType" value={selectedStatusType} onChange={(e)=>setselectedStatusType(e.target.value)} className="border rounded-md p-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">All</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                <div  className="flex items-center gap-2">
                    <label htmlFor="ExpenseType" className="font-medium">Expense Type</label>
                    <select name="ExpenseType" id="ExpenseType" value={selectedType} onChange={(e)=>setselectedType(e.target.value)} className="border rounded-md p-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">All</option>
                        <option value="1">Food</option>
                        <option value="2">Transportation Expense</option>
                        <option value="3">Accommodation Expenses</option>
                    </select>

                </div>
            </div>

            <div className="mt-5 relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                <table id="search-table" className="w-full text-sm text-left rtl:text-right text-body">
                    <thead className="bg-neutral-secondary-soft border-b border-default">
                        <tr>
                            <th className="px-6 py-3 font-medium">Expense Type : </th>
                            <th className="px-6 py-3 font-medium">Amount : </th>
                            <th className="px-6 py-3 font-medium">Description :</th>
                            <th className="px-6 py-3 font-medium">Created At :</th>

                            <th className="px-6 py-3 font-medium">Document</th>
                            <th className="px-6 py-3 font-medium">Status :</th>
                            <th className="px-6 py-3 font-medium">Updated By :</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.filter((item)=>(selectedType==="" || item.expenseType.toString()===selectedType)&&((selectedStatusType === "" || item.status === selectedStatusType))).map((item, index) => (
                            <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                                <td className="px-6 py-4">
                                    {item.expenseType === 1 ? "Food" : item.expenseType === 2
                                        ? "Travel" : item.expenseType === 3 ? "Accommodation" : "Unknown"}
                                </td>
                                <td className="px-6 py-4">{item.amount}</td>
                                <td className="px-6 py-4">{item.description}</td>
                                <td className="px-6 py-4">{item.createdAt}</td>
                                <td className="px-6 py-4 col ">
                                    <a

                                         onClick={(e) => handleDownload(e , item.id )} 
                                        className='font-medium text-blue-600 hover:underline flex items-center'
                                    >
                                        Proof Document
                                    </a>
                                </td >
                                <td className="px-6 py-4">{item.status}</td>
                                <td className="px-6 py-4">{item.approvedBy}</td>
                                <td>{item.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </>
    );
};

export default TravelExpense;

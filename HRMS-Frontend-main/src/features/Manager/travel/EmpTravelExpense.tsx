import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import useExpense from '../../HR/hooks/useExpense';
import useProofDocument, { type ExpenseProof } from '../../HR/hooks/useProofDocument';
import api from '../../auth/api/axios';
import type { Expense } from '../../HR/hooks/useExpense';

type Props = {}

const EmpTravelExpense = (props: Props) => {
    
    const navigate = useNavigate();
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [selectedStatusType , setselectedStatusType] = useState('');
    const[selectedType , setselectedType] = useState('');
    
    const { empProfileId, planid } = useParams<{ empProfileId: string, planid: string }>();

        const handleDownload = async (e: React.MouseEvent, id:number) => {
        e.preventDefault();
        try {
          const expenseProofList = await api.get<ExpenseProof[]>(`ExpenseProof/getExpenseProofForExpenseid/${id}`);
           console.log('KKKKK: ',expenseProofList)
           const documentpath = expenseProofList.data[0].proofDocumentUrl;
           console.log(documentpath);
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

    const { data, isLoading, isError, error } = useExpense(empProfileId, planid);
    console.log(data);
    if (!data) {
        return <h2>No Expense Found..</h2>
    }
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const allamountStatus = data.reduce((exp , item)=>{
        const amount = Number(item.amount);
        if(item.status=="Approved"){
            exp.approvedAmount += amount;
        }else if(item.status =="Rejected") {
            exp.rejectedAmount+=amount;
        }else{
            exp.pendingAmount+=amount;
        }
        return exp;
    } , {approvedAmount : 0 , rejectedAmount : 0 , pendingAmount : 0})

    const totalAmount = data?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
    return (
        <>
            <div className='font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>ExpenseList  </div>
            <button onClick={()=>navigate(-1)} className='underline text-blue-500'>Back</button>
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
                            <th className="px-6 py-3 font-medium">Expense Type </th>
                            <th className="px-6 py-3 font-medium">Amount  </th>
                            <th className="px-6 py-3 font-medium">Description </th>
                            <th className="px-6 py-3 font-medium">Documents</th>
                            <th className="px-6 py-3 font-medium">Status </th>
                            <th className="px-6 py-3 font-medium">Updated By </th>
                            <th className="px-6 py-3 font-medium">HR Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.filter((item)=>(selectedType==="" || item.expenseType.toString()===selectedType)&&(    (selectedStatusType === "" || item.status === selectedStatusType))).map((item, index) => (
                            <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                                <td className="px-6 py-4">
                                    {item.expenseType === 1 ? "Food" : item.expenseType === 2
                                        ? "Travel" : item.expenseType === 3 ? "Accommodation" : "Unknown"}
                                </td>
                                <td className="px-6 py-4">{item.amount}</td>
                                <td className="px-6 py-4">{item.description}</td>
                                <td className="px-6 py-4 col ">
                                    <button
                                       onClick={(e) => handleDownload(e, item.id)} 
                                        className='font-medium text-blue-600 hover:underline flex items-center'
                                    >
                                        Proof Documents
                                    </button>
                                </td >
                                <td className="px-6 py-4">{item.status}</td>

                                <td className="px-6 py-4">{item.approvedBy}</td>
                                <td className="px-6 py-4">{item.hrRemarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
            <div className='text-right'>
                <p className="text-red-500 text-xl font-bold mt-3">
                    Total Claim Amount : {totalAmount}
                </p>
            </div>  

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4">
                <div>
                    <p className="text-sm text-green-700 font-semibold uppercase">Total Approved</p>
                    <p className="text-2xl font-bold text-green-900">{allamountStatus.approvedAmount.toLocaleString()}</p>
                </div>
                <div >
                    <p className="text-sm text-red-700 font-semibold uppercase">Total Rejected</p>
                    <p className="text-2xl font-bold text-red-900">{allamountStatus.rejectedAmount.toLocaleString()}</p>
                </div>
                <div >
                    <p className="text-sm text-yellow-700 font-semibold uppercase">Total Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{allamountStatus.pendingAmount.toLocaleString()}</p>
                </div>
            </div>


        </>



    )
}
export default EmpTravelExpense;
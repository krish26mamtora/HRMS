import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import useExpense from '../hooks/useExpense';
import useProofDocument from '../hooks/useProofDocument';
import api from '../../auth/api/axios';
import type { Expense } from '../hooks/useExpense';

type Props = {}

const ExpenseList = (props: Props) => {

    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [openApprovalModal, setopenApprovalModal] = useState(false);
    const [approvestatus, setapprovestatus] = useState(false);
    const [selectedStatusType , setselectedStatusType] = useState('');
    const[selectedType , setselectedType] = useState('');
    const [hrRemarks, sethrRemarks] = useState("");
    const approvalmodel = (item: Expense, approve: boolean) => {
        setSelectedExpense(item);
        setapprovestatus(approve);
        setopenApprovalModal(true);
    }

    const updateStatus = async (e) => {
        e.preventDefault();
        const statusvalue = approvestatus ? "Approved" : "Rejected";
        try {
            const updatedData = {
                ...selectedExpense,
                hrRemarks: hrRemarks,
                status: statusvalue,
                approvedBy: localStorage.getItem('id')
            };
            await api.put(`/Expense/${selectedExpense.id}`, updatedData);
            setopenApprovalModal(false);
            sethrRemarks("");
        } catch (err) {
            console.log(err);
        }
    }
    const navigate = useNavigate();

    const openProofPage = (id: number) => {
        navigate(`/hr/travel/expense/proof/${id}`);
    };
    const { planId, empId } = useParams<{ planId: string, empId: string }>();

    const { data, isLoading, isError, error } = useExpense(planId, empId);
    console.log(data);
    if (!data) {
        return <h2>No Expense Found..</h2>
    }
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;


    const activeApprove = "mt-2 mr-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors";
    const disabledApprove = "mt-2 mr-2 bg-green-300 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors";
    const activeReject = "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition";
    const disabledReject = "bg-red-300 text-white px-4 py-2 rounded hover:bg-red-400 transition";

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
                             <th className="px-6 py-3 font-medium">Expense Date </th>
                            <th className="px-6 py-3 font-medium">Documents</th>
                            <th className="px-6 py-3 font-medium">Status </th>
                            <th className="px-6 py-3 font-medium">Updated By </th>
                            <th className="px-6 py-3 font-medium">HR Remarks</th>
                            <th className="px-6 py-3 font-medium">Action</th>
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
                                 <td className="px-6 py-4">{new Date(item.expenseDate).toISOString().split("T")[0]}</td>
                                <td className="px-6 py-4 col ">
                                    <button
                                        onClick={() => openProofPage(item.id)}
                                        className='font-medium text-blue-600 hover:underline flex items-center'
                                    >
                                        Proof Documents
                                    </button>
                                </td >
                                <td className="px-6 py-4">{item.status}</td>

                                <td className="px-6 py-4">{item.approvedBy}</td>
                                <td className="px-6 py-4">{item.hrRemarks}</td>
                                <td>
                                    <button onClick={() => approvalmodel(item, true)} className={item.status === "Approved" ? disabledApprove : activeApprove} disabled={item.status === "Approved"} >Approve</button>
                                    <button onClick={() => approvalmodel(item, false)} className={item.status === "Rejected" ? disabledReject : activeReject} disabled={item.status === "Rejected"}>Reject</button>
                                </td>
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

            {openApprovalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Update Status</h3>
                        <form onSubmit={updateStatus}>
                            <label className="block mb-2">Remarks:</label>
                            <input
                                type="text" className="w-full border p-2 rounded mb-4" value={hrRemarks} onChange={(e) => sethrRemarks(e.target.value)} required />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setopenApprovalModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>)}

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
export default ExpenseList;
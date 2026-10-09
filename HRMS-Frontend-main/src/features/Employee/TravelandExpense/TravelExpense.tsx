import React, { useEffect, useState, FormEvent } from 'react';
import api from '../../auth/api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import useExpense from '../hooks/useExpense';
import type { ExpenseProof } from '../../HR/hooks/useProofDocument';

export const TravelExpense = () => {
    const [expenseType, setexpenseType] = useState('');
    const [amount, setAmount] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [travelAssignId, setTravelAssignId] = useState('');
    const [expensedate , setExpensedate] = useState(null);
    const [description, setDescription] = useState('');
    const [selectedStatusType , setselectedStatusType] = useState('');
    const[selectedType , setselectedType] = useState('');
    const [lastDateforExpense, setlastDateforExpense] = useState(null);
    var allowExpense = false;
    const { id } = useParams();
    const numPlanId = id ? Number(id) : 0;
    const EmpId = localStorage.getItem('id');
    const naviagte = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/TravelPlan/date/${numPlanId}`);
                setlastDateforExpense(response.data);
            } catch (error) {
                console.error("Error fetching travel last date :", error);
            }
        };
        if (numPlanId) fetchData();
    }, [numPlanId]);


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


    const handleSubmit = async (e: FormEvent, id:number) => {
        e.preventDefault();
        if (!file) return alert("Please upload proof");

        try {
            const expenseData = {
                expenseType: Number(expenseType),
                amount: Number(amount),
                travelAssignId: Number(travelAssignId),
                description: description,
                expensedate : expensedate
            };
            console.log(expenseData);
            const expenseResponse = await api.post('/Expense', expenseData);

            if (expenseResponse.status >= 200 && expenseResponse.status < 300) {

                const newExpenseId = expenseResponse.data.id;
                 console.log('new expense id : ',newExpenseId)
                const fileData = new FormData();
                fileData.append('ProofDocument', file);
                fileData.append('TravelExpenseId', newExpenseId);

                await api.post('/ExpenseProof', fileData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Expense and Document submitted!");
                const notificationData = {
                    travelExpenseId: newExpenseId,
                    recipientEmail: "micosaf532@him6.com", 
                    senderId: Number(localStorage.getItem('id')),
                    subject: "New Expense Claim Submitted",
                    body: `New expense claim for ${amount} has been submitted. Description: ${description}`
                };
                await api.post('/Expense/notifyExpenseCreate', notificationData);
                alert("Expense, Document, and Notification submitted successfully!");
            }
        } catch (error) {
            if (error.response) {
                const serverMessage = error.response.data.message || "An error occurred";
                alert(serverMessage); 
            }
            console.error("Error submitting expense:", error);
            alert("Submission failed.");
        }
    };



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

    

    function compareDateWithOffset(targetDateString: string , currentDate) {
        // const currentDate = new Date();
        const targetDate = new Date(targetDateString);
        if (isNaN(targetDate.getTime())) {
            return false;
        }
        const offsetDays = 10;
        const tenDaysInMilliseconds = offsetDays * 24 * 60 * 60 * 1000;
        const targetDatePlusTenDays = new Date(targetDate.getTime() + tenDaysInMilliseconds);
        return targetDatePlusTenDays;
    }
    const currentDate = new Date();
    var DisplayMessageForExpenseWindow;
    const targetDatePlusTenDays = compareDateWithOffset(lastDateforExpense , currentDate);
    if(currentDate > targetDatePlusTenDays){
        DisplayMessageForExpenseWindow = "Expense wondow closed !!";
       allowExpense = false;
    }else{
       allowExpense = true;
         DisplayMessageForExpenseWindow = "Last Date for Expense Submission is : "+ targetDatePlusTenDays ;
    }
   
       
    // console.log(canCreateExpenseRequest); 
    return (
        <>
        <div>
            <div className="mt-5 relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default p-5">
                <h1 className="text-2xl font-bold mb-4">Travel Expenses</h1>
                <button className='underline text-blue-500' onClick={()=>naviagte(-1)}>Back</button>
                <h4 className='text-red-500'>{DisplayMessageForExpenseWindow}</h4>
                <br />
                <form onSubmit={handleSubmit} className="w-full flex flex-row justify-between items-end">
                    <div className="flex flex-col">
                        <label htmlFor="expenseType">Expense Type : </label>
                        <select name="expenseType" id="expenseType" className="border rounded p-1" onChange={(e) => setexpenseType(e.target.value)} required ><option value="">Select</option><option value="1">Food Expense</option><option value="2">Transportation Expense</option><option value="3">Accommodation Expenses</option></select></div>
                    <div className="flex flex-col">
                        <label htmlFor="Description">Description : </label>
                        <input type="text" name='Description' className="border rounded p-1" placeholder="Description" onChange={(e) => setDescription(e.target.value)} required /></div>
                    <div className="flex flex-col">
                        <label htmlFor="Amount">Amount : </label>
                        <input type="number" name='Amount' className="border rounded p-1" placeholder="Amount" onChange={(e) => setAmount(e.target.value)} required /></div>
                    <div className="flex flex-col">
                        <label htmlFor="expensedate">Expense Date : </label>
                        <input type="date" name='expensedate' className="border rounded p-1" placeholder="Expese Date" onChange={(e) => setExpensedate(e.target.value)} required /></div>
                    <div className="flex flex-col">
                        <label htmlFor="proofDocument">Proof Document : </label>
                        <input type="file" accept=".pdf,.doc,.docx" name='proofDocument' className="border rounded p-0.5" onChange={(e) => setFile(e.target.files?.[0] || null)} required /></div>
                    <button type="submit"  disabled={!allowExpense}  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded">Add Expense</button>
                </form>
            </div>


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
                              <th className="px-6 py-3 font-medium">Expense Date :</th>
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
                                <td className="px-6 py-4">{new Date(item.expenseDate).toISOString().split("T")[0]}</td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
                    
            </div>
        </>
    );
};

export default TravelExpense;

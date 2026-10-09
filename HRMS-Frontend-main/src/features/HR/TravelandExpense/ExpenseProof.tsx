import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import useExpense from '../hooks/useExpense';
import useProofDocument from '../hooks/useProofDocument';
import api from '../../auth/api/axios';

type Props = {}

const ExpenseProof = (props: Props) => {

const { expenseId } = useParams<{ expenseId: string }>(); 
    console.log(typeof(expenseId), expenseId); 
      const { data, isLoading, isError, error } = useProofDocument(Number(expenseId));

    // const { data, isLoading, isError, error } = useProofDocument(7);

    data?.map((item, index) => (
        console.log(item.ProofDocumentUrl)

    ));

    if (!data) {
        return <h2>No Expense Found..</h2>
    }
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;    
            const handleDownload = async (e: React.MouseEvent, ProofDocumentUrl: string) => {
                e.preventDefault();
        
                try {
                    const response = await fetch(`https://localhost:7035/api/ExpenseProof/download-expense-proof/${ProofDocumentUrl}`);
                    if (!response.ok) {
                        throw new Error('Could not download the file. Please check if the file exists.');
                    }
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    
                    const fileName = ProofDocumentUrl.includes('_')?ProofDocumentUrl.split('_').slice(1).join('_') : ProofDocumentUrl;
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
            <div className='font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>Expense Proofs  </div>

            <div className="mt-5 relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                <table id="search-table" className="w-full text-sm text-left rtl:text-right text-body">
                    <thead className="bg-neutral-secondary-soft border-b border-default">
                        <tr>
                            <th className="px-6 py-3 font-medium">ProofDocumentUrl</th>
                              <th className="px-6 py-3 font-medium">Action</th>
                            <th className="px-6 py-3 font-medium">Uploaded At </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((item, index) => (
                            <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                               
                                <td className="px-6 py-4">{item.proofDocumentUrl.split('_')[1]}</td>

                                <td className="px-6 py-4 col ">
                                    <a
                                       onClick={(e) => handleDownload(e, item.proofDocumentUrl)} 

                                        className='font-medium text-blue-600 hover:underline flex items-center'
                                    >
                                      
                                       download
                                    </a>
                                </td >
                                <td className="px-6 py-4">{item.createdAt}</td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </>

    )
}
export default ExpenseProof;
import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import api from '../../auth/api/axios';
import type {TravelDocument} from '../../HR/hooks/useTravelDocument';
import { useNavigate, useParams } from 'react-router-dom';
import useTravelDocument from '../../HR/hooks/useTravelDocument';
type Props = {}

const EmpTravelDocuments = (props: Props) => {
      const [filterType, setFilterType] = useState('');
       const [UploadedBy, setUploadedBy] = useState(localStorage.getItem('id') || '');
        const [TravelDocument, setTravelDocument] = useState<File | null>(null);
        const [Description, setDescription] = useState('');
        const [Type, setType] = useState('');
        const [CreatedAt, setCreatedAt] = useState('');
  const [travelAssignId, setTravelAssignId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { empProfileId, id } = useParams<{ empProfileId: string, id: string }>();
    const [filedoc, setFile] = useState<File | null>(null);

     useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/Expense/getId?EmpId=${empProfileId}&PId=${id}`);
                setTravelAssignId(response.data);
            } catch (error) {
                console.error("Error fetching travel assign id:", error);
            }
        };
        if (empProfileId && id) fetchData();
    }, [empProfileId, id]);

  console.log('Travel Assign Id : ',travelAssignId);


    const { data, isLoading, isError, error } = useTravelDocument(Number(travelAssignId));
    console.log('Documents Received : ', data);
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;


    
        const handleDownload = async (e: React.MouseEvent, travelDocumentUrl: string) => {
            e.preventDefault();
    
            try {
                const response = await fetch(`https://localhost:7035/api/TravelDocument/download-travel-document/${travelDocumentUrl}`);
                if (!response.ok) {
                    throw new Error('Could not download the file. Please check if the file exists.');
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
    
                const fileName = travelDocumentUrl.includes('_') ? travelDocumentUrl.split('_').slice(1).join('_') : travelDocumentUrl;
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
    <div className='font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>Travel Documents</div>

    <button className='underline text-blue-500' onClick={()=>navigate(-1)}>Back</button>

      <div className="flex justify-end p-2 bg-gray-50 border-b">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-xs border rounded p-1 outline-none" >
          <option value="">All Types</option>
          <option value="Tickets">Tickets</option>
          <option value="Visa Invitation/Support Letter">Visa Invitation/Support Letter</option>
          <option value="Hotel/Accommodation Vouchers">Hotel/Accommodation Vouchers</option>
          <option value="Travel Policy PDF">Travel Policy PDF</option>
          <option value="Travel Insurance Policy">Travel Insurance Policy</option>
        </select>
      </div>


      <div className="mt-5 relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                <table id="search-table" className="w-full text-sm text-left rtl:text-right text-body">
                    <thead className="bg-neutral-secondary-soft border-b border-default">
                        <tr>
                            <th className="px-6 py-3 font-medium">Type : </th>
                            <th className="px-6 py-3 font-medium">Description : </th>
                            <th className="px-6 py-3 font-medium">uploadedBy</th>
                            <th className="px-6 py-3 font-medium">Download :</th>
                            <th className="px-6 py-3 font-medium">Created At :</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.filter((item)=>filterType === "" || item.type===filterType).map((item, index) => (
                            <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                                <td className="px-6 py-4">
                                   {item.type}
                                </td>
                                <td className="px-6 py-4">{item.description}</td>
                                <td className="px-6 py-4">
                                 {item.uploadedBy==localStorage.getItem('id') ? 'You': item.uploadedBy }

                                </td>
                                <td className="px-6 py-4 col ">
                                    <a
                                         onClick={(e) => handleDownload(e,item.travelDocumentUrl)} 
                                        className='font-medium text-blue-600 hover:underline flex items-center'
                                    >
                              
                                        {item.travelDocumentUrl.split('_')[1]}
                                    </a>
                                  <img src="src/features/HR/TravelandExpense/PDF_ICON.jpg" alt="PDF" className="pdf-icon"/>

                                </td >
                                <td className="px-6 py-4">{item.createdAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

    </>
  );
};

export default EmpTravelDocuments;

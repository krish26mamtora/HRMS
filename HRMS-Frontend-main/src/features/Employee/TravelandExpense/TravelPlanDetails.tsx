import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import api from '../../auth/api/axios';
import type { TravelDocument } from "../hooks/useTravelDocument";
import { useNavigate, useParams } from 'react-router-dom';
import useTravelDocument from '../../HR/hooks/useTravelDocument'
type Props = {}

const TravelPlanDetails = (props: Props) => {

  const [UploadedBy, setUploadedBy] = useState(localStorage.getItem('id') || '');
  const [TravelDocument, setTravelDocument] = useState<File | null>(null);
  const [filterType, setFilterType] = useState('');

  const [Description, setDescription] = useState('');
  const [Type, setType] = useState('');
  const [CreatedAt, setCreatedAt] = useState('');
  const [travelAssignId, setTravelAssignId] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const [filedoc, setFile] = useState<File | null>(null);
  const empId = localStorage.getItem('id');
const navigate = useNavigate();
  console.log(id, empId);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/Expense/getId?EmpId=${empId}&PId=${id}`);
        setTravelAssignId(response.data);
      } catch (error) {
        console.error("Error fetching travel assign id:", error);
      }
    };
    if (empId && id) fetchData();
  }, [empId, id]);

  console.log('Travel Assign Id : ', travelAssignId);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!filedoc || !travelAssignId) {
      alert('Please fill all fields and select a file.');
      return;
    }
    console.log(UploadedBy, Description, Type, travelAssignId);
    try {
      const data = new FormData();
      data.append('Description', Description);
      data.append('UploadedBy', UploadedBy);
      data.append('Type', Type);
      data.append('TravelAssignmentId', travelAssignId);
      data.append('TravelDocument', filedoc);

      const res = await api.post('/TravelDocument', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status >= 200 && res.status < 300) {
        alert('Document Added !!');
        setDescription('');
        setType('');
        return;
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

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

      <div className="overflow-x-auto bg-neutral-primary-soft shadow-sm rounded-lg border border-gray-200 p-4">
        <br />
        <form onSubmit={handleSubmit} className="flex flex-row items-center gap-4 whitespace-nowrap">
          <div className="flex items-center gap-2">

            <label htmlFor="Type" className="text-sm font-medium">Document Type : </label>
            <select value={Type} name="Type" id="Type" onChange={(e) => setType(e.target.value)} required className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" >
              <option value="">Select</option>
              <option value="Passport Scan">Passport Scan</option>
              <option value="Visa Copy/Scans">Visa Copy/Scans</option>
              <option value="Boarding Passes">Boarding Passes</option>
              <option value="Health Certificates">Health Certificates</option>
              <option value="Local Transport Receipts">Local Transport Receipts</option>
              <option value="Food & Beverage">Food & Beverage</option>

              <option value="Transport">Transport</option>
            </select>
          </div>
          <div className="flex items-center gap-2 w-1/2">
            <label htmlFor="Description" className="text-sm font-medium">Description : </label>
            <input type="text" name='Description' placeholder="Description" value={Description} onChange={(e) => setDescription(e.target.value)} required className="flex-1 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label htmlFor="TravelDocument" className="text-sm font-medium">Document : </label>
            <input type="file" accept=".pdf,.doc,.docx" name='TravelDocument' onChange={(e) => setFile(e.target.files?.[0] || null)} required className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded">Add Document</button>
        </form>
      </div>

      <div className="flex justify-end p-2 bg-gray-50 border-b">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-xs border rounded p-1 outline-none" >
          <option value="">All Types</option>
          <option value="Tickets">Tickets</option>
          <option value="Visa Invitation/Support Letter">Visa Invitation/Support Letter</option>
          <option value="Hotel/Accommodation Vouchers">Hotel/Accommodation Vouchers</option>
          <option value="Travel Policy PDF">Travel Policy PDF</option>
          <option value="Travel Insurance Policy">Travel Insurance Policy</option>
          <option value="Policy PDFs">Policy PDFs</option>
          <option value="Passport Scan">Passport Scan</option>
          <option value="Visa Copy/Scans">Visa Copy/Scans</option>
          <option value="Boarding Passes">Boarding Passes</option>
          <option value="Health Certificates">Health Certificates</option>
          <option value="Local Transport Receipts">Local Transport Receipts</option>
          <option value="Food & Beverage">Food & Beverage</option>
          <option value="Transport">Transport</option>

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
            {data?.filter((item) => filterType === "" || item.type === filterType).map((item, index) => (
              <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                <td className="px-6 py-4">
                  {item.type}
                </td>
                <td className="px-6 py-4">{item.description}</td>
                <td className="px-6 py-4">
                  {item.uploadedBy == localStorage.getItem('id') ? 'You' : 'HR'}

                </td>
                <td className="px-6 py-4 col ">
                  <a
                    onClick={(e) => handleDownload(e, item.travelDocumentUrl)}
                    className='font-medium text-blue-600 hover:underline flex items-center'
                  >

                    {item.travelDocumentUrl.split('_')[1]}
                  </a>
                  <img src="src/features/HR/TravelandExpense/PDF_ICON.jpg" alt="PDF" className="pdf-icon" />

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

export default TravelPlanDetails;

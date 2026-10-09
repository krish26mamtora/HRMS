import React, { useState, type ChangeEvent, type FormEvent } from 'react'
import api from '../../auth/api/axios';
import type { AxiosError } from 'axios';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
type Props = {}

export interface JobCreate {
    Title: string;
    Description: string;
    Status: string;
    ExpYearsReq: number;
    Role: string;
    TotalPositions: number;
    ReviewerEmail:string;
    JdUrl: File | null;
    ContactMail: string
    ManagedBy: number;
}

const CreateJob = (props: Props) => {
    const [feedback, setFeedback] = useState({ message: '', error: '' });

    const [formData, setFormData] = useState<JobCreate>({
        Title: '',
        Description: '',
        Status: '',
        ExpYearsReq: 0,
        Role: '',
        TotalPositions: 1,
        ReviewerEmail:'',
        JdUrl: null,
        ContactMail: '',
        ManagedBy: Number(localStorage.getItem('id')) || 0
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData, [name]: value,
        }))
    }
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, JdUrl: e.target.files![0] }));
        }
    };
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/hr/jobs/');
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData();

        data.append('Title', formData.Title);
        data.append('Description', formData.Description);
        data.append('Role', formData.Role);
        data.append('ContactMail', formData.ContactMail);
        data.append('Status', formData.Status || "Open");
        data.append('ExpYearsReq', formData.ExpYearsReq.toString());
        data.append('ReviewerEmail' , formData.ReviewerEmail);
        data.append('TotalPositions', formData.TotalPositions.toString());
        data.append('ManagedBy', formData.ManagedBy.toString());

        if (formData.JdUrl) {
            data.append('JdUrl', formData.JdUrl);
        }

        try {
            const res = await api.post("/jobListing", data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.status === 201 || res.status === 200) {
                alert("Job created successfully!");
                navigate('/hr/jobs/');
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("Server Error:", err.response?.data);
            }
        }
    };

    return (
        <>
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Open New Position</h2>
                    <button onClick={handleClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm">
                        Close
                    </button>
                </div>
                <div className="">
                    <form onSubmit={handleSubmit} className="space-y-4 ">
                        <div>
                            <label htmlFor="Title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input type="text" id="Title" name="Title" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.Title} onChange={handleChange} required />
                        </div>
                        <div>
                            <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="Description" name="Description" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.Description} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="ExpYearsReq" className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
                                <input type="number" id="ExpYearsReq" name="ExpYearsReq" className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.ExpYearsReq} onChange={handleChange} required />
                            </div>
                            <div>
                                <label htmlFor="Role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <input type="text" id="Role" name="Role" className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.Role} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="Status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select id="Status" name="Status" value={formData.Status} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
                                    <option value="open">Open</option>
                                    <option value="on hold">On Hold</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="TotalPositions" className="block text-sm font-medium text-gray-700 mb-1">No. of Openings</label>
                                <input type="number" id="TotalPositions" name="TotalPositions" className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.TotalPositions} onChange={handleChange} required />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="ReviewerEmail" className="block text-sm font-medium text-gray-700 mb-1">Reviewer Email</label>
                                <input type="email" id="ReviewerEmail" name="ReviewerEmail" className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.ReviewerEmail} onChange={handleChange} required />
                            </div>
                            <div>
                                <label htmlFor="ContactMail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                <input type="email" id="ContactMail" name="ContactMail" className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.ContactMail} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="JdUrl" className="block text-sm font-medium text-gray-700 mb-1">JD URL</label>
                                <input type="file" id="JdUrl"  name="JdUrl" className="w-full border border-gray-300 rounded-md px-3 py-2" onChange={handleFileChange}  accept=".pdf,.doc,.docx" required/>            </div>
                            {/* <div>
                                <label htmlFor="ContactMail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                <input type="email" id="ContactMail" name="ContactMail" className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.ContactMail} onChange={handleChange} required />
                            </div> */}
                        </div>

                        <input type="hidden" name="ManagedBy" value={localStorage.getItem('id') || ''} />

                        <div className="pt-4">
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md shadow transition duration-200">
                                Create Job Opening
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
export default CreateJob
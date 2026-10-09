import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import api from '../../auth/api/axios';
import type { ReferalCreate } from './types';

interface ModalProps {
    jobId: number;
    jobTitle: string;
    sendMails: string[];
    isOpen: boolean;
    onClose: () => void;
}

const ReferralModal: React.FC<ModalProps> = ({ jobId, jobTitle, sendMails,isOpen, onClose }) => {
    console.log(sendMails);

     const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<ReferalCreate>({
        JobId: jobId,
        ReffMail: '',
        ReffResume: null,
        SendMails :sendMails,
        ReffName: '',
        EmpId: parseInt(localStorage.getItem('id') || '0'),
        Description: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value , type } = e.target;
        if(e.target instanceof HTMLInputElement && e.target.type === 'file'){
            const fileInput = e.target as HTMLInputElement;
            setFormData((prev) => ({ 
                ...prev, 
                [name]: fileInput.files ? fileInput.files[0] : null 
            }));
        }else{
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.EmpId || !formData.JobId || !formData.ReffMail || !formData.ReffName || !formData.ReffResume) {
            alert('Please fill required fields!!');
            return;
        }
        try {
               const data = new FormData();
                data.append('JobId', formData.JobId.toString());
                data.append('ReffName', formData.ReffName);
                data.append('ReffMail', formData.ReffMail);
                data.append('ReffResume', formData.ReffResume);
                data.append('EmpId', formData.EmpId.toString());
                data.append('Description', formData.Description);
                // data.append('ReceiverEmails' , formData.SendMails);
                sendMails.forEach((email) => {
                    if (email) data.append('ReceiverEmails', email);
                });

                const res = await api.post('/Referal', data , {
                     headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                });
                
                alert('Friend Referred !!');
                onClose();
     
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (!isOpen) return null;

    return (
       <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white p-6 rounded-lg shadow-md">
                
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Refer a Friend</h2>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">Role: {jobTitle}</p>
                    </div>
                    <button  onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm font-medium" > Close </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
                        <input  name="ReffName" value={formData.ReffName} onChange={handleChange} type="text"  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"   placeholder="Enter friend's full name" required  />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Email</label>
                        <input name="ReffMail" value={formData.ReffMail}onChange={handleChange} type="email" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"  placeholder="email@example.com"  required  />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resume (PDF/DOCX)</label>
                        <div className="flex items-center gap-4">
                            <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-400 rounded-md py-4 cursor-pointer hover:bg-gray-50 transition-all text-gray-500 bg-gray-50/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase">
                                    {formData.ReffResume ? (formData.ReffResume as File).name : 'Upload Candidate Resume'}
                                </span>
                                <input type="file" name="ReffResume" accept=".pdf,.doc,.docx" onChange={handleChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation Note</label>
                        <textarea  name="Description" value={formData.Description} onChange={handleChange}rows={3}  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"  placeholder="Why do you recommend this person?"  />
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 border border-blue-700 rounded transition-colors disabled:bg-gray-400 shadow-sm active:scale-95">
                            {isSubmitting ? 'Sending...' : 'Submit Referral'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReferralModal;

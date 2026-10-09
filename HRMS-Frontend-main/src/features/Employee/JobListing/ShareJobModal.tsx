import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import api from '../../auth/api/axios';
import type {  ShareJob } from './types';

interface ModalProps {
    jobId: number;
    jobTitle: string;
     jobUrl: string; 
    isOpen: boolean;
    onClose: () => void;
}
const SharejobModal: React.FC<ModalProps> = ({ jobId, jobTitle , jobUrl,isOpen, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ShareJob>({
        JobId: jobId,
        ReceiverMail: '',
        Subject: '',
        Message: '',
        EmpId: parseInt(localStorage.getItem('id') || '0'),
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
     const data = new FormData();
        data.append('JobId', formData.JobId.toString());
        data.append('ReceiverMail', formData.ReceiverMail);
        data.append('Subject', formData.Subject);
        data.append('Message', formData.Message);
        data.append('EmpId', formData.EmpId.toString());
    
        if (selectedFile) {
            data.append('JobDescriptionPdf', selectedFile); 
        }
    try {
        const response = await api.post('/ShareJob', data, {
            headers: { 'Content-Type': 'multipart/form-data' } 
        });
        if (response.status === 200) {
            alert("Email sent successfully!");
            onClose(); 
        }
    } catch (error) {
        console.error("Error sending email:", error);
        alert("Failed to send email. Check console for details.");
    }
};

    if (!isOpen) return null;

    return (
       <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Share Job</h2>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">{jobTitle}</p>
                    </div>
                    <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm font-medium">Close</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Friend's Email</label>
                        <input name="ReceiverMail" value={formData.ReceiverMail} onChange={handleChange} type="email" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 outline-none text-sm" placeholder="email@example.com" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input name="Subject" value={formData.Subject} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 outline-none text-sm" placeholder="Subject" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <input name="Message" value={formData.Message} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 outline-none text-sm" placeholder="Add a note..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (JD PDF)</label>
                        <label className="flex flex-col items-center justify-center border border-dashed border-gray-400 rounded-md py-4 cursor-pointer hover:bg-gray-50 transition-all text-gray-500 bg-gray-50/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            <span className="text-[10px] font-bold uppercase">{selectedFile ? selectedFile.name : 'Attach JD PDF'}</span>
                            <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 border border-blue-700 rounded transition-colors disabled:bg-gray-400 shadow-sm active:scale-95 text-sm">
                            {isSubmitting ? 'Sending...' : 'Send Email'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SharejobModal;
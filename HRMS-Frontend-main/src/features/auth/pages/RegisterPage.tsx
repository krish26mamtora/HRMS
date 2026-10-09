import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import axios, { AxiosError } from 'axios';

export default function RegisterPage() {
    const [form, setForm] = useState({
        Email: "", password: "",
    });

    const [feedback, setFeedback] = useState({ message: '', error: '' });

    const navigate = useNavigate();
    const { login } = useAuth();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback({ message: '', error: '' });

        if (!form.Email || !form.password) {
            setFeedback(prev => ({ ...prev, error: 'Please enter both Email and password.' }));
            return;
        }
        try {
            const res = await api.post("/auth/register", form);
            if (res.status === 200 || res.status === 201) {
                alert("register successfully please login!");
                navigate("/login");
            }
        } catch (err: any) {
            console.error("Full Error Object:", err);

            if (err.response) {
                const serverError = err.response.data?.message || (typeof err.response.data === 'string' ? err.response.data : null) || "Server Error";
                setFeedback({ message: '', error: serverError });
            } else {
                setFeedback({ message: '', error: err.message });
            }

        }

    }
    return (
        <div className="p-4 max-w-sm mx-auto">

            {feedback.message && <p style={{ color: 'green' }}>{feedback.message}</p>}
            {feedback.error && <p style={{ color: 'red' }}>{feedback.error}</p>}
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="Email">Email:</label>
                    <input type="text" id="Email" value={form.Email} name="Email" className="border border-gray-300 rounded px-2 py-1 w-full" onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={form.password} name="password" className="border border-gray-300 rounded px-2 py-1 w-full" onChange={handleChange} required />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Register</button>

            </form>
        </div>
    )
}

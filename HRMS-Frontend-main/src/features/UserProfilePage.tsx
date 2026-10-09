import React, { useEffect, useState } from 'react'
import api from './auth/api/axios';
import useThemeStore from '../store/useThemeStore';

const UserProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const userId = localStorage.getItem('id');
    const { isDarkMode, toggleTheme } = useThemeStore();
    
    const handleinputChanges = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const updateProfile = async () => {
        try {
            await api.put(`/UserProfile/${userId}`, formData);
            //console.log("hii");
            setUser({ ...formData });
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Can not modify profile");
        }
    }

    useEffect(() => {
        if (userId) {
            api.get(`/UserProfile/${userId}`)
                .then(response => {
                    setUser(response.data);
                    setFormData(response.data);
                })
                .catch(err => {
                    setError("Failed to load profile.");
                });
        } else {
            setError("No user ID found in storage.");
        }
    }, [userId]);

    if (error) return <div className="p-10 text-red-500">{error}</div>;
    if (!user || !formData) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white rounded-2xl  border border-gray-100">

                <div className="p-8 border-b border-gray-50 bg-slate-50/50">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="h-24 w-24 bg-blue-300 rounded-full flex items-center justify-center text-3xl  border-4 border-white ">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <EditableField name="firstName" isEditing={isEditing} value={isEditing ? formData.firstName : user.firstName} onChange={handleinputChanges} />
                                <EditableField name="lastName" isEditing={isEditing} value={isEditing ? formData.lastName : user.lastName} onChange={handleinputChanges} />
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                                <div className="min-w-[150px]">
                                    <EditableField label="Designation" name="designation" isEditing={isEditing} value={isEditing ? formData.designation : user.designation} onChange={handleinputChanges} />
                                </div>
                                <div className="min-w-[150px]">
                                    <EditableField label="Department" name="department" isEditing={isEditing} value={isEditing ? formData.department : user.department} onChange={handleinputChanges} />
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700">
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 ">
                            <EditableField label="Address" name="address" isEditing={isEditing} value={isEditing ? formData.address : user.address} onChange={handleinputChanges} />
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 ">
                               <label className="text-xs  text-gray-400 uppercase">Favourite Sport</label>
                            {isEditing ? (
                                <select name="favouriteSport" value={formData.favouriteSport || ""} onChange={handleinputChanges} className="w-full mt-1 p-2 border-2 border-blue-100 rounded-lg outline-none focus:border-blue-500">
                                    <option value="">Favourite Sport</option>
                                    <option value="Table Pool">Table Pool</option>
                                    <option value="Chess">Chess</option>
                                    <option value="Carrom">Carrom</option>
                                </select>
                            ) : (
                                <p className="text-gray-800  text-lg mt-1">{user.favouriteSport || "Not provided"}</p>
                            )}
                            {/* <EditableField label="Favourite Sport" name="favouriteSport" isEditing={isEditing} value={isEditing ? formData.favouriteSport : user.favouriteSport} onChange={handleinputChanges} /> */}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 ">
                            <label className="text-xs  text-gray-400 uppercase">Gender</label>
                            {isEditing ? (
                                <select name="gender" value={formData.gender || ""} onChange={handleinputChanges} className="w-full mt-1 p-2 border-2 border-blue-100 rounded-lg outline-none focus:border-blue-500">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <p className="text-gray-800  text-lg mt-1">{user.gender || "Not provided"}</p>
                            )}
                        </div>

                         <div className="bg-white p-5 rounded-xl border border-gray-100 ">
                              <label className="text-xs  text-gray-400 uppercase">Birthday</label>
                              {
                                isEditing?(
                                    <input type="date" name="birthday" value = {formData?.birthday||""}  onChange={handleinputChanges} className="w-full mt-1 p-2 border-2 border-blue-100 rounded-lg outline-none focus:border-blue-500"/>
                                ):(
                                    <p>
                                        {
                                            user?.birthday ||"Not provided"
                                        }
                                    </p>
                                )
                              }
                         </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100  flex items-center justify-between">
                            <div>
                                <label className="text-xs  text-gray-400 uppercase tracking-wider">Employment Status</label>
                                <p className=" text-gray-800 mt-1">{user.isActive ? 'ACTIVE' : 'INACTIVE'}</p>
                            </div>
                            <div className={`h-4 w-4 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></div>
                        </div>
                    </div>
                </div>
                <div>
                     <button onClick={toggleTheme} className='mr-2'>
                       Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
                    </button>
                </div>
                {isEditing && (
                    <div className="p-6 bg-gray-50 border-t flex justify-end">
                        <button onClick={updateProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-2.5 rounded-xlshadow-blue-100"> Save Profile Changes</button>
                    </div>
                )}
            </div>
        </div>
    )
}

const EditableField = ({ label, name, isEditing, value, onChange }: any) => (
    <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-xs  text-gray-400 uppercase">{label}</label>}
        {isEditing ? (
            <input name={name} value={value || ""} onChange={onChange} className="w-full p-2 border-2 border-blue-100 rounded-lg focus:border-blue-500" />
        ) : (
            <p className="text-gray-800  text-lg">{value || "Not provided"}</p>
        )}
    </div>
);

export default UserProfilePage;
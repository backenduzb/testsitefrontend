'use client';

import React, { useState, useEffect } from 'react';
import Image from '@/public/next.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AxiosError } from 'axios';
import axios from 'axios';
import { UserRoundIcon, UserStar } from 'lucide-react';
import { ROOT_URL } from './root_api';
import { useRouter } from 'next/navigation';
import useAuth from '@/auth/Authentications';

const LoginRegisterPage = () => {


    const { login } = useAuth();
    const router = useRouter();

    const [classes, setclasses] = useState<string[]>();
    const [registerFormdata, setregisterFormdata] = useState(
        {
            "full_name": "",
            "class_name": ""
        }
    );
    const [loginData, setloginData] = useState(
        {
            "username": "",
            "password": "",
        }
    );
    const handleRegisterdatachange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setregisterFormdata((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogindatachange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setloginData((prev) => ({ ...prev, [name]: value }));
    }
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${ROOT_URL}/accounts/login/`, loginData, {withCredentials: true});
            toast.success("Muvofaqiyatli login qilindi.");
            login();
            router.push('tests/');

        } catch (e) {
            console.log(e);
        }
    }

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${ROOT_URL}/accounts/register/`, registerFormdata);
            showPersistentToast(res.data.username);
        }
        catch (e) {
            console.error(e);
        }
    }

    const showPersistentToast = (username: any) => {
        toast.info(
            <div className="space-y-1">
                <p><strong>Username:</strong> <span className="font-mono">{username}</span></p>
                <p><strong>Password:</strong> <span className="font-mono">{username}</span></p>
            </div>,
            {
                position: "top-right",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                theme: "light"
            }
        );
    };

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get(`${ROOT_URL}/accounts/register/`);
                setclasses(res.data.map((class_name: any) => class_name.name));
                console.log(res.data[0].name);
            }
            catch (e) {
                console.error(e);
            }
        };
        fetchClasses();
    }, []);

    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    return (
        <div className="flex justify-center items-center -mt-20 h-screen px-4 ">
            <ToastContainer />
            <div className="bg-white mt-10 rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="flex justify-center items-center mb-6 h-20">
                    <img src={Image.src} alt="logo" width={124} height={124} />
                </div>

                <div className="flex justify-between mb-6 border-b border-gray-300">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`py-2 px-1 font-medium ${activeTab === 'login'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-600 hover:text-indigo-600 hover:cursor-pointer   '
                            }`}
                    >
                        Kirish
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`py-2 px-1 font-medium ${activeTab === 'register'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-600 hover:text-indigo-600 hover:cursor-pointer'
                            }`}
                    >
                        Ro‘yxatdan o‘tish
                    </button>
                </div>

                {activeTab === 'login' && (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Hisobga kirish</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600 font-medium">Foydalanuvchi nomi</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={loginData.username}
                                    onChange={handleLogindatachange}
                                    placeholder="Foydalanuvchi nomi"
                                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 font-medium">Parol</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLogindatachange}
                                    placeholder="Parol"
                                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                />
                            </div>
                            <button
                                onClick={handleLoginSubmit}
                                type="button"
                                className="w-full mt-5 py-2 hover:cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-300"
                            >
                                Kirish
                            </button>
                        </form>
                    </>
                )}

                {activeTab === 'register' && (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Ro‘yxatdan o‘tish</h2>
                        <form className="space-y-4">
                            <div className="flex flex-col w-full">

                                <label className="text-sm text-gray-600 font-medium ml-1">To'liq ismni kiriting</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={registerFormdata.full_name}
                                    onChange={handleRegisterdatachange}
                                    placeholder="To'liq ism"
                                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                />
                            </div>

                            <div className='flex flex-col w-full'>
                                <label className="text-sm text-gray-600 font-medium ml-1">Sinf</label>
                                <select
                                    name="class_name"
                                    value={registerFormdata.class_name}
                                    onChange={handleRegisterdatachange}
                                    className="rounded-lg bg-white bg-opacity-30 border border-gray-300 px-4 py-2 text-gray-500 focus:outline-none"
                                >
                                    <option value="">Sinfni tanlang</option>
                                    {classes?.map((cls) => (
                                        <option key={cls} value={cls}>
                                            {cls}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleRegisterSubmit}
                                type="button"
                                className="w-full py-2 bg-indigo-600 hover:cursor-pointer hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-300"
                            >
                                Ro‘yxatdan o‘tish
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div >
    );
};

export default LoginRegisterPage;

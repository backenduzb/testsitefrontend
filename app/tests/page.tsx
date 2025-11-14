"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ROOT_URL } from "../root_api";
import { useRouter } from "next/navigation";

export default function Test() {
    const [testdata, setTestdata] = useState([]);
    const router = useRouter();
    useEffect(() => {
        axios
            .get(`${ROOT_URL}/tests/all/`, { withCredentials: true })
            .then((res) => setTestdata(res.data.data))
            .catch((err) => console.error(err));
    }, []);

    const handleStartTest = async (test_id: number) => {
        router.push(`/testing/${test_id}`)
    }



    return (
        <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 font-mono select-none">
    
            <div className="w-full max-w-6xl overflow-hidden bg-white border border-gray-200 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.08)]">
                <div className="grid grid-cols-4 py-4 px-6 bg-white border-b border-gray-300 text-gray-500 font-semibold text-center">
                    <div>NOMI</div>
                    <div>FAN</div>
                    <div>TESTLAR SONI</div>
                    <div></div>
                </div>

                <div className="divide-y divide-gray-100">
                    {testdata.length > 0 ? (
                        testdata.map((cls: any, index: number) => (
                            <div
                                key={cls.id ?? index}
                                className="grid grid-cols-4 py-4 px-6 text-center text-gray-600 transition-all duration-300"
                            >
                                <div className="truncate font-medium text-gray-700">{cls.name}</div>
                                <div className="truncate text-gray-500">{cls.subject?.name}</div>
                                <div className="text-gray-500">{cls.test_count ?? "—"}</div>
                                <div className="w-40 h-full flex justify-center items-center">

                                    <p onClick={() => handleStartTest(cls.id)} className="font-sans text-gray-400 hover:text-indigo-700 hover:cursor-pointer transition-all duration-300">Testni boshlash</p>

                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center text-gray-400">
                            Ma’lumotlar yuklanmoqda...
                        </div>
                    )}
                </div>
            </div>

            <p className="text-sm text-gray-500 mt-6">
                Testlar soni:{" "}
                <span className="text-indigo-600 font-semibold">{testdata.length}</span>
            </p>
        </div>
    );
}

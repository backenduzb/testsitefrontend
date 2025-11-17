"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { ROOT_URL } from "@/app/root_api";
import Link from "next/link";

interface Scores {
    id: number;
    bilish: number;
    muhokama: number;
    qollash: number;
    bilish_count: number;
    muhokama_count: number;
    qollash_count: number;
    test: number;
    total: number;
    completed: number;
    score: number;
}

export default function Results() {
    const [scoreData, setScoreData] = useState<Scores[]>([]);
    const params = useParams();
    const testcase = params.id;

    useEffect(() => {
        const fetchScoresData = async () => {
            try {
                const res = await axios.post(
                    `${ROOT_URL}/scores/score/${testcase}/`,
                    {},
                    { withCredentials: true }
                );
                const dataArray = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
                setScoreData(dataArray);
            } catch (err) {
                console.error(err);
            }
        };
        fetchScoresData();
    }, [testcase]);

    return (
        <div className="h-screen flex-col flex items-center justify-start">

            <div className="w-40 relative rounded-full border-green-500 flex items-center justify-center font-mono text-gray-500 bg-white mt-10 border h-15">
                {scoreData.map((score) => (
                    <h2 className="text-4xl" key={score.id}>
                        {score.total}/{score.completed}
                    </h2>
                ))}                    
            </div>

            <table className="min-w-[60%] mt-10 border font-mono text-gray-500 border-gray-300 text-center shadow-[0_1px_5px] shadow-gray-300">
                <thead className="bg-gray-200">
                    <tr>
                        <th rowSpan={2} className="border bg-white border-gray-300 px-4 py-2">FAN</th>
                        <th colSpan={2} className="border px-4 bg-white border-gray-300 py-2">JAMI</th>
                        <th colSpan={2} className="border px-4 bg-white border-gray-300 py-2">BILISH</th>
                        <th colSpan={2} className="border px-4 bg-white border-gray-300 py-2">QO'LLASH</th>
                        <th colSpan={2} className="border px-4 bg-white border-gray-300 py-2">MULOHAZA</th>
                    </tr>
                    <tr>
                        <th className="border px-4 bg-white border-gray-300 py-2">TO’G’RI JAVOBLAR SONI</th>
                        <th className="border px-4 bg-white border-gray-300 py-2">BAL</th>
                        <th className="border px-4 bg-white border-gray-300 py-2">TO’G’RI JAVOBLAR SONI</th>
                        <th className="border px-4 bg-white border-gray-300 py-2">BAL</th>
                        <th className="border px-4 bg-white border-gray-300 py-2">TO’G’RI JAVOBLAR SONI</th>
                        <th className="border px-4 bg-white border-gray-300 py-2">BAL</th>
                        <th className="border px-4 bg-white border-gray-300 py-2">TO’G’RI JAVOBLAR SONI</th>
                        <th className="border px-4 bg-white border-gray-300 py-2">BAL</th>
                    </tr>
                </thead>
                <tbody>
                    {scoreData.map((score) => (
                        <tr key={score.id}>
                            <td className="border px-4 bg-white border-gray-300 py-2">Informatika</td>
                            <td className="border px-4 bg-white border-gray-300 py-2">{score.completed}</td>
                            <td className="border px-4 bg-white border-gray-300 py-2">{score.score}</td>
                            <td className="border px-4 bg-white border-gray-300 py-2">{score.bilish_count}</td>
                            <td className="border px-4 bg-white border-gray-300 py-2">{score.bilish}</td>
                            <td className="border px-4 bg-white border-gray-300 py-2">{score.qollash_count}</td>
                            <td className="border px-4 bg-white border-gray-300 py-2">{score.qollash}</td>
                            <td className="border px-4 bg-white border-gray-300 py-2">{score.muhokama_count}</td>
                            <td className="border px-4 bg-white border-gray-300 py-2">{score.muhokama}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Link href="/" className="w-40 h-10 bg-indigo-600 rounded hover:cursor-pointer hover:bg-indigo-700 transition-all duration-300 mt-20 flex items-center justify-center">
                <p className="font-mono text-white">Bosh sahifaga</p>
            </Link>
        </div>
    );
}

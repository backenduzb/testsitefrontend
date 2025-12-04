"use client"

import React, { useState, useEffect, useRef, useEffectEvent } from "react";
import axios from "axios";
import ProfileJPD from "@/public/img/user.png";
import Image from "next/image";
import { ROOT_URL } from "@/app/root_api";
import { turborepoTraceAccess } from "next/dist/build/turborepo-access-trace";
import useAuth from "@/auth/Authentications";
export default function Header() {
    const [isOpen, setisOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setisOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
        <div className="ml-[2%] w-[95%] mt-5 rounded-md relative shadow-[0_1px_5px] shadow-gray-300 h-15 flex items-center justify-between pe-8">
            <h1 className="text-gray-500 text-2xl font-bold ml-8">Testlar</h1>
            <div className="relative flex items-center justify-center" ref={dropdownRef}>
                <Image
                    src={ProfileJPD}
                    height={40}
                    width={40}
                    alt="user"
                    onClick={() => setisOpen(!isOpen)}
                    className="hover:cursor-pointer"
                />
                {isOpen && (
                    <div className="z-100 absolute w-70 h-40 top-[140%] right-[-80%] shadow-[0_1px_8px] rounded shadow-gray-300 bg-white flex justify-center items-center flex-col">
                        <div className="w-[90%] gap-2 flex items-center rounded h-16 hover:bg-indigo-300/50 transition-all duration-300 group">
                            <Image
                                src={ProfileJPD}
                                height={40}
                                width={40}
                                alt="user"
                                onClick={() => setisOpen(!isOpen)}
                                className="hover:cursor-pointer ml-2"
                            />
                            <div className="h-full w-full flex flex-col items-start justify-center hover:cursor-pointer">
                                <h2 className="text-gray-700 font-stretch-110 font-medium group-hover:text-indigo-400 transition-all duration-300">
                                    {isAuthenticated?(user?.full_name):('Ghost')}
                                </h2>
                                {isAuthenticated?(<p className="text-gray-400 text-[13px]">O'quvchi</p>):(<p className="text-gray-400 text-[13px]">Ghost</p>)}
                            </div>
                        </div>
                        <hr className="text-gray-300 text-2xl w-full mt-4" />
                        <div 
                        onClick={() => logout()}
                        className="w-[90%] mt-2 h-10 flex items-center justify-start group rounded transition-all duration-300 hover:bg-indigo-300/50 hover:cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-gray-500 group-hover:text-indigo-500 transition-all duration-300 ml-2" viewBox="0 0 16 16">
                                <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
                                <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
                            </svg>
                            <p className="group-hover:text-indigo-500 text-gray-600 ml-2 transition-all duration-300">
                                Chiqish
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    )
}
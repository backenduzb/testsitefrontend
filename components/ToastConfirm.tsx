import React from "react";
import { ToastContentProps } from "react-toastify";

export default function ConfirmToast({ closeToast, toastProps, onConfirm }: any) {
    return (
        <div className="flex gap-3 items-center justify-around w-full">
            <p className="text-gray-500 font-[14px] w-full text-left">
                {toastProps?.message || "Xabar..."}
            </p>

            <button
                onClick={() => {
                    onConfirm();     

                    if (closeToast) {
                        closeToast();
                    }
                }}
                className="w-14 text-indigo-700 border-indigo-500 hover:border-red-500 hover:bg-red-300/50 bg-indigo-300/50 hover:shadow-xl border-3 hover:text-red-500 hover:shadow-red-500 hover:cursor-pointer  rounded-md transition-all"
            >
                HA
            </button>
        </div>
    );
}

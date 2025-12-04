"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return <ToastContainer position="top-left" style={{ zIndex: 999999 }} toastClassName="z-[999999]" />;
}

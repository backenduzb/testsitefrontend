"use client"

import { ToastContentProps } from "react-toastify";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ROOT_URL } from "../../root_api";
import axios from "axios";
import { showConfirmToast } from "@/components/ShowToas";
import SecureCodeModal from "@/components/SecureCodeModal"; 

interface Test {
  id: number;
  question: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  correct_answer: string;
  test_score: string;
}

interface TestCase {
  id: number;
  name: string;
  tests_count: number;
  tests: Test[];
}

interface ApiResponse {
  data: Test[];
  count: number;
}

export default function CheckTesting() {
  const [testsData, setTestsData] = useState<Test[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [testCaseData, setTestCaseData] = useState<TestCase | null>(null);
  const [secureCode, setSecureCode] = useState<string>("");
  const [showSecureModal, setShowSecureModal] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const params = useParams();
  const test_id = params.id;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem(`secure_code_${test_id}`);
      if (savedCode) {
        setSecureCode(savedCode);
        setShowSecureModal(false);
        fetchTests(savedCode);
      }
    }
  }, [test_id]);

  const currentTest = testsData[currentTestIndex];
  const selectedAnswer = selectedAnswers[currentTest?.id];

  const handleSecureCodeSubmit = (code: string) => {
    if (code.trim() !== "") {
      setSecureCode(code);
      localStorage.setItem(`secure_code_${test_id}`, code);
      setShowSecureModal(false);
      fetchTests(code);
    }
  };

  const fetchTests = async (code: string) => {
    if (!test_id || !code) return;
    
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${ROOT_URL}/tests/all/`, 
        { 
          test_id, 
          secure_code: code 
        }, 
        { withCredentials: true }
      );
      
      if (res.data.data && res.data.data.length > 0) {
        setTestsData(res.data.data);
        setCurrentTestIndex(0);
      } else {
        localStorage.removeItem(`secure_code_${test_id}`);
        setShowSecureModal(true);
        alert("Noto'g'ri secure_code yoki test topilmadi");
      }
    } catch (err) {
      console.log(err);
      localStorage.removeItem(`secure_code_${test_id}`);
      setShowSecureModal(true);
      alert("Xatolik yuz berdi. Iltimos, secure_code ni qayta kiriting.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    if (currentTest) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentTest.id]: option
      }));
    }
  };

  const handleNext = () => {
    if (currentTestIndex < testsData.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentTestIndex > 0) {
      setCurrentTestIndex(prev => prev - 1);
    }
  };

  const handleTestClick = (index: number) => {
    setCurrentTestIndex(index);
  };

  const handleFinish = async () => {
    if (!test_id || !secureCode) {
      alert("Secure_code topilmadi. Iltimos qayta kiriting.");
      setShowSecureModal(true);
      return;
    }
    
    const answers = Object.entries(selectedAnswers).map(([testId, answer]) => ({
      test_id: parseInt(testId),
      answer: answer
    }));

    try {
      const response = await axios.post(
        `${ROOT_URL}/tests/check/`, 
        {
          testcase_id: test_id,
          secure_code: secureCode,
          answers: answers
        },
        { withCredentials: true }
      );
      
      console.log("Test results:", response.data);
      // Test tugagandan so'ng localStoragedan o'chirish
      localStorage.removeItem(`secure_code_${test_id}`);
      router.push(`/status/${test_id}`);
    } catch (err: any) {
      console.error("Error submitting test:", err);
      if (err.response?.status === 403) {
        alert("Noto'g'ri secure_code. Iltimos qayta kiriting.");
        localStorage.removeItem(`secure_code_${test_id}`);
        setShowSecureModal(true);
      } else {
        alert("Error submitting test. Please try again.");
      }
    }
  };

  const resetSecureCode = () => {
    localStorage.removeItem(`secure_code_${test_id}`);
    setSecureCode("");
    setShowSecureModal(true);
  };

  const testNumbers = testsData.length > 0 
    ? Array.from({ length: testsData.length }, (_, i) => i + 1)
    : [];

  if (showSecureModal) {
    return <SecureCodeModal onSubmit={handleSecureCodeSubmit} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="w-full select-none flex items-center justify-center flex-col -mt-20 h-screen ">
 
      

      <div className="h-[60%] w-[90%] shadow-[0_1px_5px] shadow-gray-300 gap-5 p-10">
        <div className="h-[50%] w-full mt-2">
          <p>Savol {currentTestIndex + 1} / {testsData.length}</p>
          <h2 className="text-gray-600 text-[18px] mt-4">
            {currentTest?.question || "Savol yuklanmoqda..."}
          </h2>
        </div>
        <div className="h-[40%] w-full flex items-left justify-center flex-col gap-5 mt-6">
          <div className="flex items-center justify-start gap-2">
            <input
              type="radio"
              id="optionA"
              name="option"
              checked={selectedAnswer === 'A'}
              onChange={() => handleSelect('A')}
              className="w-5 h-5 border-4 border-gray-400 rounded-full appearance-none 
                 checked:border-indigo-600 checked:border-7 cursor-pointer transition-colors"
            />
            <label htmlFor="optionA" className="text-md font-bold text-gray-600 cursor-pointer">
              {currentTest?.answer_a || "A) Variant"}
            </label>
          </div>
          <div className="flex items-center justify-start gap-2">
            <input
              type="radio"
              id="optionB"
              name="option"
              checked={selectedAnswer === 'B'}
              onChange={() => handleSelect('B')}
              className="w-5 h-5 border-4 border-gray-400 rounded-full appearance-none 
                 checked:border-indigo-600 checked:border-7 cursor-pointer transition-colors"
            />
            <label htmlFor="optionB" className="text-md font-bold text-gray-600 cursor-pointer">
              {currentTest?.answer_b || "B) Variant"}
            </label>
          </div>
          <div className="flex items-center justify-start gap-2">
            <input
              type="radio"
              id="optionC"
              name="option"
              checked={selectedAnswer === 'C'}
              onChange={() => handleSelect('C')}
              className="w-5 h-5 border-4 border-gray-400 rounded-full appearance-none 
                 checked:border-indigo-600 checked:border-7 cursor-pointer transition-colors"
            />
            <label htmlFor="optionC" className="text-md font-bold text-gray-600 cursor-pointer">
              {currentTest?.answer_c || "C) Variant"}
            </label>
          </div>
          <div className="flex items-center justify-start gap-2">
            <input
              type="radio"
              id="optionD"
              name="option"
              checked={selectedAnswer === 'D'}
              onChange={() => handleSelect('D')}
              className="w-5 h-5 border-4 border-gray-400 rounded-full appearance-none 
                 checked:border-indigo-600 checked:border-7 cursor-pointer transition-colors"
            />
            <label htmlFor="optionD" className="text-md font-bold text-gray-600 cursor-pointer">
              {currentTest?.answer_d || "D) Variant"}
            </label>
          </div>
        </div>
      </div>

      <div className="h-30 shadow-[0_1px_5px] shadow-gray-300 w-[90%] mt-0.5 p-3 flex items-center justify-center flex-col gap-1">
        <div className="w-full h-auto flex items-center justify-center gap-1 mt-2 flex-wrap">
          {testNumbers.map((number, index) => (
            <div 
              key={number}
              onClick={() => handleTestClick(index)}
              className={`w-12 h-8 rounded-3xl border-4 flex items-center justify-center font-bold font-mono 
                hover:cursor-pointer transition-all duration-300 ${
                  index === currentTestIndex 
                    ? 'border-indigo-600 bg-indigo-100 text-indigo-700' 
                    : selectedAnswers[testsData[index]?.id] 
                      ? 'border-gray-600 bg-gray-500 text-gray-800'
                      : 'border-gray-400 bg-gray-300 text-gray-600 hover:bg-gray-400/70'
                }`}
            >
              {number}
            </div>
          ))}
        </div>
        <div className="w-full h-15 flex justify-between items-center mt-4">
          <div className="w-60 h-full flex items-center justify-left gap-3">
            <button
              onClick={handlePrev}
              disabled={currentTestIndex === 0}
              className={`w-20 h-10 p-3 flex items-center justify-center rounded-md transition-all duration-300 ${
                currentTestIndex === 0 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:cursor-pointer'
              }`}>
              Orqaga
            </button>
            <button
              onClick={handleNext}
              disabled={currentTestIndex === testsData.length - 1}
              className={`w-20 h-10 p-3 flex items-center justify-center rounded-md transition-all duration-300 ${
                currentTestIndex === testsData.length - 1 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:cursor-pointer'
              }`}>
              Oldinga
            </button>
          </div>
          <div>
            <button
              onClick={
                ()=>showConfirmToast("Tesni tugatmoqchimisiz?", handleFinish)
              }
              className="w-20 h-10 p-3 bg-red-600 text-white flex items-center justify-center rounded-md hover:bg-red-700
              hover:cursor-pointer transition-all duration-300">
              Tugatish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
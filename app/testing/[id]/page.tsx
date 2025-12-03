"use client"

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  over_time: string;
}

export default function CheckTesting() {
  const [testsData, setTestsData] = useState<Test[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [secureCode, setSecureCode] = useState<string>("");
  const [showSecureModal, setShowSecureModal] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const router = useRouter();
  const params = useParams();
  
  // Ref'lar bilan current state'larni saqlash
  const secureCodeRef = useRef<string>("");
  const selectedAnswersRef = useRef<{ [key: number]: string }>({});
  const testIdRef = useRef<string | string[]>("");
  
  const test_id = params.id;

  useEffect(() => {
    secureCodeRef.current = secureCode;
  }, [secureCode]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    testIdRef.current = test_id || "";
  }, [test_id]);

  const calculateTimeLeft = useCallback(() => {
    const endingDateTime = localStorage.getItem(`over_time_${test_id}`);
    if (!endingDateTime) return "00:00:00";

    const now = new Date();
    const endDate = new Date(endingDateTime);
    const diffMs = endDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return "00:00:00";
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [test_id]);

  // Asosiy timer effect
  useEffect(() => {
    if (!test_id || showSecureModal) return;

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === "00:00:00") {
        clearInterval(interval);
        handleAutoFinish(); 
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, test_id, showSecureModal]);

  const handleAutoFinish = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const currentSecureCode = secureCodeRef.current;
    const currentTestId = testIdRef.current;
    const currentSelectedAnswers = selectedAnswersRef.current;
    
    if (!currentTestId || !currentSecureCode) {
      alert("Test ma'lumotlari topilmadi. Iltimos qayta urinib ko'ring.");
      setIsSubmitting(false);
      return;
    }

    const answers = Object.entries(currentSelectedAnswers).map(([testId, answer]) => ({
      test_id: parseInt(testId),
      answer: answer
    }));

    try {
      const response = await axios.post(
        `${ROOT_URL}/tests/check/`,
        {
          testcase_id: currentTestId,
          secure_code: currentSecureCode,
          answers: answers
        },
        { withCredentials: true }
      );

      console.log("Test results (auto-finish):", response.data);
      
      // Tozalash
      localStorage.removeItem(`secure_code_${currentTestId}`);
      localStorage.removeItem(`over_time_${currentTestId}`);
      localStorage.removeItem(`left_time_${currentTestId}`);
      
      // Natijalar sahifasiga o'tish
      router.push(`/status/${currentTestId}`);
    } catch (err: any) {
      console.error("Error auto-submitting test:", err);
      if (err.response?.status === 403) {
        alert("Vaqt tugadi, lekin javoblarni yuborishda xatolik. Iltimos administrator bilan bog'laning.");
        localStorage.removeItem(`secure_code_${currentTestId}`);
        localStorage.removeItem(`over_time_${currentTestId}`);
        setShowSecureModal(true);
      } else {
        alert("Vaqt tugadi. Javoblarni yuborishda xatolik yuz berdi.");
      }
      setIsSubmitting(false);
    }
  }, [isSubmitting, router]);

  const isDanger = useCallback(() => {
    if (!timeLeft || timeLeft === "00:00:00") return false;
    const [h, m, s] = timeLeft.split(":").map(Number);
    const totalSec = h * 3600 + m * 60 + s;
    return totalSec <= 600; 
  }, [timeLeft]);

  const isVeryDanger = useCallback(() => {
    if (!timeLeft || timeLeft === "00:00:00") return false;
    const [h, m, s] = timeLeft.split(":").map(Number);
    const totalSec = h * 3600 + m * 60 + s;
    return totalSec <= 60;
  }, [timeLeft]);

  // Javoblarni localStorage'ga saqlash (qayta yuklanganida saqlash uchun)
  useEffect(() => {
    if (Object.keys(selectedAnswers).length > 0 && test_id) {
      localStorage.setItem(`answers_${test_id}`, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, test_id]);

  // Oldingi javoblarni yuklash
  useEffect(() => {
    if (typeof window !== 'undefined' && test_id) {
      const savedCode = localStorage.getItem(`secure_code_${test_id}`);
      const savedAnswers = localStorage.getItem(`answers_${test_id}`);
      
      if (savedCode) {
        setSecureCode(savedCode);
        setShowSecureModal(false);
        
        if (savedAnswers) {
          try {
            setSelectedAnswers(JSON.parse(savedAnswers));
          } catch (e) {
            console.error("Failed to parse saved answers:", e);
          }
        }
        
        fetchTests(savedCode);
      }
    }
  }, [test_id]);

  const handleSecureCodeSubmit = (code: string) => {
    if (code.trim() !== "") {
      localStorage.setItem(`secure_code_${test_id}`, code);
      setSecureCode(code);
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

        const storageKey = `over_time_${test_id}`;
        if (!localStorage.getItem(storageKey)) {
          const now = new Date();
          const overTime = res.data.over_time;
          const [h, m, s] = overTime.split(":").map(Number);

          now.setHours(now.getHours() + h);
          now.setMinutes(now.getMinutes() + m);
          now.setSeconds(now.getSeconds() + s);

          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          const hours = String(now.getHours()).padStart(2, "0");
          const minutes = String(now.getMinutes()).padStart(2, "0");
          const seconds = String(now.getSeconds()).padStart(2, "0");

          const finalDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          localStorage.setItem(storageKey, finalDateTime);
        }
      } else {
        setShowSecureModal(true);
        alert("Noto'g'ri secure_code yoki test topilmadi");
        localStorage.removeItem(`secure_code_${test_id}`);
        localStorage.removeItem(`over_time_${test_id}`);
        localStorage.removeItem(`answers_${test_id}`);
      }
    } catch (err) {
      console.error(err);
      setShowSecureModal(true);
      alert("Xatolik yuz berdi. Iltimos, secure_code ni qayta kiriting.");
      localStorage.removeItem(`secure_code_${test_id}`);
      localStorage.removeItem(`over_time_${test_id}`);
      localStorage.removeItem(`answers_${test_id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    if (currentTest) {
      const newSelectedAnswers = {
        ...selectedAnswers,
        [currentTest.id]: option
      };
      setSelectedAnswers(newSelectedAnswers);
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
    if (isSubmitting) return;
    
    if (!test_id || !secureCode) {
      alert("Secure_code topilmadi. Iltimos qayta kiriting.");
      setShowSecureModal(true);
      return;
    }

    setIsSubmitting(true);
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
      
      // Tozalash
      localStorage.removeItem(`secure_code_${test_id}`);
      localStorage.removeItem(`over_time_${test_id}`);
      localStorage.removeItem(`answers_${test_id}`);
      
      router.push(`/status/${test_id}`);
    } catch (err: any) {
      console.error("Error submitting test:", err);
      setIsSubmitting(false);
      
      if (err.response?.status === 403) {
        alert("Noto'g'ri secure_code. Iltimos qayta kiriting.");
        localStorage.removeItem(`secure_code_${test_id}`);
        localStorage.removeItem(`over_time_${test_id}`);
        localStorage.removeItem(`answers_${test_id}`);
        setShowSecureModal(true);
      } else {
        alert("Error submitting test. Please try again.");
      }
    }
  };

  const currentTest = testsData[currentTestIndex];
  const selectedAnswer = selectedAnswers[currentTest?.id];
  const danger = isDanger();
  const veryDanger = isVeryDanger();

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
    <div className="w-full select-none flex items-center justify-center flex-col -mt-20 h-screen">
      <div className="h-[60%] w-[90%] relative shadow-[0_1px_5px] shadow-gray-300 gap-5 p-10">
        <div
          className={`absolute right-0 top-0 mt-2 mr-2 pl-5 pr-5 flex items-center justify-center border-2
            ${veryDanger
              ? "border-red-600 ring-2 ring-red-400 animate-pulse bg-red-50/30"
              : danger
                ? "border-red-600 bg-red-50"
                : "border-green-500 bg-transparent"
            }
          `}
        >
          <p
            className={`text-[40px] font-bold
              ${veryDanger ? "text-red-600" : danger ? "text-red-600" : "text-green-600"}
            `}
          >
            {timeLeft}
          </p>
        </div>

        <div className="h-[50%] w-full mt-2">
          <p>Savol {currentTestIndex + 1} / {testsData.length}</p>
          <h2 className="text-gray-600 text-[18px] mt-4">
            {currentTest?.question || "Savol yuklanmoqda..."}
          </h2>
        </div>

        <div className="h-[40%] w-full flex items-left justify-center flex-col gap-5 mt-6">
          {['A', 'B', 'C', 'D'].map((option) => (
            <div key={option} className="flex items-center justify-start gap-2">
              <input
                type="radio"
                id={`option${option}`}
                name="option"
                checked={selectedAnswer === option}
                onChange={() => handleSelect(option)}
                className="w-5 h-5 border-4 border-gray-400 rounded-full appearance-none 
                  checked:border-indigo-600 checked:border-7 cursor-pointer transition-colors"
              />
              <label htmlFor={`option${option}`} className="text-md font-bold text-gray-600 cursor-pointer">
                {currentTest?.[`answer_${option.toLowerCase()}` as keyof Test] || `${option}) Variant`}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-30 shadow-[0_1px_5px] shadow-gray-300 w-[90%] mt-0.5 p-3 flex items-center justify-center flex-col gap-1">
        <div className="w-full h-auto flex items-center justify-center gap-1 mt-2 flex-wrap">
          {testsData.map((_, index) => (
            <div
              key={index}
              onClick={() => handleTestClick(index)}
              className={`w-12 h-8 rounded-3xl border-4 flex items-center justify-center font-bold font-mono 
                hover:cursor-pointer transition-all duration-300 ${index === currentTestIndex
                  ? 'border-indigo-600 bg-indigo-100 text-indigo-700'
                  : selectedAnswers[testsData[index]?.id]
                    ? 'border-gray-600 bg-gray-500 text-gray-800'
                    : 'border-gray-400 bg-gray-300 text-gray-600 hover:bg-gray-400/70'
                }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        
        <div className="w-full h-15 flex justify-between items-center mt-4">
          <div className="w-60 h-full flex items-center justify-left gap-3">
            <button
              onClick={handlePrev}
              disabled={currentTestIndex === 0}
              className={`w-20 h-10 p-3 flex items-center justify-center rounded-md transition-all duration-300 ${currentTestIndex === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:cursor-pointer'
                }`}>
              Orqaga
            </button>
            <button
              onClick={handleNext}
              disabled={currentTestIndex === testsData.length - 1}
              className={`w-20 h-10 p-3 flex items-center justify-center rounded-md transition-all duration-300 ${currentTestIndex === testsData.length - 1
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:cursor-pointer'
                }`}>
              Oldinga
            </button>
          </div>
          
          <div>
            <button
              onClick={() => showConfirmToast("Testni tugatmoqchimisiz?", handleFinish)}
              disabled={isSubmitting}
              className={`w-20 h-10 p-3 flex items-center justify-center rounded-md transition-all duration-300 ${isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer'
                }`}>
              {isSubmitting ? "Yuborilmoqda..." : "Tugatish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
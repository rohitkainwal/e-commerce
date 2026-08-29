import { useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import AuthCard from "../components/AuthCard.jsx";
import Loader from "../components/Loader.jsx";

export default function EmailVerify() {
  //! param name has to match the route --> /verify-email/:emailToken
  const { emailToken } = useParams();

  const [status, setStatus] = useState("loading"); // loading | ok | fail
  const [message, setMessage] = useState("");

  //? react strict mode runs effects twice in dev, this stops the double api call
  const alreadyRan = useRef(false);

  useEffect(() => {
    if (alreadyRan.current) return;
    alreadyRan.current = true;

    async function verify() {
      try {
        const res = await axiosInstance.get(
          `/api/user/verify-email/${emailToken}`
        );
        setMessage(res.data.message);
        setStatus("ok");
      } catch (err) {
        setMessage(err.response?.data?.message || "Invalid or expired link");
        setStatus("fail");
      }
    }

    verify();
  }, [emailToken]);

  if (status === "loading") return <Loader text="Verifying your email..." />;

  const ok = status === "ok";

  return (
    <AuthCard title={ok ? "Email Verified" : "Verification Failed"}>
      <div className="text-center">
        <span
          className={`h-14 w-14 rounded-full grid place-items-center mx-auto mb-4 ${
            ok
              ? "bg-primary-25 text-primary-600"
              : "bg-red-50 text-brandred"
          }`}
        >
          {ok ? <FiCheckCircle size={26} /> : <FiXCircle size={26} />}
        </span>

        <p className="text-ink-600 mb-5">{message}</p>

        <Link
          to="/login"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-500 inline-block"
        >
          Go to Login
        </Link>
      </div>
    </AuthCard>
  );
}

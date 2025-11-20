import React from "react";
import Navbar from "./../components/Navbar";
import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    contactNumber:"",
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

//   const handleSubmit = async(e) => {
//     e.preventDefault();
//     let newUser = { ...formData };

//  if (newUser.email.trim() === "" && newUser.username.trim() === "" && newUser.password.trim() === "" && newUser.contactNumber.trim() === "") {
//       toast("Enter Credentials !", {icon: "☠️"});
//       return;
//     }


//     let allusers = JSON.parse(localStorage.getItem("users")) || [];

//     let existingUser = allusers.find((ele)=> ele.email === newUser.email);

//     if(existingUser){
//       toast.error("user already exist");
//         return;
      
//     }

//     allusers.push(newUser);
//     localStorage.setItem("users", JSON.stringify(allusers));
//     setFormData({ username: "", email: "", password: "" , contactNumber: ""});


//   };



const handleSubmit = async (e) => {
  e.preventDefault();

  let newUser = { ...formData };

  // Validation
  if (
    !newUser.username.trim() ||
    !newUser.email.trim() ||
    !newUser.password.trim() ||
    !newUser.contactNumber.trim()
  ) {
    toast.error("All fields are required!");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:9000/api/user/register",
      newUser,
      { withCredentials: true }      // If backend sets cookies
    );

    toast.success("Signup successful!");

    console.log("Backend response:", res.data);

    // Reset form
    setFormData({
      username: "",
      email: "",
      password: "",
      contactNumber: "",
    });

  } catch (error) {
    toast.error(error.response?.data?.message || "Registration failed!");
    console.log("Error:", error);
  }
};
  return (
    <div>
      {" "}
      <Navbar />
      <section className="flex items-center justify-center h-[80vh]">
        <form
          onSubmit={handleSubmit}
          className="shadow-lg border border-gray-200 flex flex-col p-8 rounded-lg gap-5"
        >
          <h1 className="text-center text-3xl font-semibold mb-5">Sign up</h1>
          <input
            type="text"
            className="border border-gray-500 rounded p-3 w-2xs mb-3"
            id="username"
            name="username"
            placeholder=" Enter Username"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="email"
            className="border border-gray-500 rounded p-3 w-2xs mb-3"
            id="email"
            name="email"
            placeholder=" Enter email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            className="border border-gray-500 rounded p-3 w-2xs mb-3"
            id="password"
            name="password"
            placeholder=" Enter password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="contactNumber"
            className="border border-gray-500 rounded p-3 w-2xs mb-3"
            id="contactNumber"
            name="contactNumber"
            placeholder=" Enter Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
          />
          <p className="text-center font-semibold">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 underline">
              Login
            </Link>
          </p>
          <button className="cursor-pointer py-2 rounded bg-blue-600 text-white hover:bg-blue-800">
            SignUp
          </button>
        </form>
      </section>
    </div>
  );
};

export default SignupPage;

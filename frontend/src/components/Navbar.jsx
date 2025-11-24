import React from "react";
import { Link , useLocation, useNavigate } from "react-router-dom";

import { FaPowerOff } from "react-icons/fa";
import axios from "axios"
import toast from "react-hot-toast";


const Navbar = () => {

  let pathname  = useLocation();
  let navigate = useNavigate()


   let token = sessionStorage.getItem("accesstoken");
   console.log(token)
  

  const handleLogout = async () =>{
    if(confirm("are you sure to logout")){
      try {
        const res = await axios.post(
      "http://localhost:9000/api/user/logout",
      {},
      { withCredentials: true }      // If backend sets cookies
    );
    sessionStorage.removeItem("accesstoken");
     toast.success("user logout successfully");
        navigate("/login");
      


      } catch (error) {
        console.log(error);
        toast.error("logout Failed")
      }
    }
  };



  return (
    <header className="w-full h-20 px-6 shadow-lg bg-white flex items-center justify-between">
      
      {/* Logo */}
      <div className="text-2xl font-bold text-black-600">
        <Link to="/">ElectroFit</Link>
      </div>

      {/* Navigation Links */}
        {pathname === "/login" || pathname === "/signup" ? null : (
          <>
      <nav className="hidden md:flex gap-8 text-lg font-semibold">
        <Link className="hover:text-blue-600 duration-200" to="/">Home</Link>
        <Link className="hover:text-blue-600 duration-200" to="/about">About</Link>
        <Link className="hover:text-blue-600 duration-200" to="/contact">Contacts</Link>
      </nav>
      </>
   )};


      {/* Auth Buttons */}
      <div className="flex gap-4">

      {token ? (<> <Link to="/create-emp">
              <button className="px-4 font-semibold">Create Employee</button>
            </Link>

            <Link to="/all-emp">
              <button className="px-4 font-semibold">All Employees</button>
            </Link>

            <button 
            onClick={handleLogout}
            className="text-white bg-red-400 p-1.5 rounded-full hover:bg-red-600">
              <FaPowerOff/>
            </button></>): (<><Link to="/login">
          <button className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 duration-200">
            Login
          </button>
        </Link>

        <Link to="/signup">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 duration-200">
            SignUp
          </button>
        </Link></>) }

       

        
      </div>
    </header>
  );
};

export default Navbar;

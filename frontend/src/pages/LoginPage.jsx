import { useState } from "react";
import Navbar from "../components/Navbar";
import { Link , useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate()

  const handleChange = (e) => {
    let { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newUser = { ...formData };

    if (newUser.email.trim() === ""  && newUser.password.trim() === "") {
      toast("Enter Credentials !", {icon: "☠️"});
      return;
    }
    try {
       const res = await axios.post(
      "http://localhost:9000/api/user/login",
      newUser,
      { withCredentials: true }      // If backend sets cookies
    );
    // toast message
      toast.success("Welcome...Login successful!")
      // Your backend will set a cookie (token)
    // You can store user info if backend returns it

    // store Date.now() in session storage for conditional rendering
      sessionStorage.setItem("accesstoken",Date.now())
         // navigate home 
      navigate("/")

        setFormData({ email: "", password: "" });
    } catch (error) {
      toast.error(error.response?.data?.message ||"User does not exists")
    }
  
  };
  return (
     <div>
      <Navbar />
      <section className="flex items-center justify-center h-[80vh]">
        <form
          onSubmit={handleSubmit}
          className="shadow-lg border border-gray-200 flex flex-col p-8 rounded-lg gap-5"
        >
          <h1 className="text-center text-3xl font-semibold mb-5">Login</h1>
          <input
            type="email"
            name="email"
            className="border border-gray-500 rounded p-3 w-2xs"
            id="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            className="border border-gray-500 rounded p-3 w-2xs"
            id="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />
          <p className="text-center font-semibold">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-700 underline">
              Signup
            </Link>
          </p>
          <button className="cursor-pointer py-2 rounded bg-blue-600 text-white hover:bg-blue-800">
            Login
          </button>
        </form>
      </section>
    </div>
  )
}

export default LoginPage
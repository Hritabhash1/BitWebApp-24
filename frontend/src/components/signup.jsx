import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { GridLoader } from "react-spinners";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullname, setfullname] = useState("");
  const [rollnumber, setrollnumber] = useState("");
  const [idcard, setidcard] = useState("");
  const [spin, setSpin] = useState(false);
  const [isRollNumberValid, setIsRollNumberValid] = useState(true);
  const [otp, setOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateRollNumber = (rollNumber) => {
    const rollNumberPattern = /^BTECH\/10\d{3}\/\d{2}$/;
    return rollNumberPattern.test(rollNumber);
  };
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@bitmesra\.ac\.in$/;
    return emailPattern.test(email);
  };
  
  const handleEmailVerification = async () => {
    try {
      setSpin(true);
      if (!validateEmail(email)) {
        toast.error("Please use a valid college mail address.");
        setSpin(false);
        return;
      }
      await axios.post("/api/v1/users/verifyMail", { email });  
      toast.success("OTP sent to your email.");
      setIsEmailVerified(true);
    } catch (error) {
      toast.error("Failed to send OTP.");
    } finally {
      setSpin(false);
    }
  };
  

  const handleSignup = async () => {
    if (!validateRollNumber(rollnumber)) {
      setIsRollNumberValid(false);
      toast.error("Invalid roll number format. It should be BTECH/10XXX/YY");
      return;
    }
    setSpin(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);
      formData.append("fullName", fullname);
      formData.append("rollNumber", rollnumber);
      formData.append("idCard", idcard);
      formData.append("usrOTP", otp);

      const response = await axios.post(
        "/api/v1/users/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      console.log(response.data);
      toast.success("Signup successful! Login using same credentials.");
      setTimeout(() => {
        navigate("/log");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        const htmlDoc = new DOMParser().parseFromString(
          error.response.data,
          "text/html"
        );
        const errorElement = htmlDoc.querySelector("body");
        if (errorElement) {
          const errorMessage = errorElement.textContent.trim();
          const errormsg = errorMessage.split("at")[0].trim();
          console.log(errormsg);
          toast.error(errormsg);
        } else {
          console.log("Error: An unknown error occurred");
          toast.error("An unknown error occurred");
        }
      } else {
        console.log("Error:", error.message);
        toast.error("Error occurred during signup");
      }
    } finally {
      setSpin(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch min-h-screen h-screen">
  <ToastContainer />
  <div className="relative w-full md:w-1/2 hidden md:block h-full">
    <img
      src="/static/images/bitphoto.JPG"
      className="w-full h-full object-cover"
      alt="bit-mesra"
    />
  </div>
  <div className="w-full md:w-1/2 bg-white flex flex-col p-6 md:p-20 justify-between overflow-auto">
        {/* <h3 className="text-xl text-black font-semibold mb-9">BITACADEMIA</h3> */}

        <div className="w-full flex flex-col max-w-[500px]">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Student-Signup</h3>
            <p className="text-base mb-2">Enter Your Signup details.</p>
          </div>
          <div className="w-full flex flex-col">
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              required
              title="Please enter a valid email address"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
            {isEmailVerified ? (
              <>
                <label className="block text-sm mb-2">OTP</label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setOtp(e.target.value)}
                />
                <label className="block text-sm mb-2">Username</label>
                <input
                  type="Text"
                  placeholder="Enter Your username"
                  value={username}
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="relative">
                  <label>Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Your Password"
                    className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label className="block text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter Your Full-Name"
                    className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                    value={fullname}
                    onChange={(e) => setfullname(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm mb-2">Roll Number</label>
                    <input
                      type="text"
                      placeholder="Enter Your Roll-Number (e.g., BTECH/10XXX/YY)"
                      className={`w-full text-black py-2 my-2 bg-transparent border-b ${
                        isRollNumberValid ? 'border-black' : 'border-red-500'
                      } outline-none focus:outline-none`}
                      value={rollnumber}
                      onChange={(e) => {
                        setrollnumber(e.target.value);
                        setIsRollNumberValid(true);
                      }}
                    />
                    {!isRollNumberValid && (
                      <p className="text-red-500 text-sm mt-1">
                        Invalid roll number format.
                      </p>
                    )}
                  </div>
                  <label className="block text-sm mb-2">Upload IdCard</label>
                  <input
                    type="file"
                    placeholder="Upload Your Id Card"
                    accept=".png,.jpg,.jpeg"
                    className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                    onChange={(e) => setidcard(e.target.files[0])}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <button
                  className="mt-5 py-3 text-white bg-black hover:bg-gray-900 rounded-md"
                  onClick={handleSignup}
                  disabled={spin}
                >
                  {spin ? (
                    <GridLoader
                      color="white"
                      loading={spin}
                      size={10}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </>
            ) : (
              <button
                className="mt-5 py-3 text-white bg-black hover:bg-gray-900 rounded-md"
                onClick={handleEmailVerification}
                disabled={spin}
              >
                {spin ? (
                  <GridLoader
                    color="white"
                    loading={spin}
                    size={10}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                ) : (
                  "Verify Email"
                )}
              </button>
            )}
          </div>
          <Link
            to="/log"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition duration-300"
          >
            <span className="text-sm">Already have an account?</span>
            <span className="text-sm font-medium text-gray-900">
              Login here
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

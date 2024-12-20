import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Userform() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [user, setUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [availableSections, setAvailableSections] = useState([]); // New state for available sections

  useEffect(() => {
    axios.get("/api/v1/users/get-user")
      .then(response => {
        console.log(response);
        const userData = response.data.data;
        setFullName(userData.fullName);
        setEmail(userData.email);
        setBranch(userData.branch);
        setSection(userData.section);
        setMobileNumber(userData.mobileNumber);
        setSemester(userData.semester);
        setCgpa(userData.cgpa);
        setUser(userData);
        setAvailableSectionsBasedOnBranch(userData.branch); // Set sections based on branch
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const setAvailableSectionsBasedOnBranch = (branch) => {
    
    if (branch === "artificial intelligence and machine learning") {
      setAvailableSections(["A"]);
    } else {
        setAvailableSections(["A", "B", "C"]);
    }
  };

  const handleUpdate = () => {
    console.log("Updating user details...");

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("branch", branch);
    formData.append("section", section);
    formData.append("mobileNumber", mobileNumber);
    formData.append("semester", semester);
    formData.append("cgpa", cgpa);
    if (profilePicture) {
      formData.append("image", profilePicture);
    }

    axios.patch(`/api/v1/users/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log(response);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message
        });
      })
      .catch(error => {
        console.log(error);
      });
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setFullName(user.fullName);
    setEmail(user.email);
    setBranch(user.branch);
    setSection(user.section);
    setMobileNumber(user.mobileNumber);
    setSemester(user.semester);
    setCgpa(user.cgpa);
    setProfilePicture(null);
    setIsEditMode(false);
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full flex flex-col p-10 justify-between">
        <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Your Profile</h3>
            <p className="text-base mb-2">Enter Your details.</p>
          </div>
          <form onSubmit={e => e.preventDefault()}>
            <div className="w-full flex flex-col">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter Your Full Name"
                value={fullName}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditMode}
              />
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditMode}
              />
              <label>Branch</label>
              <select
                value={branch}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => {
                  setBranch(e.target.value);
                  setAvailableSectionsBasedOnBranch(e.target.value); // Update available sections based on branch
                }}
                disabled={!isEditMode}
              >
                <option value="">Select Branch</option>
                <option value="computer science and engineering">Computer Science and Engineering</option>
                <option value="artificial intelligence and machine learning">Artificial Intelligence and Machine Learning</option>
                <option value="electronics and communication engineering">Electronics and Communication Engineering</option>
                <option value="mechanical engineering">Mechanical Engineering</option>
                <option value="chemical engineering">Chemical Engineering</option>
                <option value="civil engineering">Civil Engineering</option>
                <option value="production and industrial engineering">Production and Industrial Engineering</option>
              </select>
              <label>Section</label>
              <select
                value={section}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setSection(e.target.value)}
                disabled={!isEditMode}
              >
                <option value="">Select Section</option>
                {availableSections.map((sec, index) => (
                  <option key={index} value={sec}>{sec}</option>
                ))}
              </select>
              <label>Mobile Number</label>
              <input
                type="text"
                placeholder="Enter Your Mobile Number"
                value={mobileNumber}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setMobileNumber(e.target.value)}
                disabled={!isEditMode}
              />
              <label>Semester</label>
              <select
                value={semester}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setSemester(e.target.value)}
                disabled={!isEditMode}
              >
                <option value="">Select Semester</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
                <option value="VI">VI</option>
                <option value="VII">VII</option>
                <option value="VIII">VIII</option>
              </select>
              <label>CGPA</label>
              <input
                type="text"
                placeholder="Enter Your CGPA"
                value={cgpa}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setCgpa(e.target.value)}
                disabled={!isEditMode}
              />
              <label>Upload Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                disabled={!isEditMode}
              />
            </div>
            <div className="h-8"></div>
            <div className="w-full flex items-center justify-between">
              {isEditMode ? (
                <>
                  <button
                    className="bg-black text-white rounded-md p-2 text-center flex items-center justify-center my-2 hover:bg-black/90"
                    onClick={handleUpdate}
                  >
                    Save
                  </button>
                  <button
                    className="bg-red-500 text-white rounded-md p-2 text-center flex items-center justify-center my-2 hover:bg-red-600"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="bg-blue-500 text-white rounded-md p-2 text-center flex items-center justify-center my-2 hover:bg-blue-600"
                  onClick={() => setIsEditMode(true)}
                >
                  Edit
                </button>
              )}
            </div>
          </form>
          <div className="w-full items-center justify-center flex">
            <p className="text-sm font-normal text-black">
              <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
                <Link to="/">Back to Dashboard</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
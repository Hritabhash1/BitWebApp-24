import React, { Fragment, useState, useEffect } from 'react';
import { Popover, Transition, Menu } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdMenu } from 'react-icons/io';
import classNames from 'classnames';
import axios from 'axios';
import {
  HiHome,
  HiUser,
  HiAcademicCap,
  HiBadgeCheck,
  HiDocumentReport,
  HiOutlineBriefcase,
  HiPresentationChartLine,
  HiBriefcase,
  HiOutlineLogout,
  HiArchive,
} from "react-icons/hi";
import useLinks from './admin/user-links';
const linkClasses = 'flex items-center gap-6 font-light p-2.5 hover:bg-neutral-700 hover:no-underline active:bg-neutral rounded-sm text-base';

export default function Header() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [currentTime, setCurrentTime] = useState(null);
  const [user, setUser] = useState();
  const loggedIn = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get('/api/v1/admin/get-admin')
      .then(response => {
        setUser(response.data.data);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = new Date();
      const clock = newTime.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        weekday: 'long',
        year: 'numeric',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(clock);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const adminLinks = [
      { 
        text: "Dashboard", 
        icon: <HiHome />, 
        to: "/admin-db" 
      },
      { 
        text: "Student Details", 
        icon: <HiUser />, 
        to: "/admin-db/student-table" 
      },
      { 
        text: "Verify Users", 
        icon: <HiUser />, 
        to: "/admin-db/verify-users" 
      },
      {
        text: "Alumni Profiles",
        icon: <HiUser />,
        to: "/admin-db/show-all-alumni",
      },
      {
        text: "Academic Records",
        icon: <HiAcademicCap />,
        to: "/admin-db/admin-academic-form",
      },
      {
        text: "PE Courses",
        icon: <HiAcademicCap />,
        to: "/admin-db/PE-admin-table",
      },
      {
        text: "Awards & Achievements",
        icon: <HiBadgeCheck />,
        to: "/admin-db/award-table",
      },
      { 
        text: "Examinations", 
        icon: <HiDocumentReport />, 
        to: "/admin-db/exam-table" 
      },
      {
        text: "Higher Education",
        icon: <HiAcademicCap />,
        to: "/admin-db/higher-education-table",
      },
      {
        text: "Placement Records",
        icon: <HiOutlineBriefcase />,
        to: "/admin-db/placement-table",
      },
      {
        text: "Projects",
        icon: <HiPresentationChartLine />,
        to: "/admin-db/project-form-table",
      },
      {
        text: "Approve Internships",
        icon: <HiBriefcase />,
        to: "/admin-db/internship-form-table",
      },
      {
        text: "Internship Records",
        icon: <HiBriefcase />,
        to: "/admin-db/internship-table",
      },
      {
        text: "Room Allocations",
        icon: <HiBriefcase />,
        to: "/admin-db/admin-room-request",
      },
      {
        text: "Companies List",
        icon: <HiArchive />,
        to: "/admin-db/companies-table",
      },
      {
        text: "Assign Company",
        icon: <HiBriefcase />,
        to: "/admin-db/assign-company",
      },
      {
        text: "Add Project Faculty",
        icon: <HiUser />,
        to: "/admin-db/add-prof",
      },
      {
        text: "Student Reviews",
        icon: <HiArchive />,
        to: "/admin-db/review",
      },
      {
        text: "Prof. Projects",
        icon: <HiPresentationChartLine />,
        to: "/admin-db/admin-projects-dashboard",
      },
      {
        text: "Academic Analysis",
        icon: <HiPresentationChartLine />,
        to: "/admin-db/academicanalysis",
      },
    ];
  const links = adminLinks;

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    // try {
    //   const response = await axios.post('/api/v1/users/logout');
    //   localStorage.removeItem('user');
    //   navigate('/');
    // } catch (error) {
    //   console.error(error);
      try {
        const resp = await axios.post('/api/v1/admin/logout');
        localStorage.removeItem('user');
        navigate('/');
      } catch (err) {
        console.error(err);
    } finally {
      navigate('/');
    }
  };

  return (
    <div className='sticky top-0 z-40 bg-white h-16 px-4 flex w-full py-2 items-center border-b border-black'>
      <div className='flex'>
        <Popover className='navbar'>
          {({ open }) => (
            <>
              <Popover.Button
                onClick={() => setIsNavbarOpen(!isNavbarOpen)}
                className='p-1.5 inline-flex items-center text-gray-700 hover:text-capacity-100 focus:outline-none active:bg-gray-200'
              >
                <IoMdMenu fontSize={32} className='text-3xl visible md:hidden hover:opacity-70 cursor-pointer text-black m-2' />
              </Popover.Button>
              <Transition
                show={isNavbarOpen}
                as={Fragment}
                enter='transition duration-200 ease-out'
                enterFrom='opacity-0 translate-y-1'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-150'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-1'
              >
               <Popover.Panel
  className='absolute left-0 z-10 mt-2.5 w-full bg-black max-h-[70vh] overflow-y-auto'
>
  <div className='whitespace-pre flex-1 py-[1rem] text-[0.9rem] text-red-500 flex flex-col gap-0.5'>
    {links.map((link, index) => (
      <Link
        to={link.to}
        key={index}
        className={classNames('cursor-pointer border-t border-neutral-700', linkClasses)}
        onClick={closeNavbar}
      >
        <span className='text-xl'>{link.icon}</span>
        {link.text}
      </Link>
    ))}
    <div
      onClick={() => { handleLogout(); closeNavbar(); }}
      className={classNames('text-red-500 mt-[2rem] cursor-pointer border-t border-neutral-700', linkClasses)}
    >
      <span className='text-xl'>
        <HiOutlineLogout />
      </span>
      Logout
    </div>
    <div
      className={classNames('text-red-500 cursor-pointer border-t border-neutral-700', linkClasses)}
      onClick={closeNavbar}
    >
      <span className='text-xl'>
        <HiOutlineLogout />
      </span>
      Collapse
    </div>
  </div>
</Popover.Panel>

              </Transition>
            </>
          )}
        </Popover>
        <div className='flex h-full m-auto rounded-sm'>
          Welcome, {user?.fullName?.toUpperCase() || loggedIn?.username?.toUpperCase()}
        </div>
      </div>
      <div className='ml-auto flex items-center gap-2 mr-2'>
        <div className='text-gray-600 mr-4'>{currentTime}</div>
        <Menu as='div' className='relative'>
          <div className='inline-flex'>
            <Menu.Button className='ml-2 inline-flex rounded-full bg-grey-200 focus:outline-none focus:ring-2 focus:ring-neutral-400'>
              <span className='sr-only'>Open user menu</span>
              <div
                className={`h-10 w-10 ${user?.isVerified ? 'border-green-500' : 'border-red-500'} border-2 rounded-full bg-black bg-cover bg-no-repeat bg-center`}
                style={{ backgroundImage: `url(${(user) ? user?.image : "/static/images/profile.png"})` }}
              ></div>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='origin-top-right z-10 absolute right-0 mt-2 w-48 rounded-sm shadow-md p-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => { handleLogout(); closeNavbar(); }}
                    className={classNames(
                      active && 'bg-gray-100',
                      'text-gray-700 focus:bg-gray-200 cursor-pointer rounded-sm px-4 w-full py-2'
                    )}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../features/auth/userSlice';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  // Close sidebar when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-40`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800">Admin Panel</h2>
          <nav className="mt-6">
            <a
              href="/admin/dashboard/reports_charts"
              className="block py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded"
            >
              Dashboard
            </a>
            <a
              href="/admin/dashboard/users"
              className="block py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded"
            >
              Users
            </a>
            <a
              href="/admin/dashboard/announcement"
              className="block py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded"
            >
              Announcements
            </a>
            <a
              href="/admin/dashboard/reports"
              className="block py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded"
            >
              Flagged Posts
            </a>
            <button
              onClick={handleLogout}
              className="block py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded w-full text-left"
            >
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b-4 border-indigo-600">
          <div className="flex items-center">
            {/* Sidebar Toggle Button */}
            <button
              className="text-gray-600 md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
           
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-hidden overflow-y-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

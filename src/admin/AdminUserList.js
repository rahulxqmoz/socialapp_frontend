import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../config';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/admin/users/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [token]);

  const handleBlockUser = async (userId) => {
    try {
      await axios.patch(`${BASE_URL}/api/users/admin/users/${userId}/block/`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  useEffect(() => {
    let filtered = users;

    if (filter === 'new') {
      filtered = users.filter(user => new Date(user.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Last 7 days
    } else if (filter === 'blocked') {
      filtered = users.filter(user => user.is_suspended);
    } else if (filter === 'active') {
      filtered = users.filter(user => !user.is_suspended);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [filter, searchTerm, users]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">User Management</h1>
        <input
          type="text"
          placeholder="Search by username"
          className="border border-gray-300 rounded-md p-2 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Dropdown filter */}
      <div className="relative mb-4 md:relative z-20">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none"
        >
          Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)} ▼
        </button>
        {isDropdownOpen && (
          <div className="absolute left-0 bg-white border rounded-md shadow-lg mt-2 w-full md:w-48 z-10">
            {['all', 'new', 'active', 'blocked'].map((filterType) => (
              <button
                key={filterType}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-200 ${
                  filter === filterType ? 'bg-gray-100 font-semibold' : ''
                }`}
                onClick={() => {
                  setFilter(filterType);
                  setIsDropdownOpen(false);
                }}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)} Users
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left">Username</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">First name</th>
              <th className="py-3 px-4 text-left">Mobile</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date Joined</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="py-3 px-4">{user.username}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.first_name}</td>
                <td className="py-3 px-4">{user.mobile}</td>
                <td className="py-3 px-4">
                  {user.is_suspended ? 'Suspended' : 'Active'}
                </td>
                <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleBlockUser(user.id)}
                    className={`py-2 px-4 rounded-md text-white ${
                      user.is_suspended ? 'bg-red-600' : 'bg-green-600'
                    }`}
                  >
                    {user.is_suspended ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserList;

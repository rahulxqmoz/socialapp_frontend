import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const token = useSelector((state) => state.auth.token); 
  const navigate = useNavigate();
  useEffect(() => {
    if (query.length > 0) {
      searchUsers(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchUsers = async (searchQuery) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/interactions/search-users/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search_query: searchQuery,
          },
        }
      );
      setResults(response.data);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error('Error fetching search results', error);
      setResults([]);
    }
  };
  
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleResultClick = () => {
    setIsDropdownOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.length > 0) {
      searchUsers(query); // Call searchUsers function on submit
    }
  };
  const handleUserClick = (user) => {
    // Navigate to the user profile view and pass the user ID
    setIsDropdownOpen(false);
    navigate(`/profileview/${user.id}`);
    
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearchSubmit} className="flex items-center">
        {/* Search Input */}
        <input
          type="text"
          className="border border-gray-300 rounded-full py-2 px-4 focus:outline-none w-64 md:w-96"
          placeholder="Search users..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
        />
        {/* Search Icon Button */}
      
      </form>

      {/* Dropdown for Results */}
      {isDropdownOpen && results.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 rounded-md mt-2 w-full max-h-64 overflow-y-auto z-50 shadow-lg">
          {results.map((result) => (
            <li key={result.id} className="hover:bg-gray-100 cursor-pointer">
              <Link
                to={`/profileview/${result.id}`} 
                className="flex items-center py-2 px-4"
                onClick={() => setIsDropdownOpen(false)} 
              >
                <img
                  src={result.profile_pic || 'https://via.placeholder.com/30'}
                  alt={result.username}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
                <span>{result.username}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;

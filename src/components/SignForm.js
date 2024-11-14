import React, { useState } from 'react';
import logo from '../assets/logo.png';
import axios from 'axios';
import { BASE_URL,access_key } from '../config';
import { showSuccessToast } from './CustomToast';
import { showErrorToast } from './ErroToast';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin  } from '@react-oauth/google';
import { loginSuccess as authLoginSuccess } from '../features/auth/authSlice';
import { setUser } from '../features/auth/userSlice';
import ClipLoader from 'react-spinners/ClipLoader'; 



const SignupForm = () => {
 
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    email: '',
    dob: '',
    mobile: '',
    password: '',
    confirmPassword: '', // Only for frontend validation
  });
  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const errors = {};
      // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username cannot be empty or just spaces';
    }

    // First Name validation 
    if (!formData.first_name.trim()) {
      errors.first_name = 'First Name cannot be empty or just spaces';
    }
  
      // Email validation
     
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
      var email_address = FormData.email
    
      fetch('https://apilayer.net/api/check?access_key=' + access_key + '&email=' + email_address)
      .then(response => response.json())
      .then(data => {
          if(data.format_valid && data.smtp_check) {
              console.log('email is valid.');
          } else {
            errors.email = 'Enter valid email. Email does not exist!';
          }
          });
  
      // Date of Birth validation (Age must be 18 or above)
      const userDob = new Date(formData.dob);
      const age = new Date().getFullYear() - userDob.getFullYear();
      if (!formData.dob) {
        errors.dob = 'Date of birth is required';
      } else if (age < 18) {
        errors.dob = 'You must be at least 18 years old';
      }
  
      // Mobile number validation (Indian format)
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!formData.mobile) {
        errors.mobile = 'Mobile number is required';
      } else if (!mobileRegex.test(formData.mobile)) {
        errors.mobile = 'Invalid mobile number';
      }
  
      // Password validation (strong password)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (!passwordRegex.test(formData.password)) {
        errors.password =
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character';
      }
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setFormErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false); 
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false); 
    } else {
      // Submit the form
      setFormErrors({});
      console.log('Form Submitted:', formData);
      
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== 'confirmPassword') {
        data.append(key, formData[key]);
      }
    });
    console.log('FormData contents:');
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }

    try {
 
      const response = await axios.post(`${BASE_URL}/api/users/register/`, data);
      const {  uidb64, token } = response.data;
      console.log("register");
      console.log(response.data);
      if (uidb64 && token) {
        navigate(`/verification-waiting/${uidb64}/${token}/`);
      } else {
        showErrorToast('Verification data missing. Please try again.');
      }
    } catch (error) {
      console.error('Error signing up:', error.response?.data || error.message);
      showErrorToast('Error signing up. Please try again.');
    }
    setLoading(false);
    }
   
   
  };
  const handleGoogleSuccess = async (response) => {
    try {
      const { credential } = response;
      // Send the token to your backend
      const result = await axios.post(`${BASE_URL}/api/users/google-signup/`, { token: credential });
      // Handle the response
      const { user, token } = result.data;
      const {  id, username, first_name, profile_pic, is_admin,is_active  } = user;
      console.log(user)
      console.log(result.data)
      if (token) {
        dispatch(authLoginSuccess({ token }));
        dispatch(setUser({  id, username, first_name, profile_pic, is_admin,is_active}));
  
        showSuccessToast('Login successful!');
        setTimeout(() => {
          navigate('/');
        }, 2000); 
        // navigate(`/verification-waiting/${uidb64}/${token}/`);
        console.log("Google Register successfull");
      } else {
        showErrorToast('Verification data missing. Please try again.');
      }
    } catch (error) {
      console.error('Google signup error:', error.response?.data || error.message);
      showErrorToast('Error signing up with Google. Please try again.');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login error:', error);
    showErrorToast('Error with Google sign-in. Please try again.');
  };

  return (
  //   <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 shadow-md rounded-xl mx-auto">
      
  //   <div className="flex flex-col items-center mb-6">
  //     <div className="flex items-center mb-4">
  //       <img src={logo} alt="Logo" className="w-20 h-22 mr-0" />
  //       <h1 className="text-3xl font-semibold text-gray-800">Connectify</h1>
        
  //     </div>
  //   </div>
  //   <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Create an Account</h2>

  //   <div className="space-y-4">
  //     <input
  //       type="text"
  //       name="username"
  //       placeholder="Username"
  //       value={formData.username}
  //       onChange={handleChange}
  //       className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
  //       required
  //     />
  //     {formErrors.username && <p className="text-red-500 text-sm">{formErrors.username}</p>}
      
  //     <input
  //       type="text"
  //       name="first_name"
  //       placeholder="First Name"
  //       value={formData.first_name}
  //       onChange={handleChange}
  //       className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
  //       required
  //     />
  //     {formErrors.first_name && <p className="text-red-500 text-sm">{formErrors.first_name}</p>}



  //     <input
  //       type="email"
  //       name="email"
  //       placeholder="Email"
  //       value={formData.email}
  //       onChange={handleChange}
  //       className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
  //       required
  //     />
  //     {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}

  //     <input
  //       type="date"
  //       name="dob"
  //       placeholder="Date of Birth"
  //       value={formData.dob}
  //       onChange={handleChange}
  //       className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
  //       required
  //     />
  //     {formErrors.dob && <p className="text-red-500 text-sm">{formErrors.dob}</p>}

  //     <input
  //       type="tel"
  //       name="mobile"
  //       placeholder="Mobile Number"
  //       value={formData.mobile}
  //       onChange={handleChange}
  //       className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
  //       required
  //     />
  //     {formErrors.mobile && <p className="text-red-500 text-sm">{formErrors.mobile}</p>}

  //     <input
  //       type="password"
  //       name="password"
  //       placeholder="Password"
  //       value={formData.password}
  //       onChange={handleChange}
  //       className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
  //       required
  //     />
  //     {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}

  //     <input
  //       type="password"
  //       name="confirmPassword"
  //       placeholder="Confirm Password"
  //       value={formData.confirmPassword}
  //       onChange={handleChange}
  //       className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
  //       required
  //     />
  //     {formErrors.confirmPassword && <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>}
  //   </div>

  //   <button
  //     type="submit"
  //     className="w-full mt-6 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors"
  //   >
  //      {loading ? (
  //           <ClipLoader
  //             color="#fff" size={20}
  //           />
  //         ) : (
  //           'Sign Up'
  //         )}
  //   </button>

  //   <div className="flex justify-center mt-4">
  //       <GoogleLogin
  //         onSuccess={handleGoogleSuccess}
  //         onFailure={handleGoogleFailure}
  //       />
  //     </div>
 
  //   <div className="flex justify-between text-sm mt-2 text-gray-600">
  //     <a href="#" className="hover:text-blue-500">Already have an account?</a>
  //     <a href="/login" className="hover:text-blue-500">Sign in</a>
  //   </div>
  // </form>
  <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white px-4 sm:px-8 py-8 shadow-md rounded-xl mx-auto">
   <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
    <div className="flex items-center">
      <img src={logo} alt="Logo" className="w-20 h-20 mr-4 object-cover" />
      <h1 className="text-3xl font-semibold text-gray-800">Connectify</h1>
    </div>
    <h2 className="text-2xl font-semibold text-gray-700">Create an Account</h2>
  </div>


  <div className="grid grid-cols-2 gap-6">
    {/* Column 1 */}
    <div className="space-y-4">
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
        required
      />
      {formErrors.username && <p className="text-red-500 text-sm">{formErrors.username}</p>}

      <input
        type="text"
        name="first_name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={handleChange}
        className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
        required
      />
      {formErrors.first_name && <p className="text-red-500 text-sm">{formErrors.first_name}</p>}

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
        required
      />
      {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}

      <input
        type="date"
        name="dob"
        placeholder="Date of Birth"
        value={formData.dob}
        onChange={handleChange}
        className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
        required
      />
      {formErrors.dob && <p className="text-red-500 text-sm">{formErrors.dob}</p>}
    </div>

    {/* Column 2 */}
    <div className="space-y-4">
      

      <input
        type="tel"
        name="mobile"
        placeholder="Mobile Number"
        value={formData.mobile}
        onChange={handleChange}
        className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
        required
      />
      {formErrors.mobile && <p className="text-red-500 text-sm">{formErrors.mobile}</p>}

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
        required
      />
      {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
      
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
        required
      />
      {formErrors.confirmPassword && <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>}
    </div>
  </div>

  <button
    type="submit"
    className="w-full mt-6 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors"
  >
    {loading ? (
      <ClipLoader color="#fff" size={20} />
    ) : (
      'Sign Up'
    )}
  </button>

  <div className="flex justify-center mt-4">
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onFailure={handleGoogleFailure}
    />
  </div>

  <div className="flex justify-between text-sm mt-4 text-gray-600">
    <a href="#" className="hover:text-blue-500">Already have an account?</a>
    <a href="/login" className="hover:text-blue-500">Sign in</a>
  </div>
</form>

  );
};

export default SignupForm;

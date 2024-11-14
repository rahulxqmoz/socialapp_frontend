import React from 'react';



const VerificationWaitingPage = () => {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded-xl max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
        <p>
          We have sent a verification link to your email. Please check your email and click on the verification link to activate your account.
        </p>
        <p className="mt-4">If you did not receive the email, please check your spam folder or try again.</p>
        
        <a href="/login" className="text-sm underline hover:text-blue-300 mt-9">Go to Sign in</a>

      </div>
     
    </div>
    
  );
};

export default VerificationWaitingPage;

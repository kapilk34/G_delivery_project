import React from "react";
import { ShieldX } from "lucide-react";

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-green-100">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldX className="text-red-500 w-10 h-10" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Access Restricted
        </h1>

        <p className="text-gray-500 mb-6">
          Sorry, you don’t have permission to view this page.  
          Please login or return to the homepage to continue shopping fresh groceries.
        </p>
      </div>
    </div>
  );
}

export default Unauthorized;
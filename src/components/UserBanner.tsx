'use client'

import React, { useState, useEffect } from "react";

function UserBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-80% overflow-hidden py-16 px-6 md:px-16 rounded-3xl shadow-2xl ml-10 mr-10 mt-10">
      <img src="https://gvu57hqxi3.ufs.sh/f/FOd38ztMu1UwL1xocXfy8AqV9TDIL3MsQnbwrJgB15lmcjU0" alt="" />
    </div>
  );
}

export default UserBanner;
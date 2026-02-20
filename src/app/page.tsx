import React from 'react'
import connectDb from '@/lib/db'
import User from '@/models/userModel'
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import EditRole from '@/components/EditRole';
import NavBar from '@/components/Nav';

const page = async () => {
  await connectDb();
  const session = await auth();
  const user = await User.findById(session?.user?.id)
  if(!user){
      redirect("/login")
  }
  
  const inComplete = !user.mobile || !user.role || (!user.mobile && user.role == "user")
  if(inComplete){
      return <EditRole/>
  }
  return (
    <>
      <NavBar user={user}/>
    </>
  )
}

export default page;

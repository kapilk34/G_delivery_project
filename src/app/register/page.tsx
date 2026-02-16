'use client'
import React, { useState } from 'react'
import Welcome from '@/components/Welcome';
import RegisterForm from '@/components/RegisterForm';

const Register = () => {
    const [step, setStep] = useState(1);
  return (
    <div>
        {step == 1 ? <Welcome nextStep={setStep} /> : <RegisterForm previousStep={setStep}/>}
        
    </div>
  )
}

export default Register
"use client"

import { useState } from "react"
import { HeroSection } from "@/components/hero-section"
import { RegistrationForm } from "@/components/registration-form"
import { CarWashInfo } from "@/components/car-wash-info"
import { LanguageSwitcher } from "@/components/language-switcher"

const sampleCarWash = {
  name: "Sparkle Auto Wash",
  phoneNumber: "+2002020202",
  address: "123 Main Street, California",
  latitude: 34.0522,
  longitude: -118.2437,
  washTypes: [
    { name: "Basic Wash", price: 20, description: "Exterior wash only" },
    { name: "Premium Wash", price: 40, description: "Full wash + interior clean" },
  ],
  availability: [
    {
      day: "Monday",
      slots: [
        { startTime: "09:00", endTime: "10:00", slotNumber: 2 },
        { startTime: "10:00", endTime: "11:00", slotNumber: 2 },
        { startTime: "11:00", endTime: "12:00", slotNumber: 2 },
      ],
    },
    {
      day: "Wednesday",
      slots: [{ startTime: "13:00", endTime: "14:00", slotNumber: 2 }],
    },
  ],
}

export default function Home() {
  const [submittedData, setSubmittedData] = useState(null)

  const handleFormSubmit = (data) => {
    setSubmittedData(data)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <HeroSection />
      <RegistrationForm onSubmit={handleFormSubmit} />
    </main>
  )
}

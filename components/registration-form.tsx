"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RegistrationForm({ onSubmit }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    location: { latitude: "", longitude: "" },
    washTypes: [{ name: "", price: "", description: "" }],
    availability: [
      {
        day: "Monday",
        slots: [{ startTime: "09:00", endTime: "10:00", slotNumber: 2 }],
      },
    ],
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Phone number validation - only 10 digits
    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "")
      if (digitsOnly.length <= 10) {
        setFormData((prev) => ({
          ...prev,
          [name]: digitsOnly,
        }))
      }
      return
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleWashTypeChange = (index, field, value) => {
    setFormData((prev) => {
      const newWashTypes = [...prev.washTypes]
      newWashTypes[index] = {
        ...newWashTypes[index],
        [field]: field === "price" ? Number.parseFloat(value) || "" : value,
      }
      return { ...prev, washTypes: newWashTypes }
    })
  }

  const addWashType = () => {
    setFormData((prev) => ({
      ...prev,
      washTypes: [...prev.washTypes, { name: "", price: "", description: "" }],
    }))
  }

  const removeWashType = (index) => {
    setFormData((prev) => ({
      ...prev,
      washTypes: prev.washTypes.filter((_, i) => i !== index),
    }))
  }

  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    setFormData((prev) => {
      const newAvailability = [...prev.availability]
      const newSlots = [...newAvailability[dayIndex].slots]
      
      // If updating time fields, check for duplicates
      if ((field === "startTime" || field === "endTime") && newSlots.length > 1) {
        const currentSlot = newSlots[slotIndex]
        const newStartTime = field === "startTime" ? value : currentSlot.startTime
        const newEndTime = field === "endTime" ? value : currentSlot.endTime
        
        // Check if this time slot already exists (except current slot)
        const isDuplicate = newSlots.some((slot, idx) => 
          idx !== slotIndex && 
          slot.startTime === newStartTime && 
          slot.endTime === newEndTime
        )
        
        if (isDuplicate) {
          alert(t("error.duplicate"))
          return prev
        }
      }
      
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        [field]: field === "slotNumber" ? Number.parseInt(value) || 0 : value,
      }
      newAvailability[dayIndex] = {
        ...newAvailability[dayIndex],
        slots: newSlots,
      }
      return { ...prev, availability: newAvailability }
    })
  }

  const addSlot = (dayIndex) => {
    setFormData((prev) => {
      const newAvailability = JSON.parse(JSON.stringify(prev.availability))
      const existingSlots = newAvailability[dayIndex].slots
      
      // Find a unique time slot
      let startTime = "12:00"
      let endTime = "13:00"
      let counter = 0
      
      while (existingSlots.some(slot => slot.startTime === startTime && slot.endTime === endTime)) {
        const startHour = (12 + counter) % 24
        const endHour = (13 + counter) % 24
        startTime = `${String(startHour).padStart(2, "0")}:00`
        endTime = `${String(endHour).padStart(2, "0")}:00`
        counter++
        
        if (counter > 23) {
          alert(t("error.noSlots"))
            return prev
        }
      }
      
      newAvailability[dayIndex].slots.push({
        startTime,
        endTime,
        slotNumber: 2,
      })
      
      return { ...prev, availability: newAvailability }
    })
  }

  const removeSlot = (dayIndex, slotIndex) => {
    setFormData((prev) => {
      const newAvailability = [...prev.availability]
      newAvailability[dayIndex].slots = newAvailability[dayIndex].slots.filter((_, i) => i !== slotIndex)
      return { ...prev, availability: newAvailability }
    })
  }

  const addDay = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        {
          day: "Monday",
          slots: [{ startTime: "09:00", endTime: "10:00", slotNumber: 2 }],
        },
      ],
    }))
  }

  const removeDay = (dayIndex) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== dayIndex),
    }))
  }

  const handleDayChange = (dayIndex, value) => {
    setFormData((prev) => {
      const newAvailability = [...prev.availability]
      newAvailability[dayIndex].day = value
      return { ...prev, availability: newAvailability }
    })
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Update location coordinates
          setFormData((prev) => ({
            ...prev,
            location: {
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            },
          }))
          
          // Fetch address using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const address = data.address?.road || data.address?.street || data.address?.village || data.display_name || ""
            
            setFormData((prev) => ({
              ...prev,
              address: address,
            }))
          } catch (error) {
            console.error("Error fetching address:", error)
          }
          
          alert(`Location retrieved: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        },
        (error) => {
          alert(`${t("error.location")}: ${error.message}`)
        }
      )
    } else {
      alert(t("error.locationNotSupported"))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate phone number has exactly 10 digits
    if (formData.phoneNumber.length !== 10) {
      alert(t("validation.phone"))
      return
    }
    
    // Validate location
    if (!formData.location.latitude || !formData.location.longitude) {
      alert(t("validation.location"))
      return
    }
    
    // Prepare the data in the required format
    const requestData = {
      name: formData.name,
      phoneNumber: `+20${formData.phoneNumber}`,
      address: formData.address,
      latitude: parseFloat(formData.location.latitude),
      longitude: parseFloat(formData.location.longitude),
      washTypes: formData.washTypes,
      availability: formData.availability,
    }
    
    console.log("Sending request data:", requestData)
    
    try {
      const response = await fetch("http://localhost:4000/v1/api/carwash/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        alert(`${t("validation.error")}: ${errorData.message}`)
        return
      }
      
      const result = await response.json()
      alert(t("success.message"))
      onSubmit(requestData)
    } catch (error) {
      alert(`${t("validation.error")}: ${error.message}`)
      console.error("Registration error:", error)
    }
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t("form.title")}</CardTitle>
            <CardDescription>{t("form.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">{t("form.basic")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t("form.name")}</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t("form.namePlaceholder")}
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">{t("form.phone")}</Label>
                    <div className="flex items-center border border-input rounded-md overflow-hidden">
                      <span className="bg-muted px-3 py-2 font-semibold text-foreground">+20</span>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="1234567890"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        maxLength="10"
                        className="border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t("form.phoneHelper")}</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">{t("form.address")}</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder={t("form.addressPlaceholder")}
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">{t("form.location")}</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder={t("form.locationHelper")}
                    value={
                      formData.location.latitude && formData.location.longitude
                        ? `${formData.location.latitude}, ${formData.location.longitude}`
                        : ""
                    }
                    readOnly
                    disabled
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleGetLocation}
                  variant="outline"
                  className="w-full"
                >
                  {t("form.getLocation")}
                </Button>
              </div>

              {/* Wash Types */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">{t("form.washTypes")}</h3>
                  <Button type="button" onClick={addWashType} variant="outline" size="sm">
                    {t("form.addType")}
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.washTypes.map((washType, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm">{t("form.typeName")}</Label>
                        <Input
                          placeholder={t("form.typeNamePlaceholder")}
                          value={washType.name}
                          onChange={(e) => handleWashTypeChange(index, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">{t("form.price")}</Label>
                        <Input
                          type="number"
                          placeholder={t("form.pricePlaceholder")}
                          value={washType.price}
                          onChange={(e) => handleWashTypeChange(index, "price", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">{t("form.fieldDescription")}</Label>
                        <Input
                          placeholder={t("form.descriptionPlaceholder")}
                          value={washType.description}
                          onChange={(e) => handleWashTypeChange(index, "description", e.target.value)}
                        />
                      </div>
                      {formData.washTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWashType(index)}
                          className="text-destructive hover:text-destructive/80 text-sm font-medium md:col-start-3 md:justify-self-end"
                        >
                          {t("form.remove")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">{t("form.availability")}</h3>
                  <Button type="button" onClick={addDay} variant="outline" size="sm">
                    {t("form.addDay")}
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.availability.map((day, dayIndex) => (
                    <div key={dayIndex} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <Label className="text-sm font-semibold">{t("form.selectDay")}</Label>
                          <select
                            value={day.day}
                            onChange={(e) => handleDayChange(dayIndex, e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {days.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                        {formData.availability.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDay(dayIndex)}
                            className="text-destructive hover:text-destructive/80 text-sm font-medium ml-4 mt-6"
                          >
                            {t("form.removeDay")}
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {day.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-muted rounded">
                            <div>
                              <Label className="text-sm">{t("form.startTime")}</Label>
                              <Input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleSlotChange(dayIndex, slotIndex, "startTime", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">{t("form.endTime")}</Label>
                              <Input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleSlotChange(dayIndex, slotIndex, "endTime", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">{t("form.slots")}</Label>
                              <Input
                                type="number"
                                min="1"
                                value={slot.slotNumber}
                                onChange={(e) => handleSlotChange(dayIndex, slotIndex, "slotNumber", e.target.value)}
                              />
                            </div>
                            {day.slots.length > 1 && (
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => removeSlot(dayIndex, slotIndex)}
                                  className="text-destructive hover:text-destructive/80 text-sm font-medium w-full py-2"
                                >
                                  {t("form.remove")}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={() => addSlot(dayIndex)}
                        variant="outline"
                        size="sm"
                        className="mt-3"
                      >
                        {t("form.addSlot")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg"
              >
                {t("form.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

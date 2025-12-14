"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

// Dynamically import Leaflet map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>,
})

export function RegistrationForm({ onSubmit }: { onSubmit?: (data: any) => void }) {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    business_name: "",
    phone_number: "",
    business_number: "",
    email: "",
    business_email: "",
    number_of_branches: "1",
    role: "",
    street: "",
    street_number: "",
    city: "",
    area: "",
    address: "",
    latitude: "",
    longitude: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const updateLocationFromMap = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }))
  }

  const handleAddressChange = (addressData: {
    street: string
    street_number: string
    city: string
    area: string
    address: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      street: addressData.street,
      street_number: addressData.street_number,
      city: addressData.city,
      area: addressData.area,
      address: addressData.address,
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required"
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required"
    if (!formData.business_name.trim()) newErrors.business_name = "Business name is required"
    if (!formData.phone_number.trim()) newErrors.phone_number = "Phone number is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.business_email.trim()) {
      newErrors.business_email = "Business email is required"
    } else if (!emailRegex.test(formData.business_email)) {
      newErrors.business_email = "Please enter a valid email address"
    }
    if (!formData.role) newErrors.role = "Role is required"
    if (!formData.street.trim()) newErrors.street = "Street is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = "Please select location on map"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const requestData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        business_name: formData.business_name,
        phone_number: formData.phone_number,
        business_number: formData.business_number || "",
        email: formData.email,
        business_email: formData.business_email,
        number_of_branches: parseInt(formData.number_of_branches),
        role: formData.role,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
        street: formData.street,
        street_number: formData.street_number,
        city: formData.city,
        area: formData.area,
        address: formData.address,
      }

      const response = await fetch("https://car-wash-delta-seven.vercel.app/v1/api/carwash-form-registration/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const result = await response.json()
      alert("Registration submitted successfully!")
      onSubmit?.(requestData)

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        business_name: "",
        phone_number: "",
        business_number: "",
        email: "",
        business_email: "",
        number_of_branches: "1",
        role: "",
        street: "",
        street_number: "",
        city: "",
        area: "",
        address: "",
        latitude: "",
        longitude: "",
      })
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("Registration error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-blue-600">{t("registration.title")}</CardTitle>
            <CardDescription>{t("registration.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{t("registration.basicInfo")}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">{t("registration.firstName")} <span className="text-red-500">*</span></Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      placeholder={t("registration.firstName")}
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className={errors.first_name ? "border-red-500" : "border-sky-400 focus:border-sky-300"}
                    />
                    {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">{t("registration.lastName")} <span className="text-red-500">*</span></Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      placeholder={t("registration.lastName")}
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className={errors.last_name ? "border-red-500" : "border-sky-400 focus:border-sky-300"}
                    />
                    {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_name" className="text-sm font-medium">{t("registration.businessName")} <span className="text-red-500">*</span></Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    placeholder={t("registration.businessName")}
                    value={formData.business_name}
                    onChange={handleInputChange}
                    required
                    className={errors.business_name ? "border-red-500" : "border-sky-400 focus:border-sky-300"}
                  />
                  {errors.business_name && <p className="text-xs text-red-500 mt-1">{errors.business_name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-sm font-medium">{t("registration.phoneNumber")} <span className="text-red-500">*</span></Label>
                    <div className="flex items-center border border-sky-400 rounded-md overflow-hidden focus-within:border-sky-300">
                      <span className="bg-muted px-3 py-2 font-semibold text-foreground">+20</span>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        placeholder="1001234567"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                    {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_number" className="text-sm font-medium">{t("registration.businessPhone")}</Label>
                    <div className="flex items-center border border-sky-400 rounded-md overflow-hidden focus-within:border-sky-300">
                      <span className="bg-muted px-3 py-2 font-semibold text-foreground">+20</span>
                      <Input
                        id="business_number"
                        name="business_number"
                        type="number"
                        placeholder="1001234567"
                        value={formData.business_number}
                        onChange={handleInputChange}
                        maxLength={10}
                        onInput={(e) => {
                          if (e.currentTarget.value.length > 10) {
                            e.currentTarget.value = e.currentTarget.value.slice(0, 10)
                          }
                        }}
                        className="border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">{t("registration.personalEmail")} <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={errors.email ? "border-red-500" : "border-sky-400 focus:border-sky-300"}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_email" className="text-sm font-medium">{t("registration.businessEmail")} <span className="text-red-500">*</span></Label>
                    <Input
                      id="business_email"
                      name="business_email"
                      type="email"
                      placeholder="business@email.com"
                      value={formData.business_email}
                      onChange={handleInputChange}
                      required
                      className={errors.business_email ? "border-red-500" : "border-sky-400 focus:border-sky-300"}
                    />
                    {errors.business_email && <p className="text-xs text-red-500 mt-1">{errors.business_email}</p>}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{t("registration.businessInfo")}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="number_of_branches" className="text-sm font-medium">{t("registration.numberOfBranches")} <span className="text-red-500">*</span></Label>
                    <Input
                      id="number_of_branches"
                      name="number_of_branches"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.number_of_branches}
                      onChange={handleInputChange}
                      required
                      className="border-sky-400 focus:border-sky-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">{t("registration.role")} <span className="text-red-500">*</span></Label>
                    <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                      <SelectTrigger className={errors.role ? "border-red-500" : "border-sky-400 focus:border-sky-300"}>
                        <SelectValue placeholder={t("registration.rolePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">{t("registration.roleOwner")}</SelectItem>
                        <SelectItem value="partner">{t("registration.rolePartner")}</SelectItem>
                        <SelectItem value="manager">{t("registration.roleManager")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                  </div>
                </div>

              </div>

              {/* Location Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{t("registration.locationInfo")}</h3>

                {/* Leaflet Map Component */}
                <MapComponent
                  latitude={parseFloat(formData.latitude) || 30.0444}
                  longitude={parseFloat(formData.longitude) || 31.2357}
                  onLocationChange={updateLocationFromMap}
                  onAddressChange={handleAddressChange}
                />

                {/* Latitude/Longitude fields removed from UI; values still managed in state and sent on submit */}

                {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}

                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium">{t("registration.street")} <span className="text-red-500">*</span></Label>
                  <Input
                    id="street"
                    name="street"
                    placeholder={t("registration.street")}
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className={errors.street ? "border-red-500" : "border-sky-400 focus:border-sky-300"}
                  />
                  {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="street_number" className="text-sm font-medium">{t("registration.streetNumber")}</Label>
                    <Input
                      id="street_number"
                      name="street_number"
                      placeholder={t("registration.streetNumber")}
                      value={formData.street_number}
                      onChange={handleInputChange}
                      className="border-sky-400 focus:border-sky-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">{t("registration.city")} <span className="text-red-500">*</span></Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder={t("registration.city")}
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className={errors.city ? "border-red-500" : "border-sky-400 focus:border-sky-300"}
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm font-medium">{t("registration.area")}</Label>
                  <Input
                    id="area"
                    name="area"
                    placeholder={t("registration.area")}
                    value={formData.area}
                    onChange={handleInputChange}
                    className="border-sky-400 focus:border-sky-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">{t("registration.address")}</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder={t("registration.address")}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="border-sky-400 focus:border-sky-300"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 md:px-20 text-sm md:text-base py-2 md:py-3 bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 hover:from-blue-600 hover:via-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg"
                >
                  {loading ? t("registration.gettingLocation") : t("registration.registerNow")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

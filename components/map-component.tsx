"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import "leaflet/dist/leaflet.css"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MapComponentProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
  onAddressChange?: (address: {
    street: string
    street_number: string
    city: string
    area: string
    address: string
  }) => void
}

interface Suggestion {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export default function MapComponent({ latitude, longitude, onLocationChange, onAddressChange }: MapComponentProps) {
  const { t, i18n } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  useEffect(() => {
    // Dynamically import leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default

      if (!mapRef.current) return

      // Initialize map
      if (!mapInstance.current) {
        // Bounding box for Cairo and Giza
        const maxBounds = L.latLngBounds(
          L.latLng(29.8, 30.5), // Southwest corner
          L.latLng(30.3, 31.5)  // Northeast corner
        )

        mapInstance.current = L.map(mapRef.current, {
          maxBounds: maxBounds,
          maxBoundsViscosity: 1.0, // Prevent panning outside bounds
        }).setView([latitude, longitude], 15)

        mapInstance.current.setMaxBounds(maxBounds)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance.current)

        // Create custom marker icon
        const markerIcon = L.icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          shadowSize: [41, 41],
          iconAnchor: [12, 41],
          shadowAnchor: [14, 41],
          popupAnchor: [1, -34],
        })

        // Create marker
        markerRef.current = L.marker([latitude, longitude], {
          draggable: true,
          icon: markerIcon,
        }).addTo(mapInstance.current)

        // Handle marker drag
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current.getLatLng()
          onLocationChange(pos.lat, pos.lng)
        })

        // Handle map click
        mapInstance.current.on("click", (e: any) => {
          markerRef.current.setLatLng(e.latlng)
          onLocationChange(e.latlng.lat, e.latlng.lng)
        })
      } else {
        // Update marker position if props change
        markerRef.current.setLatLng([latitude, longitude])
      }
    }

    if (typeof window !== "undefined") {
      initMap()
    }
  }, [])

  useEffect(() => {
    const updateMapView = async () => {
      if (!mapInstance.current || !markerRef.current) return

      const L = (await import("leaflet")).default
      markerRef.current.setLatLng([latitude, longitude])
      mapInstance.current.setView([latitude, longitude], 15)
    }

    if (typeof window !== "undefined") {
      updateMapView()
    }
  }, [latitude, longitude])

  const handleSearchInput = async (value: string) => {
    setSearchQuery(value)

    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      // Bounding box for Cairo and Giza region
      // Format: left,top,right,bottom (minLon,maxLat,maxLon,minLat)
      const viewbox = "30.5,30.3,31.5,29.8"
      const currentLanguage = i18n.language || "en"
      const languageParam = currentLanguage === "ar" ? "ar" : "en"

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&countrycodes=eg&viewbox=${viewbox}&bounded=1&accept-language=${languageParam}&format=json&limit=5`
      )
      const data = await response.json()
      console.log("Search results:", data)
      setSuggestions(data)
      setShowSuggestions(data && data.length > 0)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
    }
  }

  const parseAddress = async (lat: string, lon: string) => {
    try {
      const currentLanguage = i18n.language || "en"
      const languageParam = currentLanguage === "ar" ? "ar" : "en"

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=${languageParam}`
      )
      const data = await response.json()

      const addressData = data.address || {}
      const displayName = data.display_name || ""

      const street = addressData.road || addressData.street || ""
      const street_number = addressData.house_number || ""
      const city = addressData.city || addressData.town || addressData.village || ""

      // Try multiple fields for area: suburb, neighbourhood, district, quarter, state_district, hamlet, county
      let area = addressData.suburb ||
                 addressData.neighbourhood ||
                 addressData.district ||
                 addressData.quarter ||
                 addressData.state_district ||
                 addressData.hamlet ||
                 addressData.county || ""

      // If still no area, try to extract from display_name
      // display_name format is usually: "street, number, neighborhood, city, region, country"
      if (!area && displayName) {
        const parts = displayName.split(",").map((p: string) => p.trim())
        // Try to get the neighborhood/area which is usually 2-3 positions before the city
        if (parts.length > 3) {
          // Usually: [street, number, neighborhood, city, ...]
          area = parts[2] || ""
        }
      }

      const address = displayName

      onAddressChange?.({
        street,
        street_number,
        city,
        area,
        address,
      })

      console.log("Address data:", { street, street_number, city, area, address, addressData })

      return { street, street_number, city, area, address }
    } catch (error) {
      console.error("Error parsing address:", error)
      return { street: "", street_number: "", city: "", area: "", address: "" }
    }
  }

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    const newLat = parseFloat(suggestion.lat)
    const newLon = parseFloat(suggestion.lon)

    setSearchQuery(suggestion.display_name)
    setSuggestions([])
    setShowSuggestions(false)

    if (mapInstance.current) {
      mapInstance.current.setView([newLat, newLon], 15)
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLon])
    }

    onLocationChange(newLat, newLon)
    await parseAddress(suggestion.lat, suggestion.lon)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || suggestions.length === 0) return

    await handleSuggestionClick(suggestions[0])
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords

        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 15)
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        }

        onLocationChange(lat, lng)
        await parseAddress(lat.toString(), lng.toString())
        setSearchQuery("")
        setSuggestions([])
        setIsLoadingLocation(false)
      },
      (error) => {
        let errorMessage = "Unable to get your location"
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please enable location access in your browser settings."
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable."
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "The request to get user location timed out."
        }
        alert(errorMessage)
        setIsLoadingLocation(false)
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Label htmlFor="address-search">{t("registration.searchLocation")}</Label>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Input
              id="address-search"
              type="text"
              placeholder={t("registration.searchLocation")}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 bg-white border border-input rounded-md shadow-lg z-50 mb-1 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-primary/10 border-b border-input last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-sm">{suggestion.display_name.split(",")[0]}</div>
                    <div className="text-xs text-muted-foreground truncate">{suggestion.display_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 whitespace-nowrap"
          >
            {t("registration.searchButton")}
          </button>
        </div>
      </div>

      <div ref={mapRef} className="w-full h-96 rounded-lg border border-input" style={{ minHeight: "400px" }} />

      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={isLoadingLocation}
        className="w-fit mx-auto block px-4 md:px-12 py-1.5 md:py-2 text-sm md:text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-400 whitespace-nowrap font-medium"
      >
        <div className="flex items-center justify-center gap-2">
          <span>{isLoadingLocation ? t("registration.gettingLocation") : t("registration.useCurrentLocation")}</span>
          <span className="text-xs font-bold bg-white text-blue-500 px-2 py-0.5 rounded">
            {t("registration.recommended")}
          </span>
        </div>
      </button>
    </div>
  )
}

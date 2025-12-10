"use client"

import { MapPin, Phone, Droplet, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CarWashInfo({ carWash }) {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Car Wash</h2>
          <p className="text-lg text-muted-foreground">Explore available services and booking slots</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Card */}
          <div className="lg:col-span-1">
            <Card className="h-full border-2 border-primary/20">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white mb-4">
                  <Droplet className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">{carWash.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{carWash.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-semibold">{carWash.address}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Coordinates:</span> {carWash.latitude},{" "}
                    {carWash.longitude}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wash Types */}
          <div className="lg:col-span-1">
            <Card className="h-full border-2 border-secondary/20">
              <CardHeader>
                <CardTitle>Wash Services</CardTitle>
                <CardDescription>Available packages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {carWash.washTypes.map((washType, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg border border-secondary/20 hover:border-secondary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{washType.name}</h4>
                        <span className="text-primary font-bold text-lg">${washType.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{washType.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Availability */}
          <div className="lg:col-span-1">
            <Card className="h-full border-2 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Availability
                </CardTitle>
                <CardDescription>Booking slots this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {carWash.availability.map((day, dayIndex) => (
                    <div key={dayIndex}>
                      <p className="font-semibold text-foreground mb-2">{day.day}</p>
                      <div className="space-y-1">
                        {day.slots.map((slot, slotIndex) => (
                          <div
                            key={slotIndex}
                            className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded"
                          >
                            <span className="text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-semibold">
                              {slot.slotNumber} available
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors shadow-lg">
            Book an Appointment
          </button>
        </div>
      </div>
    </section>
  )
}

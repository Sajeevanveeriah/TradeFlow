"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1">View your schedule at a glance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>Your bookings displayed in a calendar format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Calendar interface coming soon!</p>
            <p className="mt-2">A full-featured calendar view with drag-and-drop scheduling.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

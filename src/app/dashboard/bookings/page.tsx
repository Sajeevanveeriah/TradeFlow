"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your scheduled jobs and appointments</p>
        </div>
        <Link href="/dashboard/bookings/new">
          <Button>+ New Booking</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage your scheduled bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Bookings management interface coming soon!</p>
            <p className="mt-2">Use the API endpoints to manage bookings programmatically.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

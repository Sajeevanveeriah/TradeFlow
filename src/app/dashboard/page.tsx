"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Stats {
  upcomingBookings: number;
  totalCustomers: number;
  pendingQuotes: number;
  monthlyRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    upcomingBookings: 0,
    totalCustomers: 0,
    pendingQuotes: 0,
    monthlyRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        // Fetch bookings
        const bookingsResponse = await fetch("/api/bookings?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookingsData = await bookingsResponse.json();

        // Fetch customers
        const customersResponse = await fetch("/api/customers?limit=1", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const customersData = await customersResponse.json();

        // Fetch quotes
        const quotesResponse = await fetch("/api/quotes?status=SENT&limit=1", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const quotesData = await quotesResponse.json();

        if (bookingsData.success) {
          const upcoming = bookingsData.data.bookings.filter(
            (b: { scheduledStart: string }) => new Date(b.scheduledStart) > new Date()
          );
          setRecentBookings(bookingsData.data.bookings);
          setStats((prev) => ({
            ...prev,
            upcomingBookings: upcoming.length,
          }));
        }

        if (customersData.success) {
          setStats((prev) => ({
            ...prev,
            totalCustomers: customersData.meta?.total || 0,
          }));
        }

        if (quotesData.success) {
          setStats((prev) => ({
            ...prev,
            pendingQuotes: quotesData.meta?.total || 0,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
            <p className="text-xs text-gray-500">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-gray-500">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
            <p className="text-xs text-gray-500">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <span className="text-2xl">💵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/bookings/new">
              <Button className="w-full" variant="outline">
                📝 New Booking
              </Button>
            </Link>
            <Link href="/dashboard/customers/new">
              <Button className="w-full" variant="outline">
                👤 Add Customer
              </Button>
            </Link>
            <Link href="/dashboard/quotes/new">
              <Button className="w-full" variant="outline">
                💰 Create Quote
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Your latest scheduled jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No bookings yet. Create your first booking to get started!</p>
              <Link href="/dashboard/bookings/new">
                <Button className="mt-4">Create Booking</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.slice(0, 5).map((booking: {
                id: string;
                title: string;
                scheduledStart: string;
                customer: { name: string };
                status: string;
              }) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{booking.title}</div>
                    <div className="text-sm text-gray-500">
                      {booking.customer.name} • {new Date(booking.scheduledStart).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600">{booking.status}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-1">Create and send professional quotes</p>
        </div>
        <Link href="/dashboard/quotes/new">
          <Button>+ New Quote</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
          <CardDescription>Track your quotes and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Quote management interface coming soon!</p>
            <p className="mt-2">Use the API endpoints to create and manage quotes programmatically.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

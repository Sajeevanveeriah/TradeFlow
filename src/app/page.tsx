import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">TradeFlow</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Scheduling for Australian Tradies
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Stop losing jobs to poor scheduling. TradeFlow helps you manage bookings, send reminders, and get paid faster.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Start 14-Day Free Trial</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-lg font-semibold mb-2">Smart Calendar</h3>
              <p className="text-gray-600">
                No more double bookings. See your schedule at a glance and avoid conflicts.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2">Auto Reminders</h3>
              <p className="text-gray-600">
                Send SMS and email reminders automatically. Reduce no-shows by 70%.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Get Paid Faster</h3>
              <p className="text-gray-600">
                Send quotes and accept payments online. No more chasing invoices.
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-blue-600 text-white rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Pricing</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white text-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-3xl font-bold mb-4">$29<span className="text-lg">/mo</span></div>
                <ul className="text-left space-y-2 text-sm">
                  <li>✓ Calendar booking</li>
                  <li>✓ Customer CRM</li>
                  <li>✓ SMS reminders</li>
                  <li>✓ 50 customers</li>
                </ul>
              </div>
              <div className="bg-blue-700 text-white p-6 rounded-lg border-2 border-yellow-400">
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <div className="text-3xl font-bold mb-4">$59<span className="text-lg">/mo</span></div>
                <ul className="text-left space-y-2 text-sm">
                  <li>✓ Everything in Starter</li>
                  <li>✓ Quote generation</li>
                  <li>✓ Payment collection</li>
                  <li>✓ 200 customers</li>
                </ul>
              </div>
              <div className="bg-white text-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <div className="text-3xl font-bold mb-4">$99<span className="text-lg">/mo</span></div>
                <ul className="text-left space-y-2 text-sm">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Team scheduling</li>
                  <li>✓ Xero integration</li>
                  <li>✓ Unlimited customers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 TradeFlow. Built for Australian tradies.</p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { Plane, CheckCircle, FileText, Users, Shield, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: FileText,
      title: 'Smooth Documentation Flow',
      description: 'Navigate paperwork effortlessly with centralized forms. Say goodbye to the turbulence of scattered documents.',
    },
    {
      icon: Users,
      title: 'Clear Communication Channels',
      description: 'Coordinate seamlessly between all parties. No more bumpy communication or missed handoffs.',
    },
    {
      icon: CheckCircle,
      title: 'Turbulence-Free Tracking',
      description: 'Monitor every step with crystal-clear visibility. Know your flight status at all times, no surprises.',
    },
    {
      icon: Shield,
      title: 'Safe & Secure Flight Path',
      description: 'Aviation-grade security keeps your data protected. Navigate regulations with confidence.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Plot Your Course',
      description: 'Aircraft owner initiates the ferry flight request with complete flight details.',
    },
    {
      number: '2',
      title: 'Clear for Takeoff',
      description: 'Each stakeholder submits their documentation through streamlined portals.',
    },
    {
      number: '3',
      title: 'Cruise in Comfort',
      description: 'Track real-time progress as requirements are completed without turbulence.',
    },
    {
      number: '4',
      title: 'Smooth Landing',
      description: 'All documentation approved and ready. Your ferry flight clears for departure.',
    },
  ];

  const handleGetStarted = () => {
    // Scroll to top or handle navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Plane className="w-8 h-8 text-sky-600 mr-2" />
              <span className="text-xl text-gray-900 font-semibold">WingWake</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#roles" className="text-gray-600 hover:text-gray-900 transition-colors">Roles</a>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-4 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 px-4 transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                <a href="#roles" className="text-gray-600 hover:text-gray-900 px-4 transition-colors" onClick={() => setMobileMenuOpen(false)}>Roles</a>
                <button
                  onClick={() => {
                    handleGetStarted();
                    setMobileMenuOpen(false);
                  }}
                  className="mx-4 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl text-gray-900 mb-6 font-bold">
              Navigate Ferry Flights <br />Without the Turbulence
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              WingWake streamlines every aspect of ferry flight management. Clear skies ahead with seamless documentation, 
              real-time tracking, and smooth coordination between all stakeholders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 text-lg font-medium"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-lg font-medium">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-sky-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-900 mb-4 font-bold">
              Everything You Need to Manage Ferry Flights
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed specifically for aviation professionals who need to coordinate complex ferry operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-xl mb-6">
                    <IconComponent className="w-8 h-8 text-sky-600" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3 font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-900 mb-4 font-bold">
              Simple, Streamlined Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From initial request to flight completion, manage every step with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-center">
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-sky-300 transition-colors flex-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-600 text-white rounded-full mb-4 text-xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-xl text-gray-900 mb-2 font-semibold">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute left-full top-1/2 -translate-y-1/2 px-1 pointer-events-none">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-900 mb-4 font-bold">
              Built for Every Stakeholder
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dedicated portals for each role in the ferry flight process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                role: 'Aircraft Owners',
                description: 'Initiate ferry flights, track progress, and manage all documentation from a single dashboard.',
                color: 'bg-blue-50 border-blue-200',
              },
              {
                role: 'Pilots',
                description: 'Submit flight plans, update status, and access all necessary flight documentation.',
                color: 'bg-green-50 border-green-200',
              },
              {
                role: 'A&P Mechanics',
                description: 'Provide airworthiness certifications and maintenance records efficiently.',
                color: 'bg-purple-50 border-purple-200',
              },
              {
                role: 'Insurance Companies',
                description: 'Review and approve insurance documentation with complete visibility.',
                color: 'bg-orange-50 border-orange-200',
              },
            ].map((item, index) => (
              <div key={index} className={`${item.color} border-2 rounded-lg p-6`}>
                <h3 className="text-xl text-gray-900 mb-2 font-semibold">{item.role}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sky-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl text-white mb-6 font-bold">
            Ready to Fly Without the Turbulence?
          </h2>
          <p className="text-xl text-sky-100 mb-10">
            Join aviation professionals who enjoy smooth, streamlined ferry flight operations.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-sky-600 rounded-lg hover:bg-sky-50 transition-colors text-lg font-medium inline-flex items-center gap-2"
          >
            Start Managing Flights Today
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Plane className="w-6 h-6 text-sky-400 mr-2" />
                <span className="text-white font-semibold">WingWake</span>
              </div>
              <p className="text-sm">
                Helping you navigate ferry flights without the turbulence.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2026 WingWake. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

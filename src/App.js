import React, { useState, useEffect } from 'react';
import { Calendar, Users, Package, DollarSign, TrendingUp, Plus, CheckCircle, Clock, User, Phone, Mail, MapPin, 
  ArrowUp,
  ArrowDown,
  Wallet,
  CreditCard, } from 'lucide-react';

const GymBagApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Sample data - in a real app this would come from a backend
  // Replace your existing leads state initialization (around line 114) with this:

const [clients, setClients] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      phone: '(555) 123-4567',
      email: 'sarah@email.com',
      status: 'active',
      lastSession: '2025-09-03',
      nextSession: '2025-09-07',
      notes: 'Working on strength training goals'
    },
    {
      id: 2,
      name: 'Mike Chen',
      phone: '(555) 987-6543',
      email: 'mike@email.com',
      status: 'active',
      lastSession: '2025-09-02',
      nextSession: '2025-09-06',
      notes: 'Marathon training focus'
    },
    {
      id: 3,
      name: 'Emma Davis',
      phone: '(555) 456-7890',
      email: 'emma@email.com',
      status: 'prospect',
      lastSession: null,
      nextSession: null,
      notes: 'Interested in weight loss program'
    }
  ]);

  const [sessions, setSessions] = useState([
    {
      id: 1,
      clientId: 1,
      clientName: 'Sarah Johnson',
      date: '2025-09-07',
      time: '09:00',
      duration: 60,
      location: 'Main Gym',
      status: 'planned',
      notes: ''
    },
    {
      id: 2,
      clientId: 2,
      clientName: 'Mike Chen',
      date: '2025-09-06',
      time: '14:00',
      duration: 45,
      location: 'Park Training',
      status: 'planned',
      notes: ''
    },
    {
      id: 3,
      clientId: 1,
      clientName: 'Sarah Johnson',
      date: '2025-09-03',
      time: '09:00',
      duration: 60,
      location: 'Main Gym',
      status: 'completed',
      notes: 'Great progress on deadlifts'
    }
  ]);

  const [packages, setPackages] = useState([
    {
      id: 1,
      name: '10-Pack 60min',
      price: 800,
      sessions: 10,
      duration: 60,
      expiryDays: 90,
      active: true,
      notes: 'Standard personal training package'
    },
    {
      id: 2,
      name: '5-Pack 45min',
      price: 375,
      sessions: 5,
      duration: 45,
      expiryDays: 60,
      active: true,
      notes: 'Intro package for new clients'
    }
  ]);

  const [assignments, setAssignments] = useState([
    {
      id: 1,
      clientId: 1,
      clientName: 'Sarah Johnson',
      packageId: 1,
      packageName: '10-Pack 60min',
      remainingSessions: 7,
      purchaseDate: '2025-08-15',
      expiryDate: '2025-11-13'
    },
    {
      id: 2,
      clientId: 2,
      clientName: 'Mike Chen',
      packageId: 1,
      packageName: '10-Pack 60min',
      remainingSessions: 8,
      purchaseDate: '2025-08-20',
      expiryDate: '2025-11-18'
    }
  ]);

  const [payments, setPayments] = useState([
    {
      id: 1,
      date: '2025-09-01',
      amount: 800,
      currency: 'USD',
      method: 'Cash',
      clientId: 1,
      clientName: 'Sarah Johnson',
      packageId: 1,
      notes: '10-pack payment'
    },
    {
      id: 2,
      date: '2025-08-28',
      amount: 375,
      clientId: 2,
      clientName: 'Mike Chen',
      packageId: 2,
      notes: '5-pack payment'
    }
  ]);

  const [posts, setPosts] = useState([
    {
      id: 1,
      platform: 'Instagram',
      title: 'Monday Motivation Post',
      plannedDate: '2025-09-09',
      status: 'planned',
      notes: 'Share client transformation story'
    },
    {
      id: 2,
      platform: 'TikTok',
      title: 'Quick HIIT Workout',
      plannedDate: '2025-09-05',
      status: 'posted',
      likes: 245,
      comments: 12,
      shares: 8,
      notes: 'Workout demo video'
    }
  ]);

  // Replace your existing leads state initialization (around line 114) with this:

const [leads, setLeads] = useState([
  {
    id: 1,
    name: 'Jessica Smith',
    platform: 'Instagram',
    handle: '@jess_fitness',
    status: 'new',
    nextActionDate: '2025-09-05',
    email: 'jessica.smith@email.com',
    phone: '(555) 234-5678',
    primaryInterest: 'nutrition',
    budgetRange: '75-100',
    leadSource: 'social-media-post',
    referralSource: '',
    notes: 'Interested in nutrition coaching. Very motivated, has specific weight loss goals for her wedding in 6 months.'
  },
  {
    id: 2,
    name: 'David Wilson',
    platform: 'Facebook',
    handle: 'David W.',
    status: 'contacted',
    nextActionDate: '2025-09-06',
    email: 'david.w@email.com',
    phone: '(555) 345-6789',
    primaryInterest: 'strength-training',
    budgetRange: 'package-deal',
    leadSource: 'referral',
    referralSource: 'Sarah Johnson',
    notes: 'Follow up on consultation call. Interested in 10-pack package. Former athlete looking to get back in shape.'
  },
  {
    id: 3,
    name: 'Maria Rodriguez',
    platform: 'TikTok',
    handle: '@maria_runs',
    status: 'follow-up',
    nextActionDate: '2025-09-08',
    email: 'maria.r@email.com',
    phone: '',
    primaryInterest: 'cardio-fitness',
    budgetRange: '50-75',
    leadSource: 'social-media-post',
    referralSource: '',
    notes: 'Saw our HIIT workout video. Training for first marathon. Prefers morning sessions.'
  }
]);

  // Form states
  const [showClientForm, setShowClientForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const [editingClient, setEditingClient] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);

  // Helper functions

  // Helper: safe date from YYYY-MM-DD
const toDate = (s) => new Date(s);

// Use the same testing anchor you already set in your file:
const anchor = new Date('2025-09-05'); // or new Date() in production
const curYear = anchor.getFullYear();
const curMonth = anchor.getMonth(); // 0-11

const getAllTimeRevenue = () =>
  payments.reduce((t, p) => t + (Number(p.amount) || 0), 0);

const getYearToDateRevenue = () =>
  payments.reduce((t, p) => {
    const d = toDate(p.date);
    return d.getFullYear() === curYear ? t + (Number(p.amount) || 0) : t;
  }, 0);

const getSixMonthsRevenue = () => {
  const start = new Date(curYear, curMonth - 5, 1); // start of month, 5 months ago (includes current month)
  return payments.reduce((t, p) => {
    const d = toDate(p.date);
    return d >= start && d <= anchor ? t + (Number(p.amount) || 0) : t;
  }, 0);
};

const getOneMonthRevenue = () =>
  payments.reduce((t, p) => {
    const d = toDate(p.date);
    return d.getFullYear() === curYear && d.getMonth() === curMonth
      ? t + (Number(p.amount) || 0)
      : t;
  }, 0);

const getPreviousMonthRevenue = () => {
  const prevMonth = (curMonth + 11) % 12;
  const prevYear = prevMonth === 11 ? curYear - 1 : curYear;
  return payments.reduce((t, p) => {
    const d = toDate(p.date);
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth
      ? t + (Number(p.amount) || 0)
      : t;
  }, 0);
};

const getRevenueChange = (current, previous) => {
  if (!previous && current > 0) return 100;
  if (!previous && !current) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

  const getThisWeekSessions = () => {
    const today = new Date('2025-09-05'); // Current date from context
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
    });
  };

  const getThisMonthRevenue = () => {
    const today = new Date('2025-09-05');
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return payments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getClientsNeedingFollowUp = () => {
    const today = new Date('2025-09-05');
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    return clients.filter(client => {
      if (!client.lastSession) return true;
      const lastSessionDate = new Date(client.lastSession);
      return lastSessionDate <= sevenDaysAgo;
    });
  };

  const completeSession = (sessionId) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'completed' }
        : session
    ));
    
    // Update assignment remaining sessions
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setAssignments(prev => prev.map(assignment => 
        assignment.clientId === session.clientId
          ? { ...assignment, remainingSessions: Math.max(0, assignment.remainingSessions - 1) }
          : assignment
      ));
    }
  };

  // Dashboard Component
  const Dashboard = () => {
    // Declare revenue variables using the existing helpers
    const allTimeRevenue = getAllTimeRevenue();
    const yearToDateRevenue = getYearToDateRevenue();
    const sixMonthsRevenue = getSixMonthsRevenue();
    const oneMonthRevenue = getOneMonthRevenue();
    const previousMonthRevenue = getPreviousMonthRevenue();
    const monthlyChange = getRevenueChange(oneMonthRevenue, previousMonthRevenue);
    const monthsElapsedYTD = curMonth + 1; // Jan..current inclusive
    const monthlyAvgYTD = monthsElapsedYTD ? Math.round(yearToDateRevenue / monthsElapsedYTD) : 0;

    return (
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Sessions This Week</p>
                <p className="text-2xl font-bold text-blue-900">{getThisWeekSessions().length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-green-100 font-medium">Revenue Overview</p>
                <p className="text-xl font-bold">${oneMonthRevenue.toLocaleString()}</p>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  monthlyChange >= 0 ? 'bg-green-400/30' : 'bg-red-400/30'
                }`}
              >
                {monthlyChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(monthlyChange)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div className="bg-white/10 rounded p-2">
                <span className="block text-green-100">All Time</span>
                <span className="text-sm font-bold">${allTimeRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-white/10 rounded p-2">
                <span className="block text-green-100">YTD</span>
                <span className="text-sm font-bold">${yearToDateRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-white/10 rounded p-2">
                <span className="block text-green-100">6 Mo.</span>
                <span className="text-sm font-bold">${sixMonthsRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-white/10 rounded p-2">
                <span className="block text-green-100">1 Mo.</span>
                <span className="text-sm font-bold">${oneMonthRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Need Follow-up</p>
                <p className="text-2xl font-bold text-orange-900">{getClientsNeedingFollowUp().length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Posts Planned</p>
                <p className="text-2xl font-bold text-purple-900">{posts.filter(p => p.status === 'planned').length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Today's Sessions</h2>
          <div className="space-y-3">
            {sessions
              .filter(session => session.date === '2025-09-05')
              .map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{session.clientName}</p>
                    <p className="text-sm text-gray-600">{session.time} - {session.location}</p>
                  </div>
                  {session.status === 'planned' && (
                    <button 
                      onClick={() => completeSession(session.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Complete
                    </button>
                  )}
                </div>
              ))}
            {sessions.filter(session => session.date === '2025-09-05').length === 0 && (
              <p className="text-gray-500">No sessions scheduled for today</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Clients Component
  const Clients = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button 
          onClick={() => setShowClientForm(true)}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {clients.map(client => (
          <div key={client.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' :
                    client.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                </div>
                {client.notes && (
                  <p className="text-sm text-gray-600 mt-2">{client.notes}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {client.lastSession && <span>Last: {client.lastSession}</span>}
                  {client.nextSession && <span>Next: {client.nextSession}</span>}
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditingClient(client);
                  setShowClientForm(true);
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Sessions Component  
  const Sessions = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <button 
          onClick={() => setShowSessionForm(true)}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map(session => (
          <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{session.clientName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'no-show' ? 'bg-red-100 text-red-800' :
                    session.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>{session.date} at {session.time}</span>
                  <span>{session.duration} min</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {session.location}
                  </div>
                </div>
                {session.notes && (
                  <p className="text-sm text-gray-600 mt-2">{session.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                {session.status === 'planned' && (
                  <button 
                    onClick={() => completeSession(session.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Complete
                  </button>
                )}
                <button 
                  onClick={() => {
                    setEditingSession(session);
                    setShowSessionForm(true);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Packages Component
  const Packages = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
        <button 
          onClick={() => setShowPackageForm(true)}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{pkg.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pkg.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pkg.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                  <span>Price: ${pkg.price}</span>
                  <span>Sessions: {pkg.sessions}</span>
                  <span>Duration: {pkg.duration} min</span>
                  <span>Expires: {pkg.expiryDays} days</span>
                </div>
                {pkg.notes && (
                  <p className="text-sm text-gray-600 mt-2">{pkg.notes}</p>
                )}
              </div>
              <button 
                onClick={() => {
                  setEditingPackage(pkg);
                  setShowPackageForm(true);
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Package Assignments */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Active Assignments</h2>
        <div className="space-y-3">
          {assignments.map(assignment => (
            <div key={assignment.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{assignment.clientName}</h3>
                  <p className="text-sm text-gray-600">{assignment.packageName}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    {assignment.remainingSessions} sessions remaining
                  </p>
                  <p className="text-xs text-gray-500">Expires: {assignment.expiryDate}</p>
                </div>
                <div className="text-right">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                    assignment.remainingSessions > 3 ? 'bg-green-100 text-green-800' :
                    assignment.remainingSessions > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {assignment.remainingSessions}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Payments Component
  const Payments = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <button 
          onClick={() => setShowPaymentForm(true)}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {payments.map(payment => (
          <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">${payment.amount}</h3>
                  <span className="text-sm text-gray-600">({payment.method})</span>
                </div>
                <p className="text-sm text-gray-600">{payment.clientName}</p>
                <p className="text-sm text-gray-500">{payment.date}</p>
                {payment.notes && (
                  <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Growth Component
  const Growth = () => (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Growth Workspace</h1>
      
      {/* Posts Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Social Media Posts</h2>
          <button 
            onClick={() => setShowPostForm(true)}
            className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.status === 'posted' ? 'bg-green-100 text-green-800' :
                      post.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>{post.platform}</span>
                    <span>{post.plannedDate}</span>
                  </div>
                  {post.status === 'posted' && (
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      {post.likes && <span>👍 {post.likes}</span>}
                      {post.comments && <span>💬 {post.comments}</span>}
                      {post.shares && <span>🔄 {post.shares}</span>}
                    </div>
                  )}
                  {post.notes && (
                    <p className="text-sm text-gray-600 mt-2">{post.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leads Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Leads</h2>
          <button 
            onClick={() => setShowLeadForm(true)}
            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{lead.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'follow-up' ? 'bg-orange-100 text-orange-800' :
                      lead.status === 'won' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>{lead.platform}</span>
                    <span>{lead.handle}</span>
                  </div>
                  <p className="text-sm text-gray-500">Next action: {lead.nextActionDate}</p>
                  {lead.notes && (
                    <p className="text-sm text-gray-600 mt-2">{lead.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Enhanced Client Form Component
const ClientForm = () => {
  const [formData, setFormData] = useState(editingClient || {
    // Basic Info
    name: '',
    phone: '',
    email: '',
    status: 'prospect',
    
    // Personal Details
    dateOfBirth: '',
    gender: '',
    occupation: '',
    
    // Contact & Emergency
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Health & Fitness
    fitnessGoals: '',
    fitnessLevel: '',
    medicalConditions: '',
    injuries: '',
    medications: '',
    
    // Preferences
    preferredTimes: '',
    communicationPreference: 'email',
    
    // Business
    referralSource: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form validation
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (formData.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)) {
        newErrors.phone = 'Format: (555) 123-4567';
      }
    }
    
    return newErrors;
  };

  // Phone number formatting
  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({...formData, phone: formatted});
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all steps
    let allErrors = {};
    for (let step = 1; step <= totalSteps; step++) {
      allErrors = {...allErrors, ...validateStep(step)};
    }
    
    if (Object.keys(allErrors).length === 0) {
      if (editingClient) {
        setClients(prev => prev.map(c => 
          c.id === editingClient.id ? { ...c, ...formData, lastUpdated: new Date().toISOString() } : c
        ));
      } else {
        setClients(prev => [...prev, { 
          ...formData, 
          id: Date.now(), 
          createdAt: new Date().toISOString(),
          lastSession: null,
          nextSession: null
        }]);
      }
      setShowClientForm(false);
      setEditingClient(null);
    } else {
      setErrors(allErrors);
      // Go to first step with errors
      const firstErrorStep = Object.keys(allErrors).some(key => ['name', 'email', 'phone'].includes(key)) ? 1 : 2;
      setCurrentStep(firstErrorStep);
    }
  };

  // Client Form field component
  const FormField = ({ label, error, required, children, className = "" }) => (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <span>⚠</span>
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {editingClient ? 'Edit Client' : 'Add New Client'}
          </h2>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {Array.from({length: totalSteps}, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 <= currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-8 h-0.5 ${
                    i + 1 < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? 'Basic Information' :
              currentStep === 2 ? 'Contact & Emergency' :
              currentStep === 3 ? 'Health & Fitness' :
              'Preferences & Notes'
            }
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormField label="Full Name" error={errors.name} required>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter client's full name"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Phone Number" error={errors.phone}>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                      maxLength="14"
                    />
                  </FormField>

                  <FormField label="Email Address" error={errors.email}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Date of Birth">
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>

                  <FormField label="Gender">
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Client Status" required>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="prospect">Prospect</option>
                      <option value="active">Active Client</option>
                      <option value="inactive">Inactive</option>
                      <option value="on-hold">On Hold</option>
                    </select>
                  </FormField>

                  <FormField label="Occupation">
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Job title/profession"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Emergency */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField label="Address">
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address, city, state, zip"
                  />
                </FormField>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h4>
                  
                  <FormField label="Emergency Contact Name">
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full name"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <FormField label="Emergency Contact Phone">
                      <input
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({...formData, emergencyContactPhone: formatPhoneNumber(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                        maxLength="14"
                      />
                    </FormField>

                    <FormField label="Relationship">
                      <select
                        value={formData.emergencyContactRelation}
                        onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="spouse">Spouse</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="child">Child</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                      </select>
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Health & Fitness */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <FormField label="Fitness Goals">
                  <textarea
                    value={formData.fitnessGoals}
                    onChange={(e) => setFormData({...formData, fitnessGoals: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Weight loss, muscle building, improved strength, marathon training, etc."
                  />
                </FormField>

                <FormField label="Current Fitness Level">
                  <select
                    value={formData.fitnessLevel}
                    onChange={(e) => setFormData({...formData, fitnessLevel: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select fitness level</option>
                    <option value="beginner">Beginner (Little to no exercise)</option>
                    <option value="novice">Novice (Some exercise, 1-2x/week)</option>
                    <option value="intermediate">Intermediate (Regular exercise, 3-4x/week)</option>
                    <option value="advanced">Advanced (Daily exercise, 5+ years)</option>
                    <option value="athlete">Athlete/Competitive</option>
                  </select>
                </FormField>

                <FormField label="Medical Conditions">
                  <textarea
                    value={formData.medicalConditions}
                    onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Diabetes, high blood pressure, heart conditions, etc. (leave blank if none)"
                  />
                </FormField>

                <FormField label="Injuries or Physical Limitations">
                  <textarea
                    value={formData.injuries}
                    onChange={(e) => setFormData({...formData, injuries: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Past injuries, current pain, movement restrictions, etc."
                  />
                </FormField>

                <FormField label="Current Medications">
                  <input
                    type="text"
                    value={formData.medications}
                    onChange={(e) => setFormData({...formData, medications: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List any medications that might affect training"
                  />
                </FormField>
              </div>
            )}

            {/* Step 4: Preferences & Notes */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <FormField label="Preferred Training Times">
                  <textarea
                    value={formData.preferredTimes}
                    onChange={(e) => setFormData({...formData, preferredTimes: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mornings before work, evenings after 6pm, weekends only..."
                  />
                </FormField>

                <FormField label="Communication Preference">
                  <select
                    value={formData.communicationPreference}
                    onChange={(e) => setFormData({...formData, communicationPreference: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="text">Text Message</option>
                    <option value="phone">Phone Call</option>
                    <option value="app">In-App Only</option>
                  </select>
                </FormField>

                <FormField label="How did they find you?">
                  <select
                    value={formData.referralSource}
                    onChange={(e) => setFormData({...formData, referralSource: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select source</option>
                    <option value="google">Google Search</option>
                    <option value="social-media">Social Media</option>
                    <option value="referral-client">Referred by Client</option>
                    <option value="referral-friend">Referred by Friend</option>
                    <option value="gym">Gym/Facility</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                </FormField>

                <FormField label="Additional Notes">
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Special considerations, personality notes, motivation factors, scheduling constraints..."
                  />
                </FormField>
              </div>
            )}
          </form>
        </div>
        
        {/* Fixed Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Previous
              </button>
            )}
            
            <button
              type="button"
              onClick={() => {
                setShowClientForm(false);
                setEditingClient(null);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                {editingClient ? 'Update Client' : 'Add Client'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

  // Simple forms for other entities
  const SimpleForm = ({ title, onSubmit, onCancel, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-blue-600">GymBag</h1>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'clients' && <Clients />}
        {activeTab === 'sessions' && <Sessions />}
        {activeTab === 'packages' && <Packages />}
        {activeTab === 'payments' && <Payments />}
        {activeTab === 'growth' && <Growth />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-6 gap-1 p-2">
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
            { id: 'clients', icon: Users, label: 'Clients' },
            { id: 'sessions', icon: Calendar, label: 'Sessions' },
            { id: 'packages', icon: Package, label: 'Packages' },
            { id: 'payments', icon: DollarSign, label: 'Payments' },
            { id: 'growth', icon: TrendingUp, label: 'Growth' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-lg ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Forms */}
      {showClientForm && <ClientForm />}
      

      {/* SESSION FORM */}

      {showSessionForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">
      {/* Fixed Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Schedule Session</h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {/* Client & Package Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Use Package Sessions</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">No package (one-time session)</option>
              <option value="1">10-Pack 60min (7 sessions remaining)</option>
              <option value="2">5-Pack 45min (3 sessions remaining)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Package sessions will be deducted when marked complete</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="personal-training">Personal Training</option>
              <option value="consultation">Initial Consultation</option>
              <option value="assessment">Fitness Assessment</option>
              <option value="group-session">Group Session</option>
              <option value="nutrition-coaching">Nutrition Coaching</option>
              <option value="check-in">Progress Check-in</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Date & Time</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                <input 
                  type="time" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  type="button"
                  className="p-2 border border-gray-300 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300 focus:ring-2 focus:ring-blue-500"
                >
                  30 min
                </button>
                <button 
                  type="button"
                  className="p-2 border border-blue-300 bg-blue-50 rounded-lg text-sm text-blue-700 font-medium"
                >
                  45 min
                </button>
                <button 
                  type="button"
                  className="p-2 border border-gray-300 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300 focus:ring-2 focus:ring-blue-500"
                >
                  60 min
                </button>
                <button 
                  type="button"
                  className="p-2 border border-gray-300 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300 focus:ring-2 focus:ring-blue-500"
                >
                  90 min
                </button>
              </div>
              <div className="mt-2">
                <input 
                  type="number" 
                  placeholder="Custom duration (minutes)" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="planned">Planned</option>
                <option value="confirmed">Confirmed</option>
                <option value="tentative">Tentative</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Location</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button"
                  className="p-2 border border-blue-300 bg-blue-50 rounded-lg text-sm text-blue-700 font-medium"
                >
                  Gym
                </button>
                <button 
                  type="button"
                  className="p-2 border border-gray-300 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300"
                >
                  Client Home
                </button>
                <button 
                  type="button"
                  className="p-2 border border-gray-300 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300"
                >
                  Outdoor
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Details</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select or type location</option>
                <option value="main-gym">Main Gym - Studio A</option>
                <option value="main-gym-b">Main Gym - Studio B</option>
                <option value="park-training">Central Park Training Area</option>
                <option value="client-home">Client's Home Gym</option>
                <option value="custom">Custom Location</option>
              </select>
            </div>

            <div>
              <input 
                type="text" 
                placeholder="Enter specific address or location details" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Session Planning */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Session Planning</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Focus</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select focus (optional)</option>
                <option value="strength">Strength Training</option>
                <option value="cardio">Cardio/Endurance</option>
                <option value="flexibility">Flexibility/Mobility</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="muscle-building">Muscle Building</option>
                <option value="functional">Functional Movement</option>
                <option value="sports-specific">Sports-Specific</option>
                <option value="rehabilitation">Rehabilitation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Objectives</label>
              <textarea 
                placeholder="Goals for this session, exercises to focus on, areas of improvement..." 
                className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Needed</label>
              <input 
                type="text" 
                placeholder="Dumbbells, resistance bands, yoga mat..." 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Recurring Sessions */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <input type="checkbox" id="recurring" className="rounded text-blue-600" />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">Create recurring sessions</label>
          </div>
          
          {/* Show only when recurring is checked */}
          <div className="space-y-3" style={{display: 'none'}}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Sessions</label>
                <input 
                  type="number" 
                  min="2" 
                  max="52"
                  placeholder="4" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input 
                type="date" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Options</h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="sendReminder" className="rounded text-blue-600" />
              <label htmlFor="sendReminder" className="text-sm text-gray-700">Send reminder to client (24 hours before)</label>
            </div>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" id="blockCalendar" className="rounded text-blue-600" />
              <label htmlFor="blockCalendar" className="text-sm text-gray-700">Block time in external calendar</label>
            </div>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" id="requireConfirmation" className="rounded text-blue-600" />
              <label htmlFor="requireConfirmation" className="text-sm text-gray-700">Require client confirmation</label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes</label>
            <textarea 
              placeholder="Special instructions, client requests, scheduling notes..." 
              className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Session Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Session Summary</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div className="flex justify-between">
              <span>Client:</span>
              <span className="font-medium">Not selected</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span className="font-medium">Not set</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">45 minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span className="font-medium">Not set</span>
            </div>
            <div className="flex justify-between">
              <span>Package:</span>
              <span className="font-medium">None</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowSessionForm(false)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowSessionForm(false)}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Schedule Session
          </button>
        </div>
      </div>
    </div>
  </div>
)}


        {/* PACKAGE FORM */}
      {showPackageForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">
      {/* Fixed Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Create Training Package</h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {/* Package Templates */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Quick Templates</h4>
          <div className="grid grid-cols-2 gap-2">
            <button className="text-left p-2 bg-white rounded border hover:bg-blue-50 text-sm">
              <div className="font-medium">Starter Pack</div>
              <div className="text-xs text-gray-600">5 sessions, 45min</div>
            </button>
            <button className="text-left p-2 bg-white rounded border hover:bg-blue-50 text-sm">
              <div className="font-medium">Standard Pack</div>
              <div className="text-xs text-gray-600">10 sessions, 60min</div>
            </button>
            <button className="text-left p-2 bg-white rounded border hover:bg-blue-50 text-sm">
              <div className="font-medium">Premium Pack</div>
              <div className="text-xs text-gray-600">20 sessions, 60min</div>
            </button>
            <button className="text-left p-2 bg-white rounded border hover:bg-blue-50 text-sm">
              <div className="font-medium">Assessment</div>
              <div className="text-xs text-gray-600">1 session, 90min</div>
            </button>
          </div>
        </div>

        {/* Basic Package Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
            <input 
              type="text" 
              placeholder="e.g., 10-Session Personal Training Package" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
              placeholder="Package description for clients (what's included, benefits, etc.)" 
              className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="personal-training">Personal Training</option>
              <option value="group-training">Group Training</option>
              <option value="consultation">Consultation Package</option>
              <option value="nutrition-coaching">Nutrition Coaching</option>
              <option value="online-coaching">Online Coaching</option>
              <option value="assessment">Fitness Assessment</option>
              <option value="specialty">Specialty Program</option>
            </select>
          </div>
        </div>

        {/* Pricing & Sessions */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Pricing & Sessions</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Session</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Auto-calculated" 
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50" 
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Sessions *</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="10" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration (min)</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60" selected>60 minutes</option>
                  <option value="75">75 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Validity & Terms */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Validity & Terms</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expires After</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="1"
                    placeholder="90" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                  <select className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave blank for no expiry</p>
              </div>
              
              

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="24-hour">24 hour cancellation required</option>
                <option value="48-hour">48 hour cancellation required</option>
                <option value="same-day">Same day cancellation allowed</option>
                <option value="no-cancellation">No cancellations after purchase</option>
                <option value="custom">Custom policy</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-blue-600" />
                <span className="text-sm text-gray-700">Allow unused sessions to be transferred to other packages</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-blue-600" />
                <span className="text-sm text-gray-700">Allow partial refunds for unused sessions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Options</h4>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bonus/Incentives</label>
              <input 
                type="text" 
                placeholder="e.g., Free nutrition consultation, workout plan included" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All fitness levels</option>
                <option value="beginners">Beginners</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="seniors">Seniors (55+)</option>
                <option value="athletes">Athletes</option>
                <option value="weight-loss">Weight loss focused</option>
                <option value="strength">Strength training focused</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
              <textarea 
                placeholder="Internal notes about this package (cost breakdown, profit margins, etc.)" 
                className="w-full p-3 border border-gray-300 rounded-lg h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Package Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Package Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Value:</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Per Session:</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Total Sessions:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">0 min</span>
            </div>
            <div className="flex justify-between">
              <span>Expires:</span>
              <span className="font-medium">Never</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPackageForm(false)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowPackageForm(false)}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Create Package
          </button>
        </div>
      </div>
    </div>
  </div>
)}



       {/* PAYMENT FORM */}
      {showPaymentForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">
      {/* Fixed Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Log Payment</h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {/* Client & Service */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment For</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Select service/package</option>
              <option value="session">Individual Session</option>
              <option value="package">Training Package</option>
              <option value="consultation">Initial Consultation</option>
              <option value="nutrition">Nutrition Coaching</option>
              <option value="assessment">Fitness Assessment</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Show package dropdown if package is selected */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Related Package</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">None</option>
              <option value="1">10-Pack 60min - $800</option>
              <option value="2">5-Pack 45min - $375</option>
            </select>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial Payment</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="credit-card">Credit Card</option>
                <option value="debit-card">Debit Card</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="venmo">Venmo</option>
                <option value="zelle">Zelle</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receipt/Reference Number</label>
              <input 
                type="text" 
                placeholder="Transaction ID, receipt number, etc." 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Options</h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="recurring" className="rounded text-green-600" />
              <label htmlFor="recurring" className="text-sm text-gray-700">Set up recurring payment</label>
            </div>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" id="sendReceipt" className="rounded text-green-600" />
              <label htmlFor="sendReceipt" className="text-sm text-gray-700">Send receipt to client</label>
            </div>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" id="updatePackage" className="rounded text-green-600" />
              <label htmlFor="updatePackage" className="text-sm text-gray-700">Activate associated package</label>
            </div>
          </div>
        </div>

        {/* Recurring Payment Details (show only if recurring is checked) */}
        <div className="border-t border-gray-200 pt-4" style={{display: 'none'}}>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recurring Payment Setup</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Payment</label>
              <input 
                type="date" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea 
              placeholder="Payment notes, special terms, installment details, etc." 
              className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Totals Display */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span>Client:</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        </div>
      </div>
      

      {/* Fixed Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPaymentForm(false)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowPaymentForm(false)}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            Log Payment
          </button>
        </div>
      </div>
    </div>
  </div>
)}



            {/* Post form */}
      {showPostForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">
      {/* Fixed Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Plan Social Media Post</h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Post Title/Topic *</label>
            <input 
              type="text" 
              placeholder="e.g., Monday Motivation - Deadlift Form Tips" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select Platform</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter">Twitter/X</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="workout-tip">Workout Tip</option>
                <option value="transformation">Client Transformation</option>
                <option value="motivation">Motivation</option>
                <option value="nutrition">Nutrition Advice</option>
                <option value="behind-scenes">Behind the Scenes</option>
                <option value="educational">Educational</option>
                <option value="promotional">Promotional</option>
                <option value="community">Community Engagement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Scheduling</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Planned Date *</label>
              <input 
                type="date" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Planned Time</label>
              <input 
                type="time" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              />
            </div>
          </div>
          
          <div className="mt-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-600">Set reminder 30 minutes before</span>
            </label>
          </div>
        </div>

        {/* Content Planning */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Content Planning</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption/Content Ideas</label>
              <textarea 
                placeholder="Draft your caption, key points to cover, or content outline..." 
                className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
              <input 
                type="text" 
                placeholder="#fitness #personaltrainer #motivation #workout" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              />
              <p className="text-xs text-gray-500 mt-1">Separate hashtags with spaces</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select CTA (optional)</option>
                <option value="book-consultation">Book a consultation</option>
                <option value="dm-questions">DM for questions</option>
                <option value="like-share">Like and share</option>
                <option value="follow-more">Follow for more tips</option>
                <option value="comment-experience">Comment your experience</option>
                <option value="tag-friend">Tag a workout buddy</option>
                <option value="visit-website">Visit website</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assets & Media */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Media Assets</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="contentType" value="photo" className="text-purple-600" />
                  <span className="text-sm">Photo</span>
                </label>
                <label className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="contentType" value="video" className="text-purple-600" />
                  <span className="text-sm">Video</span>
                </label>
                <label className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="contentType" value="carousel" className="text-purple-600" />
                  <span className="text-sm">Carousel</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset Notes</label>
              <textarea 
                placeholder="Describe photos/videos needed, shot list, props, locations..." 
                className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Goals & Tracking */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Goals & Tracking</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="awareness">Brand Awareness</option>
                <option value="engagement">Engagement</option>
                <option value="leads">Generate Leads</option>
                <option value="education">Educate Audience</option>
                <option value="community">Build Community</option>
                <option value="promotion">Promote Services</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="current-clients">Current Clients</option>
                <option value="fitness-beginners">Fitness Beginners</option>
                <option value="weight-loss">Weight Loss Seekers</option>
                <option value="strength-training">Strength Training</option>
                <option value="general-fitness">General Fitness</option>
                <option value="local-community">Local Community</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea 
              placeholder="Any other details, collaboration notes, or reminders..." 
              className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {/* Fixed Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPostForm(false)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowPostForm(false)}
            className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
          >
            Save Post Plan
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {showLeadForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
      {/* Fixed Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Add Lead</h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Essential Info - Always Visible */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name *</label>
            <input 
              type="text" 
              placeholder="Full name" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Platform</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="follow-up">Follow-up</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Handle/Username</label>
            <input 
              type="text" 
              placeholder="@username or profile URL" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Action Date</label>
            <input 
              type="date" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
        </div>

        {/* Collapsible Contact Section */}
        <div className="border-t border-gray-200 pt-4">
          <button 
            type="button"
            className="flex items-center justify-between w-full text-left"
            onClick={() => {/* Toggle contact section */}}
          >
            <h4 className="text-sm font-medium text-gray-700">Contact Information</h4>
            <span className="text-gray-400">+</span>
          </button>
          
          {/* Show/hide based on toggle state */}
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="tel" 
                placeholder="(555) 123-4567" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Collapsible Goals Section */}
        <div className="border-t border-gray-200 pt-4">
          <button 
            type="button"
            className="flex items-center justify-between w-full text-left"
            onClick={() => {/* Toggle goals section */}}
          >
            <h4 className="text-sm font-medium text-gray-700">Goals & Interest</h4>
            <span className="text-gray-400">+</span>
          </button>
          
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Interest</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select interest</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="strength-training">Strength Training</option>
                <option value="cardio-fitness">Cardio/Fitness</option>
                <option value="nutrition">Nutrition Coaching</option>
                <option value="general-fitness">General Fitness</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Not discussed</option>
                <option value="under-50">Under $50/session</option>
                <option value="50-75">$50-75/session</option>
                <option value="75-100">$75-100/session</option>
                <option value="100-150">$100-150/session</option>
                <option value="150-plus">$150+/session</option>
                <option value="package-deal">Package interested</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible Lead Source Section */}
        <div className="border-t border-gray-200 pt-4">
          <button 
            type="button"
            className="flex items-center justify-between w-full text-left"
            onClick={() => {/* Toggle source section */}}
          >
            <h4 className="text-sm font-medium text-gray-700">Lead Source</h4>
            <span className="text-gray-400">+</span>
          </button>
          
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How did they find you?</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select source</option>
                <option value="social-media-post">Social Media Post</option>
                <option value="referral">Referral</option>
                <option value="google-search">Google Search</option>
                <option value="local-ad">Local Ad</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
              <input 
                type="text" 
                placeholder="Who referred them?" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              placeholder="Initial conversation notes, requirements, availability..." 
              className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {/* Fixed Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowLeadForm(false)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowLeadForm(false)}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Save Lead
          </button>
        </div>
      </div>
    </div>
  </div>
      )}
    </div>
  );
};

export default GymBagApp;
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Package, DollarSign, TrendingUp, Plus, CheckCircle, Clock, User, Phone, Mail, MapPin } from 'lucide-react';

const GymBagApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Sample data - in a real app this would come from a backend
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

  const [leads, setLeads] = useState([
    {
      id: 1,
      name: 'Jessica Smith',
      platform: 'Instagram',
      handle: '@jess_fitness',
      status: 'new',
      nextActionDate: '2025-09-05',
      notes: 'Interested in nutrition coaching'
    },
    {
      id: 2,
      name: 'David Wilson',
      platform: 'Facebook',
      handle: 'David W.',
      status: 'contacted',
      nextActionDate: '2025-09-06',
      notes: 'Follow up on consultation call'
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
  const Dashboard = () => (
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
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Revenue This Month</p>
              <p className="text-2xl font-bold text-green-900">${getThisMonthRevenue()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
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

  // Client Form Component
  const ClientForm = () => {
    const [formData, setFormData] = useState(editingClient || {
      name: '',
      phone: '',
      email: '',
      status: 'prospect',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (editingClient) {
        setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...formData } : c));
      } else {
        setClients(prev => [...prev, { ...formData, id: Date.now() }]);
      }
      setShowClientForm(false);
      setEditingClient(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">
            {editingClient ? 'Edit Client' : 'Add Client'}
          </h2>
          <div onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg h-20"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowClientForm(false);
                  setEditingClient(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {editingClient ? 'Update' : 'Add'} Client
              </button>
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
      
      {showSessionForm && (
        <SimpleForm
          title="Add Session"
          onSubmit={() => {
            // Add session logic here
            setShowSessionForm(false);
          }}
          onCancel={() => setShowSessionForm(false)}
        >
          <div className="space-y-4">
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <input type="date" className="w-full p-2 border border-gray-300 rounded-lg" />
            <input type="time" className="w-full p-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Location" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
        </SimpleForm>
      )}

      {showPackageForm && (
        <SimpleForm
          title="Add Package"
          onSubmit={() => setShowPackageForm(false)}
          onCancel={() => setShowPackageForm(false)}
        >
          <div className="space-y-4">
            <input type="text" placeholder="Package Name" className="w-full p-2 border border-gray-300 rounded-lg" />
            <input type="number" placeholder="Price" className="w-full p-2 border border-gray-300 rounded-lg" />
            <input type="number" placeholder="Number of Sessions" className="w-full p-2 border border-gray-300 rounded-lg" />
            <input type="number" placeholder="Session Duration (min)" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
        </SimpleForm>
      )}

      {showPaymentForm && (
        <SimpleForm
          title="Log Payment"
          onSubmit={() => setShowPaymentForm(false)}
          onCancel={() => setShowPaymentForm(false)}
        >
          <div className="space-y-4">
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <input type="number" placeholder="Amount" className="w-full p-2 border border-gray-300 rounded-lg" />
            <input type="date" className="w-full p-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Payment Method" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
        </SimpleForm>
      )}

      {showPostForm && (
        <SimpleForm
          title="Plan Post"
          onSubmit={() => setShowPostForm(false)}
          onCancel={() => setShowPostForm(false)}
        >
          <div className="space-y-4">
            <input type="text" placeholder="Post Title/Idea" className="w-full p-2 border border-gray-300 rounded-lg" />
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Select Platform</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Facebook</option>
              <option>YouTube</option>
            </select>
            <input type="date" className="w-full p-2 border border-gray-300 rounded-lg" />
            <textarea placeholder="Notes" className="w-full p-2 border border-gray-300 rounded-lg h-20" />
          </div>
        </SimpleForm>
      )}

      {showLeadForm && (
        <SimpleForm
          title="Add Lead"
          onSubmit={() => setShowLeadForm(false)}
          onCancel={() => setShowLeadForm(false)}
        >
          <div className="space-y-4">
            <input type="text" placeholder="Lead Name" className="w-full p-2 border border-gray-300 rounded-lg" />
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Select Platform</option>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>TikTok</option>
              <option>LinkedIn</option>
            </select>
            <input type="text" placeholder="Handle/Username" className="w-full p-2 border border-gray-300 rounded-lg" />
            <input type="date" placeholder="Next Action Date" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
        </SimpleForm>
      )}
    </div>
  );
};

export default GymBagApp;
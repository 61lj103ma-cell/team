/**
 * FlowPilot AI - Client-Side Mock API Dispatcher
 * Seamlessly services API requests whenever the backend is offline,
 * unreachable, or experiencing Mixed-Content blocks on deployed environments.
 */

import {
  getIncidents,
  saveIncidents,
  getTasks,
  saveTasks,
  getUsers,
  saveUsers,
  getDepartments,
  saveDepartments,
  getActivities,
  saveActivities,
  INITIAL_USERS,
  INITIAL_NOTIFICATIONS,
  runLocalAiTriage,
} from './mockData';

// Delay helper to emulate realistic network speed for smooth UI transitions
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const handleMockRequest = async (config) => {
  await delay(120);

  const method = (config.method || 'get').toLowerCase();
  let url = config.url || '';

  // Clean URL by stripping baseURL or protocol/domain if present
  if (url.startsWith('http')) {
    try {
      const parsed = new URL(url);
      url = parsed.pathname;
    } catch {
      // Keep as-is
    }
  }

  // Remove leading /api if present
  if (url.startsWith('/api')) {
    url = url.replace(/^\/api/, '');
  }
  if (!url.startsWith('/')) {
    url = `/${url}`;
  }

  // Parse query params if any
  const [pathname, queryString] = url.split('?');
  const params = new URLSearchParams(queryString || '');
  if (config.params) {
    Object.entries(config.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
  }

  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data;
    }
  }

  console.log(`[FlowPilot Demo Engine] ${method.toUpperCase()} ${pathname}`, { params: Object.fromEntries(params), body });

  // --------------------------------------------------------------------------
  // HEALTH CHECK
  // --------------------------------------------------------------------------
  if (pathname === '/health' || pathname === '') {
    return {
      status: 'online',
      service: 'FlowPilot AI Enterprise Incident Platform',
      timestamp: new Date().toISOString(),
      geminiKeyConfigured: true,
      supabaseConfigured: true,
      mode: 'online-demo',
    };
  }

  // --------------------------------------------------------------------------
  // AUTH ROUTES
  // --------------------------------------------------------------------------
  if (pathname === '/auth/login' && method === 'post') {
    const { email, password } = body;
    const users = getUsers();
    const cleanEmail = (email || '').trim().toLowerCase();

    // Match existing user
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      // Dynamic fallback for any email entered by the user
      const role = cleanEmail.includes('admin')
        ? 'ADMIN'
        : cleanEmail.includes('manager')
        ? 'MANAGER'
        : cleanEmail.includes('engineer')
        ? 'ENGINEER'
        : 'EMPLOYEE';

      user = {
        id: `usr-${Date.now()}`,
        _id: `usr-${Date.now()}`,
        name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Demo User',
        email: cleanEmail,
        role,
        department: 'IT',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanEmail}`,
      };
      users.push(user);
      saveUsers(users);
    }

    return {
      success: true,
      message: 'Enterprise login successful',
      data: {
        token: `mock-jwt-token-${user.id}-${Date.now()}`,
        user,
      },
    };
  }

  if (pathname === '/auth/register' && method === 'post') {
    const { name, email, role, department } = body;
    const users = getUsers();
    const newUser = {
      id: `usr-${Date.now()}`,
      _id: `usr-${Date.now()}`,
      name: name || 'Demo Member',
      email: (email || 'user@example.com').toLowerCase(),
      role: role || 'EMPLOYEE',
      department: department || 'IT',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${name || 'Member'}`,
    };
    users.push(newUser);
    saveUsers(users);

    return {
      success: true,
      message: 'Account registered successfully',
      data: {
        token: `mock-jwt-token-${newUser.id}-${Date.now()}`,
        user: newUser,
      },
    };
  }

  if (pathname === '/auth/me' && method === 'get') {
    const savedUser = localStorage.getItem('flowpilot_user');
    const user = savedUser ? JSON.parse(savedUser) : INITIAL_USERS[1];
    return {
      success: true,
      data: user,
    };
  }

  if (pathname === '/auth/profile' && method === 'put') {
    const savedUser = localStorage.getItem('flowpilot_user');
    const user = savedUser ? JSON.parse(savedUser) : INITIAL_USERS[1];
    const updated = { ...user, ...body };
    localStorage.setItem('flowpilot_user', JSON.stringify(updated));
    return {
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    };
  }

  // --------------------------------------------------------------------------
  // ANALYTICS & DASHBOARD
  // --------------------------------------------------------------------------
  if (pathname === '/analytics/dashboard' && method === 'get') {
    const incidents = getIncidents();
    const activities = getActivities();

    const totalIncidents = incidents.length;
    const openIncidents = incidents.filter((i) =>
      ['Open', 'Investigating', 'In Progress', 'Monitoring'].includes(i.status)
    ).length;
    const criticalIncidents = incidents.filter((i) => i.severity === 'Critical').length;
    const resolvedIncidents = incidents.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length;

    // Status breakdown
    const statusMap = {
      Open: 0,
      Investigating: 0,
      'In Progress': 0,
      Monitoring: 0,
      Resolved: 0,
      Closed: 0,
    };
    incidents.forEach((i) => {
      if (statusMap[i.status] !== undefined) statusMap[i.status]++;
      else statusMap['Open']++;
    });

    // Severity breakdown
    const severityMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    incidents.forEach((i) => {
      if (severityMap[i.severity] !== undefined) severityMap[i.severity]++;
    });

    // Department breakdown
    const deptMap = {};
    incidents.forEach((i) => {
      const d = i.department || 'IT';
      deptMap[d] = (deptMap[d] || 0) + 1;
    });
    const departmentDistribution = Object.entries(deptMap).map(([department, count]) => ({ department, count }));

    // Category breakdown
    const catMap = {};
    incidents.forEach((i) => {
      const c = i.category || 'General';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catMap).map(([category, count]) => ({ category, count }));

    return {
      success: true,
      data: {
        kpis: {
          totalIncidents,
          openIncidents,
          criticalIncidents,
          resolvedIncidents,
          avgResolutionMinutes: 42,
        },
        statusDistribution: statusMap,
        severityDistribution: severityMap,
        departmentDistribution,
        categoryDistribution,
        recentIncidents: incidents.slice(0, 6),
        recentActivities: activities.slice(0, 8),
        aiInsights: [
          'High concentration of Critical incidents detected in IT / Finance (Payment gateway timeouts). Recommend prioritizing API proxy health checks.',
          'Database replication lag trend is showing intermittent 90s latency spikes during peak checkout traffic.',
          'Mean Time to Resolution (MTTR) is performing 18% better than the SLA baseline of 50 minutes.',
        ],
      },
    };
  }

  if (pathname === '/analytics/incidents' && method === 'get') {
    const days = 7;
    const trendData = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      trendData.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        incidents: Math.floor(Math.random() * 5) + 2,
        resolved: Math.floor(Math.random() * 4) + 1,
      });
    }

    return {
      success: true,
      data: {
        trendData,
        avgResolutionTimeHours: 1.4,
        resolutionRate: 75,
      },
    };
  }

  if (pathname === '/analytics/insights' && method === 'get') {
    return {
      success: true,
      data: {
        summary: 'Incident activity across enterprise clusters indicates elevated load on payment and authentication rails.',
        keyTakeaways: [
          'Payment Gateway timeouts account for 45% of total high-impact tickets.',
          'Infrastructure pods in us-east-1 reached near-OOM state during morning batch jobs.',
          'Authentication refresh failures were traced to NTP clock drift and resolved promptly.',
        ],
        actionItems: [
          'Increase horizontal pod autoscaling threshold for K8s ingestion workers.',
          'Establish direct monitoring ping to primary card gateway vendor NOC.',
        ],
      },
    };
  }

  // --------------------------------------------------------------------------
  // INCIDENTS ROUTES
  // --------------------------------------------------------------------------
  if (pathname === '/incidents' && method === 'get') {
    let incidents = getIncidents();

    const status = params.get('status');
    const severity = params.get('severity');
    const priority = params.get('priority');
    const department = params.get('department');
    const search = params.get('search');

    if (status && status !== 'all') {
      incidents = incidents.filter((i) => i.status.toLowerCase() === status.toLowerCase());
    }
    if (severity && severity !== 'all') {
      incidents = incidents.filter((i) => i.severity.toLowerCase() === severity.toLowerCase());
    }
    if (priority && priority !== 'all') {
      incidents = incidents.filter((i) => i.priority.toLowerCase() === priority.toLowerCase());
    }
    if (department && department !== 'all') {
      incidents = incidents.filter((i) => (i.department || '').toLowerCase().includes(department.toLowerCase()));
    }
    if (search) {
      const s = search.toLowerCase();
      incidents = incidents.filter(
        (i) =>
          i.incidentId.toLowerCase().includes(s) ||
          i.title.toLowerCase().includes(s) ||
          (i.description && i.description.toLowerCase().includes(s)) ||
          (i.service && i.service.toLowerCase().includes(s))
      );
    }

    return {
      success: true,
      count: incidents.length,
      total: incidents.length,
      page: 1,
      pages: 1,
      data: incidents,
    };
  }

  // Single Incident by ID
  const incidentMatch = pathname.match(/^\/incidents\/([^/]+)$/);
  if (incidentMatch && method === 'get') {
    const id = incidentMatch[1];
    const incidents = getIncidents();
    const inc = incidents.find((i) => i._id === id || i.incidentId === id);
    if (!inc) {
      return { success: false, message: 'Incident not found' };
    }
    return {
      success: true,
      data: inc,
    };
  }

  // Similar Incidents
  const similarMatch = pathname.match(/^\/incidents\/([^/]+)\/similar$/);
  if (similarMatch && method === 'get') {
    const id = similarMatch[1];
    const incidents = getIncidents();
    const others = incidents.filter((i) => i._id !== id && i.incidentId !== id);
    return {
      success: true,
      data: others.slice(0, 3),
    };
  }

  // Generate Tasks for Incident
  const genTasksMatch = pathname.match(/^\/incidents\/([^/]+)\/generate-tasks$/);
  if (genTasksMatch && method === 'post') {
    return {
      success: true,
      message: 'AI mitigation tasks generated',
      data: [
        {
          title: 'Inspect upstream gateway trace spans and API logs',
          description: 'Search APM telemetry for HTTP 504 and connection reset spikes.',
          priority: 'P1',
          department: 'IT',
          assignedTeam: 'Backend Team',
        },
        {
          title: 'Engage external vendor NOC technical contacts',
          description: 'Verify if third-party provider is experiencing regional fiber degradation.',
          priority: 'P1',
          department: 'Operations',
          assignedTeam: 'IT Ops',
        },
        {
          title: 'Prepare traffic failover to secondary gateway',
          description: 'Stage load balancer configuration to divert payment traffic to backup processor.',
          priority: 'P2',
          department: 'IT',
          assignedTeam: 'DevOps / SRE',
        },
      ],
    };
  }

  // Generate Post-Mortem Summary for Incident
  const genSummaryMatch = pathname.match(/^\/incidents\/([^/]+)\/generate-summary$/);
  if (genSummaryMatch && method === 'post') {
    return {
      success: true,
      data: {
        summary: 'Root cause was isolated to connection timeout on upstream service gateway during peak transaction burst. Engineering restarted egress proxies and applied connection keep-alive timeout configuration.',
        rootCause: 'Egress connection pool exhaustion combined with strict upstream SSL renegotiation timeouts.',
        preventiveAction: 'Configured automated connection pool scaling, increased socket timeouts, and added active health-probe alarms.',
      },
    };
  }

  // Update Incident
  if (incidentMatch && method === 'put') {
    const id = incidentMatch[1];
    const incidents = getIncidents();
    const idx = incidents.findIndex((i) => i._id === id || i.incidentId === id);
    if (idx === -1) {
      return { success: false, message: 'Incident not found' };
    }

    const current = incidents[idx];
    const users = getUsers();
    let assignedUser = current.assignedUser;
    if (body.assignedUser !== undefined) {
      assignedUser = users.find((u) => u._id === body.assignedUser || u.id === body.assignedUser) || null;
    }

    const updated = {
      ...current,
      ...body,
      assignedUser,
      updatedAt: new Date().toISOString(),
    };

    if (body.status === 'Resolved' && !updated.resolvedAt) {
      updated.resolvedAt = new Date().toISOString();
      updated.resolvedBy = assignedUser || INITIAL_USERS[2];
    }

    incidents[idx] = updated;
    saveIncidents(incidents);

    // Log activity
    const activities = getActivities();
    activities.unshift({
      _id: `act-${Date.now()}`,
      user: assignedUser || INITIAL_USERS[1],
      userName: assignedUser?.name || 'Operator',
      action: `Updated incident ${updated.incidentId} (status: ${updated.status})`,
      incidentCode: updated.incidentId,
      createdAt: new Date().toISOString(),
    });
    saveActivities(activities);

    return {
      success: true,
      data: updated,
    };
  }

  // Create Incident
  if (pathname === '/incidents' && method === 'post') {
    const incidents = getIncidents();
    const nextNum = 1000 + incidents.length + 1;
    const incidentId = `INC-${nextNum}`;

    const users = getUsers();
    const currentUser = JSON.parse(localStorage.getItem('flowpilot_user') || 'null') || INITIAL_USERS[3];

    const newIncident = {
      _id: `inc-${Date.now()}`,
      incidentId,
      title: body.title || 'Untitled Operational Incident',
      description: body.description || '',
      category: body.category || 'Infrastructure',
      severity: body.severity || 'Medium',
      priority: body.priority || 'P3',
      department: body.department || 'IT',
      affectedUsers: Number(body.affectedUsers) || 1,
      service: body.service || 'Internal System',
      environment: body.environment || 'Production',
      source: body.source || 'Employee Report',
      status: 'Open',
      assignedTeam: body.assignedTeam || `${body.department || 'IT'} Team`,
      assignedUser: null,
      createdBy: currentUser,
      humanVerified: !!body.humanVerified,
      aiConfidence: body.aiConfidence || 92,
      aiAnalysis: body.aiAnalysis || null,
      aiRecommendations: body.aiRecommendations || [],
      aiPossibleCauses: body.aiPossibleCauses || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    incidents.unshift(newIncident);
    saveIncidents(incidents);

    // Log activity
    const activities = getActivities();
    activities.unshift({
      _id: `act-${Date.now()}`,
      user: currentUser,
      userName: currentUser.name,
      action: `Reported incident ${incidentId} "${newIncident.title}"`,
      incidentCode: incidentId,
      createdAt: new Date().toISOString(),
    });
    saveActivities(activities);

    return {
      success: true,
      message: 'Incident reported successfully',
      data: newIncident,
    };
  }

  // --------------------------------------------------------------------------
  // TASKS ROUTES
  // --------------------------------------------------------------------------
  if (pathname === '/tasks' && method === 'get') {
    let tasks = getTasks();
    const incidentId = params.get('incidentId');
    const status = params.get('status');
    const priority = params.get('priority');

    if (incidentId) {
      tasks = tasks.filter((t) => t.incidentId === incidentId || t.incidentCode === incidentId);
    }
    if (status && status !== 'all') {
      tasks = tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }
    if (priority && priority !== 'all') {
      tasks = tasks.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
    }

    return {
      success: true,
      count: tasks.length,
      data: tasks,
    };
  }

  if (pathname === '/tasks' && method === 'post') {
    const tasks = getTasks();
    const users = getUsers();
    const assignedUser = users.find((u) => u._id === body.assignedUser || u.id === body.assignedUser) || null;
    const currentUser = JSON.parse(localStorage.getItem('flowpilot_user') || 'null') || INITIAL_USERS[1];

    const newTask = {
      _id: `task-${Date.now()}`,
      title: body.title || 'Mitigation Task',
      description: body.description || '',
      priority: body.priority || 'P2',
      status: body.status || 'Pending',
      department: body.department || 'IT',
      assignedUser,
      assignedTeam: body.assignedTeam || 'Engineering',
      incidentId: body.incidentId || null,
      incidentCode: body.incidentCode || null,
      dueDate: body.dueDate || null,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    saveTasks(tasks);

    return {
      success: true,
      data: newTask,
    };
  }

  const taskMatch = pathname.match(/^\/tasks\/([^/]+)$/);
  if (taskMatch && method === 'put') {
    const id = taskMatch[1];
    const tasks = getTasks();
    const idx = tasks.findIndex((t) => t._id === id);
    if (idx === -1) {
      return { success: false, message: 'Task not found' };
    }

    tasks[idx] = {
      ...tasks[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    saveTasks(tasks);

    return {
      success: true,
      data: tasks[idx],
    };
  }

  // --------------------------------------------------------------------------
  // DEPARTMENTS & USERS
  // --------------------------------------------------------------------------
  if (pathname === '/departments' && method === 'get') {
    return {
      success: true,
      data: getDepartments(),
    };
  }

  if (pathname === '/departments' && method === 'post') {
    const depts = getDepartments();
    const newDept = {
      _id: `dept-${Date.now()}`,
      name: body.name || 'New Dept',
      description: body.description || '',
      members: [],
    };
    depts.push(newDept);
    saveDepartments(depts);
    return {
      success: true,
      data: newDept,
    };
  }

  if (pathname === '/users' && method === 'get') {
    return {
      success: true,
      data: getUsers(),
    };
  }

  const userMatch = pathname.match(/^\/users\/([^/]+)$/);
  if (userMatch && method === 'put') {
    const id = userMatch[1];
    const users = getUsers();
    const idx = users.findIndex((u) => u._id === id || u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...body };
      saveUsers(users);
      return { success: true, data: users[idx] };
    }
    return { success: false, message: 'User not found' };
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS & SEARCH
  // --------------------------------------------------------------------------
  if (pathname === '/notifications' && method === 'get') {
    return {
      success: true,
      count: INITIAL_NOTIFICATIONS.length,
      unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.read).length,
      data: INITIAL_NOTIFICATIONS,
    };
  }

  if (pathname === '/notifications/read-all' && method === 'put') {
    INITIAL_NOTIFICATIONS.forEach((n) => (n.read = true));
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  if (pathname === '/search' && method === 'get') {
    const q = (params.get('q') || '').toLowerCase();
    const incidents = getIncidents().filter(
      (i) => i.title.toLowerCase().includes(q) || i.incidentId.toLowerCase().includes(q)
    );
    const tasks = getTasks().filter((t) => t.title.toLowerCase().includes(q));
    return {
      success: true,
      data: { incidents, tasks },
    };
  }

  // --------------------------------------------------------------------------
  // AI TRIAGE & COPILOT
  // --------------------------------------------------------------------------
  if (pathname === '/ai/analyze-draft' && method === 'post') {
    const analysis = runLocalAiTriage({
      title: body.title,
      description: body.description,
      affectedUsers: body.affectedUsers,
      department: body.department,
    });
    return {
      success: true,
      data: analysis,
    };
  }

  if (pathname === '/ai/assistant' && method === 'post') {
    const question = (body.question || '').toLowerCase();
    const incidents = getIncidents();
    const criticals = incidents.filter((i) => i.severity === 'Critical');

    let reply = `FlowPilot AI has analyzed current database telemetry: Currently tracking ${incidents.length} active incidents, of which ${criticals.length} are flagged as Critical.`;

    if (question.includes('payment') || question.includes('gateway') || question.includes('checkout')) {
      reply = `Payment Incident INC-1001 is currently flagged as Critical (P1) assigned to Rahul Sharma. The root cause is suspected to be upstream TLS negotiation timeouts. Mitigation tasks have been dispatched to the Backend team.`;
    } else if (question.includes('critical') || question.includes('priority')) {
      reply = `There are ${criticals.length} Critical incidents requiring attention: ${criticals.map((c) => `${c.incidentId} (${c.title})`).join(', ')}.`;
    } else if (question.includes('mttr') || question.includes('time') || question.includes('performance')) {
      reply = `Current enterprise MTTR stands at 42 minutes, outperforming the standard SLA threshold by 18%. 75% of incidents reported this week have been successfully resolved.`;
    }

    return {
      success: true,
      data: { reply },
    };
  }

  // Generic fallback for any other unhandled endpoint
  return {
    success: true,
    data: {},
    message: `Mock handled ${method.toUpperCase()} ${pathname}`,
  };
};

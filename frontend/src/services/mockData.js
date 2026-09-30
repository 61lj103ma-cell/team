/**
 * FlowPilot AI - Realistic Enterprise Mock Dataset & Fallback Engine
 * Ensures 100% functionality on deployed frontend demos (e.g., Vercel)
 * when a remote backend has not been configured.
 */

const STORAGE_KEY_INCIDENTS = 'flowpilot_mock_incidents';
const STORAGE_KEY_TASKS = 'flowpilot_mock_tasks';
const STORAGE_KEY_ACTIVITIES = 'flowpilot_mock_activities';
const STORAGE_KEY_USERS = 'flowpilot_mock_users';
const STORAGE_KEY_DEPTS = 'flowpilot_mock_departments';

export const INITIAL_USERS = [
  {
    id: 'usr-admin-01',
    _id: 'usr-admin-01',
    name: 'Sarah Connor (Admin)',
    email: 'admin@example.com',
    role: 'ADMIN',
    department: 'IT',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'usr-mgr-02',
    _id: 'usr-mgr-02',
    name: 'Marcus Vance (Manager)',
    email: 'manager@example.com',
    role: 'MANAGER',
    department: 'IT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'usr-eng-03',
    _id: 'usr-eng-03',
    name: 'Rahul Sharma (Engineer)',
    email: 'engineer@example.com',
    role: 'ENGINEER',
    department: 'IT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 'usr-emp-04',
    _id: 'usr-emp-04',
    name: 'Elena Rostova (Employee)',
    email: 'employee@example.com',
    role: 'EMPLOYEE',
    department: 'Customer Support',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
];

export const INITIAL_DEPARTMENTS = [
  { _id: 'dept-1', name: 'IT', description: 'Core infrastructure, site reliability, backend services and cloud devops.' },
  { _id: 'dept-2', name: 'Finance', description: 'Payment rails, payroll accounting, billing gateways, and financial audits.' },
  { _id: 'dept-3', name: 'Operations', description: 'Day-to-day corporate logistics, vendor pipelines, and monitoring.' },
  { _id: 'dept-4', name: 'HR', description: 'Personnel systems, employee benefits, internal communications, onboarding.' },
  { _id: 'dept-5', name: 'Sales', description: 'CRM systems, quote generators, enterprise sales channels.' },
  { _id: 'dept-6', name: 'Customer Support', description: 'Tier-1 customer escalations, helpdesk systems, and live chat queues.' },
  { _id: 'dept-7', name: 'Security', description: 'Identity management, threat detection, penetration testing, and compliance.' },
];

export const INITIAL_INCIDENTS = [
  {
    _id: 'inc-1001',
    incidentId: 'INC-1001',
    title: 'Payment Gateway Connection Timeout & Checkout Failures',
    description: 'More than 150 checkout transactions failed with HTTP 504 gateway timeout. Customers report card verification hangs indefinitely on mobile and web checkout flows.',
    category: 'Payment',
    severity: 'Critical',
    priority: 'P1',
    department: 'IT / Finance',
    affectedUsers: 180,
    service: 'Payment API / Stripe Connector',
    environment: 'Production',
    source: 'Monitoring',
    status: 'In Progress',
    assignedTeam: 'Backend & Payment Systems',
    assignedUser: INITIAL_USERS[2],
    createdBy: INITIAL_USERS[3],
    humanVerified: true,
    aiConfidence: 94,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    aiAnalysis: {
      category: 'Payment',
      severity: 'Critical',
      priority: 'P1',
      department: 'IT / Finance',
      impact: 'Direct revenue loss; card charges interrupted mid-flight',
      affectedUsersEstimate: 180,
      summary: 'Payment API is failing external TLS handshakes with primary card processing gateway.',
      possibleCauses: [
        { cause: 'Payment gateway SSL handshake timeout', confidence: 'High', reasoning: 'Spike in 504 errors isolated strictly to third-party card endpoint' },
        { cause: 'Outdated webhook signature secrets', confidence: 'Medium', reasoning: 'Previous deployment updated secret rotation configs' }
      ],
      recommendedActions: [
        { title: 'Check payment API logs & latency graphs', explanation: 'Analyze APM spans on /api/v1/charge', priority: 'P1', team: 'Backend Team' },
        { title: 'Engage gateway vendor support NOC', explanation: 'Verify whether upstream provider is experiencing regional fiber degradation', priority: 'P1', team: 'IT Ops' }
      ],
      similarIncidentKeywords: ['payment', 'timeout', 'checkout', '504 error'],
      reasoningSummary: 'Critical severity assigned due to direct financial impact and elevated error frequency.',
      confidence: 94
    },
    aiRecommendations: [
      { title: 'Inspect payment gateway upstream connectivity', explanation: 'Run traceroute and verify webhook response times from egress proxy', priority: 'P1', team: 'Backend' },
      { title: 'Failover traffic to secondary backup processor', explanation: 'Activate automated Adyen/PayPal fallback route in checkout configuration', priority: 'P1', team: 'Backend' }
    ],
    aiPossibleCauses: [
      { cause: 'Upstream gateway DNS resolution failure', confidence: 'High', reasoning: 'DNS cache TTL expired causing intermittent connection resets' },
      { cause: 'Egress NAT gateway port exhaustion', confidence: 'Medium', reasoning: 'Surge in concurrent shoppers during midday sale' }
    ]
  },
  {
    _id: 'inc-1002',
    incidentId: 'INC-1002',
    title: 'Customer Authentication Token Expiry Refresh Loop',
    description: 'Mobile iOS application users are getting kicked out repeatedly every 3 minutes. Token refresh endpoint returns 401 unauthorized due to clock skew.',
    category: 'Authentication',
    severity: 'High',
    priority: 'P2',
    department: 'IT',
    affectedUsers: 95,
    service: 'Auth0 / SSO Gateway',
    environment: 'Production',
    source: 'Customer Report',
    status: 'Investigating',
    assignedTeam: 'Identity & Access Team',
    assignedUser: INITIAL_USERS[2],
    createdBy: INITIAL_USERS[3],
    humanVerified: true,
    aiConfidence: 89,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    aiAnalysis: {
      category: 'Authentication',
      severity: 'High',
      priority: 'P2',
      department: 'IT',
      impact: 'Mobile customer session drops requiring repetitive logins',
      affectedUsersEstimate: 95,
      summary: 'JWT verification middleware rejects valid refresh tokens due to UTC timestamp offset.',
      possibleCauses: [
        { cause: 'Server NTP time synchronization drift', confidence: 'High', reasoning: 'Auth server clocks drifted by 180 seconds' }
      ],
      recommendedActions: [
        { title: 'Resync NTP daemon on auth cluster', explanation: 'Execute chrony sync on auth-node-01 and auth-node-02', priority: 'P1', team: 'DevOps' }
      ],
      similarIncidentKeywords: ['auth', 'jwt', 'token', 'session'],
      reasoningSummary: 'High priority due to pervasive customer usability frustration.',
      confidence: 89
    }
  },
  {
    _id: 'inc-1003',
    incidentId: 'INC-1003',
    title: 'Database Read Replica Replication Lag Exceeding 90 Seconds',
    description: 'Analytics reporting queries and merchant dashboards are displaying stale data. Read replica lag reached 120 seconds.',
    category: 'Database',
    severity: 'Critical',
    priority: 'P1',
    department: 'IT',
    affectedUsers: 450,
    service: 'Postgres Aurora Cluster',
    environment: 'Production',
    source: 'System Alert',
    status: 'Monitoring',
    assignedTeam: 'Database Infrastructure',
    assignedUser: INITIAL_USERS[1],
    createdBy: INITIAL_USERS[0],
    humanVerified: true,
    aiConfidence: 96,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    _id: 'inc-1004',
    incidentId: 'INC-1004',
    title: 'Subscription Renewal Invoice Webhook Latency',
    description: 'Finance billing pipeline queue is delayed by 45 minutes for automated recurring SaaS enterprise renewals.',
    category: 'Finance',
    severity: 'Medium',
    priority: 'P3',
    department: 'Finance',
    affectedUsers: 35,
    service: 'Billing Worker Service',
    environment: 'Production',
    source: 'Support Ticket',
    status: 'Resolved',
    assignedTeam: 'Finance Systems',
    assignedUser: INITIAL_USERS[2],
    createdBy: INITIAL_USERS[3],
    resolvedBy: INITIAL_USERS[2],
    resolvedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    humanVerified: true,
    aiConfidence: 91,
    resolutionSummary: 'The billing worker redis queue was restarted and consumer concurrency increased from 4 to 12 threads. Backlogged invoices completed processing within 15 minutes.',
    rootCause: 'Redis message queue thread pool starvation caused by unindexed subscription lookup query.',
    preventiveAction: 'Added compound index on subscription schema and established CPU alarm thresholds.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'inc-1005',
    incidentId: 'INC-1005',
    title: 'Internal HR Payroll Portal 502 Bad Gateway',
    description: 'Employees accessing monthly paystubs encounter 502 Bad Gateway intermittent errors.',
    category: 'Human Resources',
    severity: 'Medium',
    priority: 'P3',
    department: 'HR',
    affectedUsers: 25,
    service: 'Workday HR Portal Proxy',
    environment: 'Internal',
    source: 'Employee Report',
    status: 'Resolved',
    assignedTeam: 'Internal IT Tools',
    assignedUser: INITIAL_USERS[2],
    createdBy: INITIAL_USERS[3],
    resolvedBy: INITIAL_USERS[0],
    resolvedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    humanVerified: true,
    aiConfidence: 87,
    resolutionSummary: 'Nginx reverse proxy buffer size was increased to accommodate large multipart payroll attachments.',
    rootCause: 'Nginx proxy buffer overflow on oversized payroll PDF downloads.',
    preventiveAction: 'Updated proxy_buffers directive and automated container rolling deployment.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    _id: 'inc-1006',
    incidentId: 'INC-1006',
    title: 'Worker Cluster Memory Saturation & Pod Eviction',
    description: 'Kubernetes worker nodes in region us-east-1 reached 94% memory utilization triggering intermittent worker pod restarts.',
    category: 'Infrastructure',
    severity: 'High',
    priority: 'P2',
    department: 'Operations',
    affectedUsers: 60,
    service: 'K8s Ingestion Cluster',
    environment: 'Production',
    source: 'Monitoring',
    status: 'Open',
    assignedTeam: 'DevOps / SRE',
    assignedUser: INITIAL_USERS[1],
    createdBy: INITIAL_USERS[0],
    humanVerified: true,
    aiConfidence: 93,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

export const INITIAL_TASKS = [
  {
    _id: 'task-1',
    title: 'Analyze Payment API SSL Handshake Logs',
    description: 'Filter Datadog and AWS CloudWatch traces for TLS negotiation aborted errors on /charge.',
    priority: 'P1',
    status: 'In Progress',
    department: 'IT',
    assignedUser: INITIAL_USERS[2],
    assignedTeam: 'Backend Team',
    incidentId: 'inc-1001',
    incidentCode: 'INC-1001',
    createdBy: INITIAL_USERS[1],
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'task-2',
    title: 'Engage Payment Gateway Escalation Engineer',
    description: 'Contact Stripe premium technical account manager to confirm regional node maintenance.',
    priority: 'P1',
    status: 'Pending',
    department: 'Finance',
    assignedUser: INITIAL_USERS[1],
    assignedTeam: 'IT / Finance',
    incidentId: 'inc-1001',
    incidentCode: 'INC-1001',
    createdBy: INITIAL_USERS[1],
    dueDate: new Date(Date.now() + 43200000).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'task-3',
    title: 'Chrony NTP Clock Synchronization Audit',
    description: 'Verify NTP drift across all auth microservices and re-seed system clock if > 1 sec.',
    priority: 'P2',
    status: 'Completed',
    department: 'IT',
    assignedUser: INITIAL_USERS[2],
    assignedTeam: 'Identity & Access Team',
    incidentId: 'inc-1002',
    incidentCode: 'INC-1002',
    createdBy: INITIAL_USERS[1],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'task-4',
    title: 'Scale K8s Node Pool Capacity',
    description: 'Increase maximum replica limits on memory-intensive ingestion workers to prevent OOM evictions.',
    priority: 'P2',
    status: 'Pending',
    department: 'Operations',
    assignedUser: INITIAL_USERS[2],
    assignedTeam: 'DevOps / SRE',
    incidentId: 'inc-1006',
    incidentCode: 'INC-1006',
    createdBy: INITIAL_USERS[0],
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

export const INITIAL_ACTIVITIES = [
  {
    _id: 'act-1',
    user: INITIAL_USERS[3],
    userName: INITIAL_USERS[3].name,
    action: 'Reported incident INC-1001 "Payment Gateway Connection Timeout"',
    incidentCode: 'INC-1001',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    _id: 'act-2',
    user: INITIAL_USERS[1],
    userName: INITIAL_USERS[1].name,
    action: 'Verified AI suggestions and assigned INC-1001 to Rahul Sharma (Engineer)',
    incidentCode: 'INC-1001',
    createdAt: new Date(Date.now() - 3600000 * 2.8).toISOString()
  },
  {
    _id: 'act-3',
    user: INITIAL_USERS[2],
    userName: INITIAL_USERS[2].name,
    action: 'Transitioned INC-1001 status from Open to In Progress',
    incidentCode: 'INC-1001',
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    _id: 'act-4',
    user: INITIAL_USERS[2],
    userName: INITIAL_USERS[2].name,
    action: 'Resolved incident INC-1004 "Subscription Renewal Invoice Webhook Latency"',
    incidentCode: 'INC-1004',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    _id: 'notif-1',
    title: 'CRITICAL: Incident INC-1001 Assigned',
    message: 'You have been assigned as lead engineer for Payment Gateway Connection Timeout.',
    type: 'critical',
    link: '/incidents/INC-1001',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'notif-2',
    title: 'High Priority Alert',
    message: 'Worker cluster memory saturation reported in Operations.',
    type: 'warning',
    link: '/incidents/INC-1006',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    _id: 'notif-3',
    title: 'Incident INC-1004 Resolved',
    message: 'Subscription Renewal Invoice Webhook Latency marked resolved by Rahul Sharma.',
    type: 'success',
    link: '/incidents/INC-1004',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

// Helper to access LocalStorage safely
const getStored = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
};

// In-Memory / LocalStorage State Store
export const getIncidents = () => getStored(STORAGE_KEY_INCIDENTS, INITIAL_INCIDENTS);
export const saveIncidents = (data) => setStored(STORAGE_KEY_INCIDENTS, data);

export const getTasks = () => getStored(STORAGE_KEY_TASKS, INITIAL_TASKS);
export const saveTasks = (data) => setStored(STORAGE_KEY_TASKS, data);

export const getUsers = () => getStored(STORAGE_KEY_USERS, INITIAL_USERS);
export const saveUsers = (data) => setStored(STORAGE_KEY_USERS, data);

export const getDepartments = () => getStored(STORAGE_KEY_DEPTS, INITIAL_DEPARTMENTS);
export const saveDepartments = (data) => setStored(STORAGE_KEY_DEPTS, data);

export const getActivities = () => getStored(STORAGE_KEY_ACTIVITIES, INITIAL_ACTIVITIES);
export const saveActivities = (data) => setStored(STORAGE_KEY_ACTIVITIES, data);

/**
 * Intelligent AI Draft Triage Heuristic Engine (matches backend Gemini fallback)
 */
export const runLocalAiTriage = ({ title = '', description = '', affectedUsers = 0, department = '' }) => {
  const text = `${title} ${description}`.toLowerCase();
  const affected = Number(affectedUsers) || 0;

  let category = 'Infrastructure';
  let severity = 'Medium';
  let priority = 'P3';
  let dept = department || 'IT';
  let impact = 'Moderate business operational friction';
  let confidence = 92;

  if (text.includes('payment') || text.includes('gateway') || text.includes('checkout') || text.includes('billing') || text.includes('card') || text.includes('stripe')) {
    category = 'Payment';
    dept = 'IT / Finance';
    severity = affected > 50 || text.includes('fail') || text.includes('error') || text.includes('timeout') ? 'Critical' : 'High';
    priority = severity === 'Critical' ? 'P1' : 'P2';
    impact = 'Direct checkout blockage, customer revenue loss, and transaction failure';
    confidence = 96;
  } else if (text.includes('auth') || text.includes('login') || text.includes('token') || text.includes('session') || text.includes('password') || text.includes('sso')) {
    category = 'Authentication';
    dept = 'IT';
    severity = affected > 80 || text.includes('loop') || text.includes('all') ? 'High' : 'Medium';
    priority = severity === 'High' ? 'P2' : 'P3';
    impact = 'Customer authentication failures and repetitive credential rejection';
    confidence = 91;
  } else if (text.includes('database') || text.includes('mongo') || text.includes('postgres') || text.includes('sql') || text.includes('replica') || text.includes('latency')) {
    category = 'Database';
    dept = 'IT';
    severity = affected > 100 ? 'Critical' : 'High';
    priority = severity === 'Critical' ? 'P1' : 'P2';
    impact = 'Read query latency spike causing downstream dashboard and portal delays';
    confidence = 94;
  } else if (text.includes('k8s') || text.includes('memory') || text.includes('cpu') || text.includes('cluster') || text.includes('worker') || text.includes('oom')) {
    category = 'Infrastructure';
    dept = 'Operations';
    severity = 'High';
    priority = 'P2';
    impact = 'Worker node resource saturation threatening container stability';
    confidence = 89;
  }

  return {
    category,
    severity,
    priority,
    department: dept,
    impact,
    affectedUsersEstimate: affected || 75,
    summary: `AI Diagnostic: Incident detected with ${severity} severity in ${category} domain (${dept}). Recommended immediate mitigation review.`,
    possibleCauses: [
      {
        cause: `Upstream ${category} service latency degradation or gateway timeout`,
        confidence: 'High',
        reasoning: `Analysis of incident telemetry indicates symptoms consistent with connection pool exhaustion or proxy timeout.`
      },
      {
        cause: 'Network routing configuration drift or TLS renegotiation failure',
        confidence: 'Medium',
        reasoning: 'Correlated with recent platform cluster deployments.'
      }
    ],
    recommendedActions: [
      {
        title: `Verify ${category} APM traces and latency distribution`,
        explanation: 'Inspect trace spans to pinpoint bottleneck microservice.',
        priority: priority === 'P1' ? 'P1' : 'P2',
        team: `${dept} Team`
      },
      {
        title: 'Activate secondary failover routing',
        explanation: 'Route critical traffic to backup gateway to protect user experience.',
        priority: 'P2',
        team: 'DevOps / SRE'
      }
    ],
    similarIncidentKeywords: [category.toLowerCase(), 'timeout', 'latency', 'gateway'],
    reasoningSummary: `Classified as ${severity} (${priority}) on evidence of ${impact}. Human operator review advised before closing.`,
    confidence
  };
};

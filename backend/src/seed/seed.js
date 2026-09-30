const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Incident = require('../models/Incident');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { connectDB } = require('../config/db');

const seedData = async () => {
  console.log('[Seed] Seeding database with realistic enterprise mock dataset...');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Incident.deleteMany({}),
    Task.deleteMany({}),
    Activity.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const admin = await User.create({
    name: 'Sarah Connor (Admin)',
    email: 'admin@example.com',
    passwordHash,
    role: 'ADMIN',
    department: 'IT',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  });

  const manager = await User.create({
    name: 'Marcus Vance (Manager)',
    email: 'manager@example.com',
    passwordHash,
    role: 'MANAGER',
    department: 'IT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });

  const engineer = await User.create({
    name: 'Rahul Sharma (Engineer)',
    email: 'engineer@example.com',
    passwordHash,
    role: 'ENGINEER',
    department: 'IT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  });

  const employee = await User.create({
    name: 'Elena Rostova (Employee)',
    email: 'employee@example.com',
    passwordHash,
    role: 'EMPLOYEE',
    department: 'Customer Support',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  console.log('[Seed] Created default enterprise users.');

  // 2. Create Departments
  const departmentsData = [
    { name: 'IT', description: 'Core infrastructure, site reliability, backend services and cloud devops.' },
    { name: 'Finance', description: 'Payment rails, payroll accounting, billing gateways, and financial audits.' },
    { name: 'Operations', description: 'Day-to-day corporate logistics, vendor pipelines, and monitoring.' },
    { name: 'HR', description: 'Personnel systems, employee benefits, internal communications, onboarding.' },
    { name: 'Sales', description: 'CRM systems, quote generators, enterprise sales channels.' },
    { name: 'Customer Support', description: 'Tier-1 customer escalations, helpdesk systems, and live chat queues.' },
    { name: 'Security', description: 'Identity management, threat detection, penetration testing, and compliance.' },
  ];

  await Department.insertMany(
    departmentsData.map((d) => ({
      ...d,
      members: [admin._id, manager._id, engineer._id, employee._id],
    }))
  );

  console.log('[Seed] Created departments.');

  // 3. Create Realistic Incidents
  const inc1 = await Incident.create({
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
    assignedUser: engineer._id,
    createdBy: employee._id,
    humanVerified: true,
    aiConfidence: 94,
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
  });

  const inc2 = await Incident.create({
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
    assignedUser: engineer._id,
    createdBy: employee._id,
    humanVerified: true,
    aiConfidence: 89,
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
  });

  const inc3 = await Incident.create({
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
    assignedUser: manager._id,
    createdBy: admin._id,
    humanVerified: true,
    aiConfidence: 96,
  });

  const inc4 = await Incident.create({
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
    assignedUser: engineer._id,
    createdBy: employee._id,
    resolvedBy: engineer._id,
    resolvedAt: new Date(Date.now() - 3600000 * 4),
    humanVerified: true,
    aiConfidence: 91,
    resolutionSummary: 'The billing worker redis queue was restarted and consumer concurrency increased from 4 to 12 threads. Backlogged invoices completed processing within 15 minutes.',
    rootCause: 'Redis message queue thread pool starvation caused by unindexed subscription lookup query.',
    preventiveAction: 'Added compound index on subscription schema and established CPU alarm thresholds.'
  });

  const inc5 = await Incident.create({
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
    assignedUser: engineer._id,
    createdBy: employee._id,
    resolvedBy: admin._id,
    resolvedAt: new Date(Date.now() - 3600000 * 18),
    humanVerified: true,
    aiConfidence: 87,
    resolutionSummary: 'Nginx reverse proxy buffer size was increased to accommodate large multipart payroll attachments.',
    rootCause: 'Nginx proxy buffer overflow on oversized payroll PDF downloads.',
    preventiveAction: 'Updated proxy_buffers directive and automated container rolling deployment.'
  });

  const inc6 = await Incident.create({
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
    assignedUser: manager._id,
    createdBy: admin._id,
    humanVerified: true,
    aiConfidence: 93,
  });

  console.log('[Seed] Created sample enterprise incidents.');

  // 4. Create Sample Tasks
  await Task.create([
    {
      title: 'Analyze Payment API SSL Handshake Logs',
      description: 'Filter Datadog and AWS CloudWatch traces for TLS negotiation aborted errors on /charge.',
      priority: 'P1',
      status: 'In Progress',
      department: 'IT',
      assignedUser: engineer._id,
      assignedTeam: 'Backend Team',
      incidentId: inc1._id,
      incidentCode: 'INC-1001',
      createdBy: manager._id,
      dueDate: new Date(Date.now() + 86400000),
    },
    {
      title: 'Engage Payment Gateway Escalation Engineer',
      description: 'Contact Stripe premium technical account manager to confirm regional node maintenance.',
      priority: 'P1',
      status: 'Pending',
      department: 'Finance',
      assignedUser: manager._id,
      assignedTeam: 'IT / Finance',
      incidentId: inc1._id,
      incidentCode: 'INC-1001',
      createdBy: manager._id,
      dueDate: new Date(Date.now() + 43200000),
    },
    {
      title: 'Chrony NTP Clock Synchronization Audit',
      description: 'Verify NTP drift across all auth microservices and re-seed system clock if > 1 sec.',
      priority: 'P2',
      status: 'Completed',
      department: 'IT',
      assignedUser: engineer._id,
      assignedTeam: 'Identity & Access Team',
      incidentId: inc2._id,
      incidentCode: 'INC-1002',
      createdBy: manager._id,
    },
    {
      title: 'Scale K8s Node Pool Capacity',
      description: 'Increase maximum replica limits on memory-intensive ingestion workers to prevent OOM evictions.',
      priority: 'P2',
      status: 'Pending',
      department: 'Operations',
      assignedUser: engineer._id,
      assignedTeam: 'DevOps / SRE',
      incidentId: inc6._id,
      incidentCode: 'INC-1006',
      createdBy: admin._id,
      dueDate: new Date(Date.now() + 86400000 * 2),
    },
  ]);

  console.log('[Seed] Created sample incident tasks.');

  // 5. Create Activity History
  await Activity.create([
    {
      user: employee._id,
      userName: employee.name,
      action: 'Reported incident INC-1001 "Payment Gateway Connection Timeout"',
      incident: inc1._id,
      incidentCode: 'INC-1001',
      metadata: { severity: 'Critical', priority: 'P1' },
      createdAt: new Date(Date.now() - 3600000 * 3),
    },
    {
      user: manager._id,
      userName: manager.name,
      action: 'Verified AI suggestions and assigned INC-1001 to Rahul Sharma (Engineer)',
      incident: inc1._id,
      incidentCode: 'INC-1001',
      createdAt: new Date(Date.now() - 3600000 * 2.8),
    },
    {
      user: engineer._id,
      userName: engineer.name,
      action: 'Transitioned INC-1001 status from Open to In Progress',
      incident: inc1._id,
      incidentCode: 'INC-1001',
      createdAt: new Date(Date.now() - 3600000 * 2.5),
    },
    {
      user: engineer._id,
      userName: engineer.name,
      action: 'Resolved incident INC-1004 "Subscription Renewal Invoice Webhook Latency"',
      incident: inc4._id,
      incidentCode: 'INC-1004',
      metadata: { rootCause: 'Redis thread starvation' },
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
  ]);

  // 6. Create Notifications
  await Notification.create([
    {
      user: engineer._id,
      title: 'CRITICAL: Incident INC-1001 Assigned',
      message: 'You have been assigned as lead engineer for Payment Gateway Connection Timeout.',
      type: 'critical',
      link: '/incidents/INC-1001',
      read: false,
    },
    {
      user: manager._id,
      title: 'High Priority Alert',
      message: 'Worker cluster memory saturation reported in Operations.',
      type: 'warning',
      link: '/incidents/INC-1006',
      read: false,
    },
    {
      user: employee._id,
      title: 'Incident INC-1004 Resolved',
      message: 'Subscription Renewal Invoice Webhook Latency marked resolved by Rahul Sharma.',
      type: 'success',
      link: '/incidents/INC-1004',
      read: true,
    },
  ]);

  console.log('[Seed] Database successfully populated with realistic enterprise seed data!');
};

// If run directly via `node seed.js`
if (require.main === module) {
  require('dotenv').config();
  (async () => {
    try {
      await connectDB();
      await seedData();
      process.exit(0);
    } catch (e) {
      console.error('[Seed Error]', e);
      process.exit(1);
    }
  })();
}

module.exports = seedData;

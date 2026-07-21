require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Lead = require('./models/Lead');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_db';

const leadData = [
  { name: 'James Mitchell', email: 'james.mitchell@techcorp.com', phone: '+1 (555) 234-5678', company: 'TechCorp Solutions', source: 'Website', status: 'New', priority: 'High', message: 'Interested in your enterprise CRM package.' },
  { name: 'Sarah Chen', email: 'sarah.chen@innovatech.io', phone: '+1 (555) 345-6789', company: 'InnovaTech', source: 'Referral', status: 'Contacted', priority: 'High', message: 'Referred by David Park. Needs CRM for 50 users.' },
  { name: 'Michael Rodriguez', email: 'm.rodriguez@nexusdigital.com', phone: '+1 (555) 456-7890', company: 'Nexus Digital', source: 'Social Media', status: 'Qualified', priority: 'Medium', message: 'Looking to replace Salesforce. Budget approved.' },
  { name: 'Emily Thompson', email: 'emily.t@brightwave.co', phone: '+1 (555) 567-8901', company: 'BrightWave Co', source: 'Email Campaign', status: 'Converted', priority: 'High', message: 'Ready to purchase. Need onboarding ASAP.' },
  { name: 'David Kim', email: 'dkim@alphaventures.com', phone: '+1 (555) 678-9012', company: 'Alpha Ventures', source: 'Website', status: 'New', priority: 'Low', message: 'Just exploring options for our startup.' },
  { name: 'Jessica Martinez', email: 'jessica@globalmarketing.net', phone: '+1 (555) 789-0123', company: 'Global Marketing Inc', source: 'Trade Show', status: 'Contacted', priority: 'Medium', message: 'Met at SaaS Summit. Interested in marketing CRM.' },
  { name: 'Robert Anderson', email: 'r.anderson@vertexsystems.com', phone: '+1 (555) 890-1234', company: 'Vertex Systems', source: 'Referral', status: 'Qualified', priority: 'High', message: 'IT decision maker. Evaluating Q4 purchase.' },
  { name: 'Amanda Wilson', email: 'awilson@cloudpeak.io', phone: '+1 (555) 901-2345', company: 'CloudPeak Technologies', source: 'Website', status: 'New', priority: 'Medium', message: 'Requested demo of lead tracking features.' },
  { name: 'Christopher Lee', email: 'chris.lee@fusionlabs.com', phone: '+1 (555) 012-3456', company: 'Fusion Labs', source: 'Phone Call', status: 'Converted', priority: 'High', message: 'Called directly. Very interested, deal closed.' },
  { name: 'Nicole Davis', email: 'ndavis@primeestates.com', phone: '+1 (555) 123-4567', company: 'Prime Estates Realty', source: 'Social Media', status: 'Closed', priority: 'Low', message: 'Budget constraints. Will revisit next quarter.' },
  { name: 'Brandon Taylor', email: 'brandon@scalestartup.com', phone: '+1 (555) 234-5679', company: 'Scale Startup', source: 'Website', status: 'New', priority: 'Medium', message: 'Early stage startup. Looking for affordable CRM.' },
  { name: 'Stephanie Moore', email: 'steph.moore@digitalcraft.agency', phone: '+1 (555) 345-6780', company: 'DigitalCraft Agency', source: 'Referral', status: 'Contacted', priority: 'High', message: 'Agency managing 20 client accounts. Needs multi-client CRM.' },
  { name: 'Kevin Jackson', email: 'k.jackson@horizonsoftware.net', phone: '+1 (555) 456-7891', company: 'Horizon Software', source: 'Email Campaign', status: 'Qualified', priority: 'High', message: 'In final evaluation stage. Comparing 3 vendors.' },
  { name: 'Laura White', email: 'laura@sunriseconsulting.com', phone: '+1 (555) 567-8902', company: 'Sunrise Consulting', source: 'Trade Show', status: 'New', priority: 'Low', message: 'Consulting firm. Interested in client management features.' },
  { name: 'Daniel Harris', email: 'dharris@quantumretail.com', phone: '+1 (555) 678-9013', company: 'Quantum Retail', source: 'Website', status: 'Converted', priority: 'High', message: 'Retail chain with 15 locations. Needs CRM integration.' },
  { name: 'Megan Clark', email: 'megan.clark@agileworks.io', phone: '+1 (555) 789-0124', company: 'AgileWorks', source: 'Social Media', status: 'Contacted', priority: 'Medium', message: 'Agile consultancy. Found us on LinkedIn.' },
  { name: 'Tyler Lewis', email: 'tyler@blueprintmedia.com', phone: '+1 (555) 890-1235', company: 'Blueprint Media', source: 'Website', status: 'New', priority: 'Low', message: 'Media company exploring CRM options.' },
  { name: 'Ashley Robinson', email: 'ashley@pinnacleservices.com', phone: '+1 (555) 901-2346', company: 'Pinnacle Services', source: 'Referral', status: 'Qualified', priority: 'Medium', message: 'Referred by existing customer. Needs demo.' },
  { name: 'Joshua Walker', email: 'j.walker@dynamictech.co', phone: '+1 (555) 012-3457', company: 'DynamicTech Co', source: 'Phone Call', status: 'Closed', priority: 'Low', message: 'Lost to competitor on pricing. Follow up in 6 months.' },
  { name: 'Brittany Hall', email: 'bhall@elitefinancial.com', phone: '+1 (555) 123-4568', company: 'Elite Financial Group', source: 'Email Campaign', status: 'Contacted', priority: 'High', message: 'Finance firm. Very security-conscious, needs compliance info.' },
  { name: 'Nathan Young', email: 'nathan.young@vortexinc.com', phone: '+1 (555) 234-5680', company: 'Vortex Inc', source: 'Website', status: 'New', priority: 'Medium', message: 'Manufacturing company. Needs B2B lead tracking.' },
  { name: 'Samantha Allen', email: 'samantha@ecosmart.green', phone: '+1 (555) 345-6781', company: 'EcoSmart Solutions', source: 'Trade Show', status: 'Qualified', priority: 'High', message: 'Sustainability company. Great potential deal.' },
  { name: 'Justin Scott', email: 'j.scott@novabuild.com', phone: '+1 (555) 456-7892', company: 'NovaBuild Construction', source: 'Referral', status: 'New', priority: 'Low', message: 'Construction company. Basic CRM needs.' },
  { name: 'Rachel Green', email: 'rachel.green@sparkmarketing.com', phone: '+1 (555) 567-8903', company: 'Spark Marketing', source: 'Social Media', status: 'Converted', priority: 'High', message: 'Marketing agency. Signed annual contract.' },
  { name: 'Aaron Baker', email: 'aaron@cloudstream.io', phone: '+1 (555) 678-9014', company: 'CloudStream', source: 'Website', status: 'Contacted', priority: 'Medium', message: 'SaaS company. Looking to manage partner leads.' },
  { name: 'Heather Carter', email: 'heather.carter@titanlogistics.com', phone: '+1 (555) 789-0125', company: 'Titan Logistics', source: 'Email Campaign', status: 'New', priority: 'High', message: 'Logistics company with national presence.' },
  { name: 'Zachary Mitchell', email: 'zach@netflowagency.com', phone: '+1 (555) 890-1236', company: 'Netflow Agency', source: 'Referral', status: 'Qualified', priority: 'Medium', message: 'Digital agency. Needs white-label CRM.' },
  { name: 'Kayla Rivera', email: 'kayla.rivera@trendsetters.co', phone: '+1 (555) 901-2347', company: 'Trendsetters Co', source: 'Social Media', status: 'Closed', priority: 'Low', message: 'E-commerce startup. Decided to build in-house.' },
  { name: 'Ryan Phillips', email: 'ryan@apexstrategies.com', phone: '+1 (555) 012-3458', company: 'Apex Strategies', source: 'Phone Call', status: 'New', priority: 'High', message: 'Strategic consulting. High priority prospect.' },
  { name: 'Hannah Evans', email: 'hannah.evans@meridianhealth.com', phone: '+1 (555) 123-4569', company: 'Meridian Health', source: 'Website', status: 'Contacted', priority: 'High', message: 'Healthcare company. HIPAA compliance required.' },
];

const noteTemplates = [
  'Initial contact made. Lead seems genuinely interested.',
  'Sent product brochure and pricing information via email.',
  'Had a 30-minute discovery call. Great fit for our solution.',
  'Scheduled demo for next week. Decision maker will attend.',
  'Followed up via email. No response yet.',
  'Spoke with technical team. They have specific API requirements.',
  'Sent proposal. Awaiting board approval.',
  'Lead requested custom pricing for enterprise tier.',
  'Introduced to our solutions consultant.',
  'Positive feedback on demo. Moving to next stage.',
];

const followUpTemplates = [
  { description: 'Follow up on proposal sent last week', reminder: true },
  { description: 'Schedule product demo with technical team', reminder: true },
  { description: 'Check in after trial period ends', reminder: false },
  { description: 'Send case studies and ROI analysis', reminder: false },
  { description: 'Call to discuss contract terms', reminder: true },
];

async function seed() {
  try {
    console.log('\x1b[36m🌱 Starting CRM seed...\x1b[0m');
    await mongoose.connect(MONGODB_URI);
    console.log('\x1b[32m✓ Connected to MongoDB\x1b[0m');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('\x1b[33m⚠ Cleared existing data\x1b[0m');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@crm.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`\x1b[32m✓ Created admin: ${admin.email}\x1b[0m`);

    // Create leads with varied timestamps
    const now = new Date();
    const leadsToCreate = leadData.map((lead, index) => {
      // Spread leads over last 12 months
      const monthsAgo = Math.floor(index / 2.5);
      const daysAgo = Math.floor(Math.random() * 28);
      const createdAt = new Date(now);
      createdAt.setMonth(createdAt.getMonth() - monthsAgo);
      createdAt.setDate(createdAt.getDate() - daysAgo);

      // Add 2-3 notes per lead
      const noteCount = 2 + Math.floor(Math.random() * 2);
      const notes = Array.from({ length: noteCount }, (_, ni) => ({
        content: noteTemplates[(index + ni) % noteTemplates.length],
        createdBy: 'Admin',
        createdAt: new Date(createdAt.getTime() + ni * 86400000),
      }));

      // Add 1-2 follow-ups per lead
      const followUpCount = 1 + Math.floor(Math.random() * 2);
      const followUps = Array.from({ length: followUpCount }, (_, fi) => {
        const template = followUpTemplates[(index + fi) % followUpTemplates.length];
        const futureDate = new Date(createdAt.getTime() + (fi + 1) * 7 * 86400000);
        return {
          date: futureDate,
          description: template.description,
          reminder: template.reminder,
          completed: lead.status === 'Converted' || lead.status === 'Closed',
        };
      });

      return { ...lead, createdAt, updatedAt: createdAt, notes, followUps };
    });

    const leads = await Lead.insertMany(leadsToCreate);
    console.log(`\x1b[32m✓ Created ${leads.length} leads\x1b[0m`);

    // Summary
    const statuses = {};
    leads.forEach((l) => {
      statuses[l.status] = (statuses[l.status] || 0) + 1;
    });
    console.log('\x1b[36m📊 Lead Status Summary:\x1b[0m');
    Object.entries(statuses).forEach(([s, c]) => {
      console.log(`   ${s}: ${c}`);
    });

    console.log('\n\x1b[32m✅ Seed completed successfully!\x1b[0m');
    console.log('\x1b[36m🔑 Admin login: admin@crm.com / admin123\x1b[0m\n');

    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m✗ Seed failed:', error.message, '\x1b[0m');
    process.exit(1);
  }
}

seed();

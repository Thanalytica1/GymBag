// Enhanced Onboarding System for Personal Trainers
let currentStep = 1;
const totalSteps = 10; // Expanded from 5 to 10 steps
let onboardingData = {
    userType: 'trainer',
    businessContext: {
        experienceLevel: null,
        currentClientLoad: null,
        primaryLocation: null,
        businessStage: null,
        biggestChallenge: null
    },
    financialSetup: {
        currentMonthlyRevenue: null,
        revenueGoal: null,
        sessionPricing: null,
        packageTypes: [],
        paymentMethods: []
    },
    clientDemographics: {
        ageGroups: [],
        clientGoals: [],
        fitnessLevels: [],
        sessionFormats: [],
        specializations: []
    },
    marketing: {
        currentMarketing: [],
        socialMediaPresence: null,
        leadGenGoals: null,
        marketingBudget: null,
        contentCreation: null
    },
    operations: {
        schedulingTools: [],
        clientManagement: null,
        automationLevel: null,
        workingHours: null
    },
    growthStrategy: {
        expansionPlans: [],
        partnerships: [],
        onlinePresence: null,
        referralSystem: null
    },
    preferences: {
        theme: 'light',
        notifications: 'all',
        reports: 'enabled',
        coachingStyle: null,
        communicationPreference: null
    },
    profile: {
        bio: '',
        phone: '',
        specialties: [],
        certifications: [],
        yearsInBusiness: null,
        successStories: []
    },
    goals: [],
    quickWins: [],
    personalizedTasks: []
};

// Business Intelligence Module
const businessInsights = {
    'just-starting_0-5': {
        insight: "Focus on foundation! 73% of successful trainers prioritize client acquisition in their first year.",
        benchmarks: {
            avgClients: 8,
            avgRevenue: '$2,500/month',
            growthRate: '15-20% monthly'
        },
        priorities: ['Client acquisition', 'Service definition', 'Pricing strategy'],
        tasks: [
            'Network with 3 potential referral sources weekly',
            'Create client intake process',
            'Define your unique training methodology',
            'Set up basic business systems'
        ],
        tips: "Start with friends/family for testimonials and referrals. Focus on exceptional service to build word-of-mouth."
    },
    '1-2years_6-15': {
        insight: "You're building momentum! This is when most trainers establish their reputation.",
        benchmarks: {
            avgClients: 15,
            avgRevenue: '$5,000/month',
            growthRate: '10-15% monthly'
        },
        priorities: ['Client retention', 'Service optimization', 'Marketing consistency'],
        tasks: [
            'Implement client retention program',
            'Develop signature programs',
            'Establish consistent marketing routine',
            'Track client success metrics'
        ],
        tips: "Focus on client success stories and case studies to attract similar clients."
    },
    '3-5years_16-30': {
        insight: "You're in scaling territory! Consider group training or online programs to leverage your time.",
        benchmarks: {
            avgClients: 25,
            avgRevenue: '$10,000/month',
            growthRate: '5-10% monthly'
        },
        priorities: ['Time leverage', 'Premium services', 'Team building'],
        tasks: [
            'Evaluate group training opportunities',
            'Analyze client lifetime value',
            'Consider hiring assistant trainers',
            'Develop premium service tiers'
        ],
        tips: "Top trainers at your level focus on retention over acquisition. Consider raising rates."
    },
    '5+years_30+': {
        insight: "You're a veteran! Time to maximize profitability and consider business expansion.",
        benchmarks: {
            avgClients: 40,
            avgRevenue: '$20,000+/month',
            growthRate: '3-5% monthly'
        },
        priorities: ['Business systems', 'Passive income', 'Legacy building'],
        tasks: [
            'Create scalable training programs',
            'Build team of trainers',
            'Develop online courses',
            'Establish mentorship programs'
        ],
        tips: "Focus on high-margin services and building systems that work without you."
    }
};

// Market Benchmarks Database
const marketBenchmarks = {
    pricing: {
        'commercial-gym': { low: 40, avg: 65, high: 100 },
        'home-studio': { low: 50, avg: 80, high: 150 },
        'client-homes': { low: 60, avg: 90, high: 175 },
        'outdoor': { low: 35, avg: 55, high: 85 },
        'virtual': { low: 30, avg: 50, high: 75 }
    },
    clientLoad: {
        'just-starting': { low: 2, avg: 5, high: 10 },
        '1-2years': { low: 8, avg: 15, high: 25 },
        '3-5years': { low: 15, avg: 25, high: 40 },
        '5+years': { low: 20, avg: 35, high: 60 }
    },
    revenue: {
        'just-starting': { low: 1000, avg: 2500, high: 4000 },
        '1-2years': { low: 3000, avg: 5000, high: 8000 },
        '3-5years': { low: 6000, avg: 10000, high: 15000 },
        '5+years': { low: 10000, avg: 20000, high: 50000 }
    }
};

// Quick Wins Identification System
function identifyQuickWins(profile) {
    const opportunities = [];
    
    // Pricing opportunities
    const marketRate = marketBenchmarks.pricing[profile.primaryLocation]?.avg || 65;
    const currentRate = parseSessionPrice(profile.sessionPricing);
    
    if (currentRate < marketRate * 0.8) {
        opportunities.push({
            type: 'pricing',
            impact: 'High',
            effort: 'Low',
            timeframe: 'Immediate',
            description: `Increase rates by $${Math.round(marketRate - currentRate)}/session`,
            potentialIncrease: `$${Math.round((marketRate - currentRate) * profile.currentClientLoad * 4)}/month`,
            implementation: 'Send rate increase notice with 30-day advance',
            priority: 1
        });
    }
    
    // Social media opportunities
    if (profile.socialMediaPresence === 'minimal' || profile.socialMediaPresence === 'none') {
        opportunities.push({
            type: 'marketing',
            impact: 'Medium',
            effort: 'Low',
            timeframe: '30 days',
            description: 'Establish consistent social media presence',
            potentialIncrease: '2-4 new clients/month',
            implementation: 'Post 3x/week with client transformations',
            priority: 2
        });
    }
    
    // Group training opportunities
    if (profile.currentClientLoad > 15 && !profile.sessionFormats.includes('small-groups')) {
        opportunities.push({
            type: 'service-expansion',
            impact: 'High',
            effort: 'Medium',
            timeframe: '60 days',
            description: 'Launch small group training sessions',
            potentialIncrease: `$${Math.round(currentRate * 0.7 * 3 * 8)}/month per group`,
            implementation: 'Start with 2 groups of 3-4 clients',
            priority: 3
        });
    }
    
    // Referral program
    if (!profile.referralSystem || profile.referralSystem === 'none') {
        opportunities.push({
            type: 'growth',
            impact: 'Medium',
            effort: 'Low',
            timeframe: '14 days',
            description: 'Implement formal referral program',
            potentialIncrease: '1-3 new clients/month',
            implementation: 'Offer free session for successful referrals',
            priority: 4
        });
    }
    
    // Package optimization
    if (!profile.packageTypes.includes('monthly') && !profile.packageTypes.includes('quarterly')) {
        opportunities.push({
            type: 'revenue',
            impact: 'High',
            effort: 'Low',
            timeframe: '7 days',
            description: 'Introduce package deals',
            potentialIncrease: 'Improve cash flow and retention',
            implementation: 'Offer 10% discount for monthly packages',
            priority: 5
        });
    }
    
    return opportunities.sort((a, b) => a.priority - b.priority);
}

// Smart Task Generation Algorithm
function generatePersonalizedTasks(profile) {
    let tasks = [];
    
    // Foundation tasks based on business stage
    const stageTaskMap = {
        'planning': [
            { category: 'Setup', text: 'Register business entity', priority: 1 },
            { category: 'Legal', text: 'Get liability insurance', priority: 1 },
            { category: 'Finance', text: 'Open business bank account', priority: 2 },
            { category: 'Marketing', text: 'Create business cards', priority: 3 }
        ],
        'building': [
            { category: 'Acquisition', text: 'Network at 3 fitness events', priority: 1 },
            { category: 'Systems', text: 'Set up scheduling system', priority: 2 },
            { category: 'Content', text: 'Create before/after portfolio', priority: 3 },
            { category: 'Outreach', text: 'Partner with local businesses', priority: 4 }
        ],
        'growing': [
            { category: 'Retention', text: 'Implement client check-in system', priority: 1 },
            { category: 'Optimization', text: 'Analyze profit per client', priority: 2 },
            { category: 'Expansion', text: 'Develop new service offerings', priority: 3 },
            { category: 'Automation', text: 'Automate admin tasks', priority: 4 }
        ],
        'scaling': [
            { category: 'Team', text: 'Hire and train assistant trainer', priority: 1 },
            { category: 'Systems', text: 'Document all processes', priority: 2 },
            { category: 'Revenue', text: 'Launch online coaching program', priority: 3 },
            { category: 'Brand', text: 'Develop signature methodology', priority: 4 }
        ]
    };
    
    // Add stage-specific tasks
    if (stageTaskMap[profile.businessStage]) {
        tasks.push(...stageTaskMap[profile.businessStage]);
    }
    
    // Challenge-specific tasks
    const challengeTaskMap = {
        'finding-clients': [
            { category: 'Marketing', text: 'Create ideal client avatar', priority: 1 },
            { category: 'Outreach', text: 'Offer 5 free consultations', priority: 2 },
            { category: 'Social', text: 'Join 3 fitness Facebook groups', priority: 3 },
            { category: 'Content', text: 'Write weekly fitness tips blog', priority: 4 }
        ],
        'retaining-clients': [
            { category: 'Engagement', text: 'Send weekly check-in messages', priority: 1 },
            { category: 'Value', text: 'Create client workout app', priority: 2 },
            { category: 'Community', text: 'Host monthly client events', priority: 3 },
            { category: 'Results', text: 'Track and celebrate milestones', priority: 4 }
        ],
        'pricing': [
            { category: 'Research', text: 'Survey competitor pricing', priority: 1 },
            { category: 'Value', text: 'Document your unique value prop', priority: 2 },
            { category: 'Structure', text: 'Create tiered service packages', priority: 3 },
            { category: 'Communication', text: 'Practice price increase conversation', priority: 4 }
        ],
        'time-management': [
            { category: 'Efficiency', text: 'Batch similar client sessions', priority: 1 },
            { category: 'Automation', text: 'Set up automated scheduling', priority: 2 },
            { category: 'Boundaries', text: 'Define working hours clearly', priority: 3 },
            { category: 'Delegation', text: 'Outsource admin tasks', priority: 4 }
        ],
        'marketing': [
            { category: 'Strategy', text: 'Define target market clearly', priority: 1 },
            { category: 'Content', text: 'Create content calendar', priority: 2 },
            { category: 'Social', text: 'Post 3x weekly on Instagram', priority: 3 },
            { category: 'Partnerships', text: 'Partner with complementary businesses', priority: 4 }
        ],
        'admin': [
            { category: 'Systems', text: 'Implement CRM system', priority: 1 },
            { category: 'Templates', text: 'Create email templates', priority: 2 },
            { category: 'Automation', text: 'Automate invoice generation', priority: 3 },
            { category: 'Organization', text: 'Organize digital files system', priority: 4 }
        ]
    };
    
    // Add challenge-specific tasks
    if (challengeTaskMap[profile.biggestChallenge]) {
        tasks.push(...challengeTaskMap[profile.biggestChallenge]);
    }
    
    // Location-specific tasks
    if (profile.primaryLocation === 'virtual') {
        tasks.push(
            { category: 'Tech', text: 'Optimize video call setup', priority: 2 },
            { category: 'Platform', text: 'Master online training platform', priority: 1 },
            { category: 'Engagement', text: 'Create virtual accountability system', priority: 3 }
        );
    }
    
    // Revenue goal tasks
    const revenueGrowthTasks = calculateRevenueGrowthTasks(profile);
    tasks.push(...revenueGrowthTasks);
    
    // Sort and prioritize tasks
    return prioritizeTasks(tasks, profile);
}

// Helper Functions
function parseSessionPrice(priceRange) {
    if (!priceRange) return 50;
    const match = priceRange.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 50;
}

function calculateRevenueGrowthTasks(profile) {
    const tasks = [];
    const currentRevenue = parseRevenue(profile.currentMonthlyRevenue);
    const targetGrowth = profile.revenueGoal;
    
    if (targetGrowth === 'double') {
        tasks.push(
            { category: 'Revenue', text: `Add ${Math.ceil(currentRevenue / parseSessionPrice(profile.sessionPricing) / 4)} new clients`, priority: 1 },
            { category: 'Pricing', text: 'Increase rates by 20%', priority: 2 },
            { category: 'Service', text: 'Launch premium service tier', priority: 3 }
        );
    } else if (targetGrowth === '50%') {
        tasks.push(
            { category: 'Revenue', text: `Add ${Math.ceil(currentRevenue * 0.5 / parseSessionPrice(profile.sessionPricing) / 4)} new clients`, priority: 1 },
            { category: 'Retention', text: 'Reduce client churn by 25%', priority: 2 }
        );
    }
    
    return tasks;
}

function parseRevenue(revenueRange) {
    if (!revenueRange) return 2000;
    const match = revenueRange.match(/\$(\d+)K?/);
    if (match) {
        const value = parseInt(match[1]);
        return revenueRange.includes('K') ? value * 1000 : value;
    }
    return 2000;
}

function prioritizeTasks(tasks, profile) {
    // Remove duplicates
    const uniqueTasks = tasks.reduce((acc, task) => {
        const key = `${task.category}-${task.text}`;
        if (!acc.has(key)) {
            acc.set(key, task);
        }
        return acc;
    }, new Map());
    
    // Sort by priority
    return Array.from(uniqueTasks.values())
        .sort((a, b) => (a.priority || 999) - (b.priority || 999))
        .slice(0, 12); // Limit to 12 most important tasks
}

// Goal Quantification System
function generateSMARTGoals(profile) {
    const goals = [];
    const currentRevenue = parseRevenue(profile.currentMonthlyRevenue);
    const currentClients = parseClientLoad(profile.currentClientLoad);
    
    // Revenue goal
    if (profile.revenueGoal && profile.revenueGoal !== 'same') {
        const targetRevenue = calculateTargetRevenue(currentRevenue, profile.revenueGoal);
        goals.push({
            type: 'revenue',
            title: 'Revenue Growth Target',
            current: currentRevenue,
            target: targetRevenue,
            timeline: '6 months',
            milestones: generateMonthlyMilestones(currentRevenue, targetRevenue, 6),
            actions: [
                `Increase rates by $${Math.round((targetRevenue - currentRevenue) / currentClients / 4)}/session`,
                `Add ${Math.ceil((targetRevenue - currentRevenue) / parseSessionPrice(profile.sessionPricing) / 4)} new clients`,
                'Introduce premium packages'
            ],
            metrics: {
                weeklyTarget: Math.round((targetRevenue - currentRevenue) / 26),
                monthlyTarget: Math.round((targetRevenue - currentRevenue) / 6)
            }
        });
    }
    
    // Client acquisition goal
    if (profile.leadGenGoals) {
        const newClientsTarget = parseLeadGenGoal(profile.leadGenGoals);
        goals.push({
            type: 'acquisition',
            title: 'Client Acquisition Target',
            current: currentClients,
            target: currentClients + (newClientsTarget * 6),
            timeline: '6 months',
            milestones: generateMonthlyMilestones(currentClients, currentClients + (newClientsTarget * 6), 6),
            actions: [
                `Generate ${newClientsTarget * 2} leads per month`,
                `Convert 50% of consultations to clients`,
                `Network at ${Math.ceil(newClientsTarget / 2)} events monthly`
            ],
            metrics: {
                weeklyLeads: Math.ceil(newClientsTarget * 2 / 4),
                monthlyTarget: newClientsTarget
            }
        });
    }
    
    // Retention goal
    goals.push({
        type: 'retention',
        title: 'Client Retention Target',
        current: 75, // Assume 75% baseline
        target: 90,
        timeline: '3 months',
        milestones: [80, 85, 90],
        actions: [
            'Implement weekly check-ins',
            'Create client rewards program',
            'Track and celebrate client wins'
        ],
        metrics: {
            weeklyCheckIns: currentClients,
            monthlyReviews: Math.ceil(currentClients / 4)
        }
    });
    
    return goals;
}

function parseClientLoad(clientRange) {
    if (!clientRange) return 10;
    const match = clientRange.match(/(\d+)/);
    return match ? parseInt(match[1]) : 10;
}

function parseLeadGenGoal(goal) {
    if (!goal) return 3;
    const match = goal.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
}

function calculateTargetRevenue(current, goal) {
    switch(goal) {
        case 'double': return current * 2;
        case '50%': return current * 1.5;
        case 'custom': return current * 1.3; // Default 30% increase
        default: return current;
    }
}

function generateMonthlyMilestones(start, end, months) {
    const milestones = [];
    const increment = (end - start) / months;
    for (let i = 1; i <= months; i++) {
        milestones.push(Math.round(start + (increment * i)));
    }
    return milestones;
}

// Competitive Benchmarking System
function generateBenchmarkReport(profile) {
    const experience = profile.experienceLevel;
    const location = profile.primaryLocation;
    
    const benchmark = {
        yourProfile: {
            experience: experience,
            clients: parseClientLoad(profile.currentClientLoad),
            revenue: parseRevenue(profile.currentMonthlyRevenue),
            pricing: parseSessionPrice(profile.sessionPricing),
            location: location
        },
        marketAverage: {
            clients: marketBenchmarks.clientLoad[experience]?.avg || 15,
            revenue: marketBenchmarks.revenue[experience]?.avg || 5000,
            pricing: marketBenchmarks.pricing[location]?.avg || 65
        },
        topPerformers: {
            clients: marketBenchmarks.clientLoad[experience]?.high || 25,
            revenue: marketBenchmarks.revenue[experience]?.high || 10000,
            pricing: marketBenchmarks.pricing[location]?.high || 100
        },
        insights: [],
        opportunities: []
    };
    
    // Generate insights
    if (benchmark.yourProfile.pricing < benchmark.marketAverage.pricing) {
        benchmark.insights.push(`Your rates are ${Math.round((1 - benchmark.yourProfile.pricing / benchmark.marketAverage.pricing) * 100)}% below market average`);
        benchmark.opportunities.push('Consider gradual rate increases');
    }
    
    if (benchmark.yourProfile.clients < benchmark.marketAverage.clients) {
        benchmark.insights.push(`You have ${benchmark.marketAverage.clients - benchmark.yourProfile.clients} fewer clients than average`);
        benchmark.opportunities.push('Focus on client acquisition strategies');
    }
    
    if (benchmark.yourProfile.revenue > benchmark.marketAverage.revenue) {
        benchmark.insights.push(`You're earning ${Math.round((benchmark.yourProfile.revenue / benchmark.marketAverage.revenue - 1) * 100)}% above average!`);
    }
    
    return benchmark;
}

// UI Enhancement Functions
function showBusinessInsight(profile) {
    const key = `${profile.experienceLevel}_${profile.currentClientLoad}`;
    const insight = businessInsights[key] || businessInsights['just-starting_0-5'];
    
    return {
        mainInsight: insight.insight,
        benchmarks: insight.benchmarks,
        priorities: insight.priorities,
        actionItems: insight.tasks,
        tip: insight.tips,
        visualData: generateInsightVisuals(insight.benchmarks, profile)
    };
}

function generateInsightVisuals(benchmarks, profile) {
    return {
        revenueComparison: {
            yours: parseRevenue(profile.currentMonthlyRevenue),
            average: benchmarks.avgRevenue,
            percentDiff: Math.round((parseRevenue(profile.currentMonthlyRevenue) / parseFloat(benchmarks.avgRevenue.replace(/[\$,]/g, '')) - 1) * 100)
        },
        clientComparison: {
            yours: parseClientLoad(profile.currentClientLoad),
            average: benchmarks.avgClients,
            percentDiff: Math.round((parseClientLoad(profile.currentClientLoad) / benchmarks.avgClients - 1) * 100)
        },
        growthPotential: benchmarks.growthRate
    };
}

// Dynamic Step Management
function determineStepFlow(profile) {
    const steps = ['welcome', 'trainer-confirmation'];
    
    // Always include business assessment for trainers
    steps.push('business-assessment');
    
    // Add financial setup unless they're just planning
    if (profile.businessStage !== 'planning') {
        steps.push('financial-setup');
    }
    
    // Add client demographics
    steps.push('client-demographics');
    
    // Add marketing unless they have 30+ clients
    if (profile.currentClientLoad !== '30+') {
        steps.push('marketing-strategy');
    }
    
    // Add operations for established trainers
    if (profile.experienceLevel !== 'just-starting') {
        steps.push('operations-setup');
    }
    
    // Always include growth strategy
    steps.push('growth-planning');
    
    // Add goal setting
    steps.push('goal-quantification');
    
    // Add profile completion
    steps.push('profile-details');
    
    // Add review and insights
    steps.push('review-insights');
    
    return steps;
}

// 30-Day Success Plan Generator
function generate30DayPlan(profile) {
    const plan = {
        week1: {
            theme: 'Foundation & Quick Wins',
            tasks: [],
            focus: 'Establish systems and capture low-hanging fruit'
        },
        week2: {
            theme: 'Client Acquisition',
            tasks: [],
            focus: 'Implement lead generation strategies'
        },
        week3: {
            theme: 'Service Optimization',
            tasks: [],
            focus: 'Enhance service delivery and client experience'
        },
        week4: {
            theme: 'Growth Planning',
            tasks: [],
            focus: 'Analyze results and plan next phase'
        }
    };
    
    // Week 1: Foundation
    const quickWins = identifyQuickWins(profile);
    plan.week1.tasks = quickWins.slice(0, 3).map(win => ({
        task: win.description,
        impact: win.impact,
        implementation: win.implementation
    }));
    
    // Week 2: Client Acquisition
    if (profile.biggestChallenge === 'finding-clients' || profile.currentClientLoad.includes('0-5')) {
        plan.week2.tasks = [
            { task: 'Launch referral program', impact: 'High' },
            { task: 'Create 5 pieces of social content', impact: 'Medium' },
            { task: 'Network at 2 fitness events', impact: 'High' }
        ];
    } else {
        plan.week2.tasks = [
            { task: 'Optimize client onboarding', impact: 'Medium' },
            { task: 'Implement retention strategy', impact: 'High' },
            { task: 'Gather client testimonials', impact: 'Medium' }
        ];
    }
    
    // Week 3: Service Optimization
    plan.week3.tasks = [
        { task: 'Review and update pricing', impact: 'High' },
        { task: 'Create signature program', impact: 'Medium' },
        { task: 'Implement progress tracking system', impact: 'Medium' }
    ];
    
    // Week 4: Growth Planning
    plan.week4.tasks = [
        { task: 'Analyze month metrics', impact: 'High' },
        { task: 'Set next quarter goals', impact: 'High' },
        { task: 'Plan service expansion', impact: 'Medium' }
    ];
    
    return plan;
}

// Export all functions for use in main onboarding
export {
    businessInsights,
    marketBenchmarks,
    identifyQuickWins,
    generatePersonalizedTasks,
    generateSMARTGoals,
    generateBenchmarkReport,
    showBusinessInsight,
    determineStepFlow,
    generate30DayPlan
};
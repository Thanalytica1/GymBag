// Enhanced Onboarding Controller
import {
    businessInsights,
    marketBenchmarks,
    identifyQuickWins,
    generatePersonalizedTasks,
    generateSMARTGoals,
    generateBenchmarkReport,
    showBusinessInsight,
    determineStepFlow,
    generate30DayPlan
} from './enhanced-onboarding.js';

let currentStep = 1;
let totalSteps = 10;
let onboardingData = {
    userType: 'trainer',
    businessContext: {},
    financialSetup: {},
    clientDemographics: {},
    marketing: {},
    operations: {},
    growthStrategy: {},
    preferences: {
        theme: 'light',
        notifications: 'all',
        reports: 'enabled'
    },
    profile: {},
    goals: [],
    quickWins: [],
    personalizedTasks: [],
    benchmarks: {},
    thirtyDayPlan: {}
};

// Initialize onboarding
document.addEventListener('DOMContentLoaded', async () => {
    await initializeEnhancedOnboarding();
});

async function initializeEnhancedOnboarding() {
    try {
        // Check authentication
        if (typeof auth === 'undefined' || !auth) {
            console.error('Firebase auth not initialized');
            setTimeout(initializeEnhancedOnboarding, 100);
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'signin-page.html';
            return;
        }

        // Check if onboarding is already complete
        const userData = await getUserData();
        if (userData.success && userData.data.enhancedOnboardingComplete) {
            window.location.href = 'gymbag_dashboard.html';
            return;
        }

        setupEnhancedEventListeners();
        updateProgressBar();
        
    } catch (error) {
        console.error('Enhanced onboarding initialization error:', error);
        showError('Failed to initialize onboarding');
    }
}

function setupEnhancedEventListeners() {
    // Single select options
    document.querySelectorAll('.option-card:not(.multi-select)').forEach(option => {
        option.addEventListener('click', (e) => selectSingleOption(e.target.closest('.option-card')));
    });

    // Multi-select options
    document.querySelectorAll('.option-card.multi-select').forEach(option => {
        option.addEventListener('click', (e) => toggleMultiOption(e.target.closest('.option-card')));
    });

    // Text inputs
    document.getElementById('trainer-bio')?.addEventListener('input', updateProfileField);
    document.getElementById('trainer-phone')?.addEventListener('input', updateProfileField);
    document.getElementById('years-in-business')?.addEventListener('input', updateProfileField);
    document.getElementById('success-story')?.addEventListener('input', updateProfileField);
}

function selectSingleOption(option) {
    const field = option.dataset.field;
    const value = option.dataset.value;
    const section = getDataSection(field);
    
    // Clear previous selection in this group
    document.querySelectorAll(`[data-field="${field}"]`).forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select this option
    option.classList.add('selected');
    
    // Update data model
    if (section) {
        onboardingData[section][field] = value;
    }
    
    // Show real-time insights
    if (currentStep === 2) { // Business assessment step
        showLiveBusinessInsight();
    } else if (currentStep === 3) { // Financial step
        showRevenueCalculator();
    }
    
    // Enable next button if all required fields are filled
    validateCurrentStep();
}

function toggleMultiOption(option) {
    const field = option.dataset.field;
    const value = option.dataset.value;
    const section = getDataSection(field);
    
    // Check for limit
    if (option.classList.contains('limit-3')) {
        const selected = document.querySelectorAll(`[data-field="${field}"].selected`);
        if (!option.classList.contains('selected') && selected.length >= 3) {
            showToast('Please select only 3 options');
            return;
        }
    }
    
    // Toggle selection
    option.classList.toggle('selected');
    
    // Update data model
    if (section) {
        if (!onboardingData[section][field]) {
            onboardingData[section][field] = [];
        }
        
        if (option.classList.contains('selected')) {
            onboardingData[section][field].push(value);
        } else {
            onboardingData[section][field] = onboardingData[section][field].filter(v => v !== value);
        }
    }
    
    validateCurrentStep();
}

function getDataSection(field) {
    const fieldMap = {
        // Business context
        experienceLevel: 'businessContext',
        currentClientLoad: 'businessContext',
        primaryLocation: 'businessContext',
        businessStage: 'businessContext',
        biggestChallenge: 'businessContext',
        
        // Financial
        currentMonthlyRevenue: 'financialSetup',
        revenueGoal: 'financialSetup',
        sessionPricing: 'financialSetup',
        packageTypes: 'financialSetup',
        paymentMethods: 'financialSetup',
        
        // Client demographics
        clientAgeGroups: 'clientDemographics',
        clientGoals: 'clientDemographics',
        fitnessLevels: 'clientDemographics',
        sessionFormats: 'clientDemographics',
        specializations: 'clientDemographics',
        
        // Marketing
        currentMarketing: 'marketing',
        socialMediaPresence: 'marketing',
        leadGenGoals: 'marketing',
        marketingBudget: 'marketing',
        contentCreation: 'marketing',
        
        // Preferences
        communicationPreference: 'preferences',
        coachingStyle: 'preferences'
    };
    
    return fieldMap[field];
}

function showLiveBusinessInsight() {
    const context = onboardingData.businessContext;
    if (context.experienceLevel && context.currentClientLoad) {
        const insight = showBusinessInsight(context);
        const insightDiv = document.getElementById('business-insight');
        const insightText = document.getElementById('insight-text');
        
        if (insightDiv && insightText) {
            insightText.textContent = insight.mainInsight;
            insightDiv.style.display = 'block';
            insightDiv.classList.add('fade-in');
        }
    }
}

function showRevenueCalculator() {
    const financial = onboardingData.financialSetup;
    if (financial.currentMonthlyRevenue && financial.sessionPricing) {
        const preview = document.getElementById('revenue-preview');
        const current = parseRevenue(financial.currentMonthlyRevenue);
        const rate = parseSessionPrice(financial.sessionPricing);
        const potential = calculatePotentialRevenue(current, rate, onboardingData.businessContext);
        
        document.getElementById('current-revenue').textContent = `$${current.toLocaleString()}`;
        document.getElementById('potential-revenue').textContent = `$${potential.toLocaleString()}`;
        document.getElementById('revenue-increase').textContent = `+$${(potential - current).toLocaleString()}`;
        
        preview.style.display = 'block';
        preview.classList.add('fade-in');
    }
}

function parseRevenue(revenueRange) {
    const map = {
        'under-1k': 800,
        '1k-3k': 2000,
        '3k-7k': 5000,
        '7k-15k': 10000,
        '15k+': 20000
    };
    return map[revenueRange] || 2000;
}

function parseSessionPrice(priceRange) {
    const map = {
        '30-50': 40,
        '50-75': 62,
        '75-100': 87,
        '100-150': 125,
        '150+': 175
    };
    return map[priceRange] || 62;
}

function calculatePotentialRevenue(current, rate, context) {
    let multiplier = 1.3; // Base 30% increase
    
    // Adjust based on experience
    if (context.experienceLevel === 'just-starting') {
        multiplier = 1.5; // More growth potential
    } else if (context.experienceLevel === '5+years') {
        multiplier = 1.2; // More modest growth
    }
    
    // Adjust based on current pricing
    if (rate < 50) {
        multiplier += 0.2; // Significant pricing opportunity
    }
    
    return Math.round(current * multiplier);
}

function validateCurrentStep() {
    let isValid = true;
    
    switch(currentStep) {
        case 2: // Business assessment
            isValid = onboardingData.businessContext.experienceLevel &&
                     onboardingData.businessContext.currentClientLoad &&
                     onboardingData.businessContext.primaryLocation &&
                     onboardingData.businessContext.businessStage &&
                     onboardingData.businessContext.biggestChallenge;
            break;
        case 3: // Financial
            isValid = onboardingData.financialSetup.currentMonthlyRevenue &&
                     onboardingData.financialSetup.sessionPricing;
            break;
        case 4: // Client demographics
            isValid = onboardingData.clientDemographics.clientGoals?.length > 0;
            break;
        case 5: // Marketing
            isValid = onboardingData.marketing.socialMediaPresence &&
                     onboardingData.marketing.leadGenGoals;
            break;
    }
    
    // Enable/disable next button
    const nextBtn = document.getElementById(`step-${currentStep}-next`) || 
                   document.querySelector('.step-navigation .btn-primary');
    if (nextBtn && nextBtn.textContent.includes('Continue')) {
        nextBtn.disabled = !isValid;
    }
}

async function nextStep() {
    if (currentStep < totalSteps) {
        // Process step-specific logic
        await processStepCompletion(currentStep);
        
        // Hide current step
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        
        // Show next step
        currentStep++;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        
        // Update progress
        updateProgressBar();
        
        // Load dynamic content for specific steps
        if (currentStep === 6) {
            displayQuickWins();
        } else if (currentStep === 7) {
            displayPersonalizedTasks();
        } else if (currentStep === 8) {
            displayBenchmarks();
        } else if (currentStep === 9) {
            display30DayPlan();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        updateProgressBar();
    }
}

function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Update step dots
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        const stepNum = index + 1;
        dot.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            dot.classList.add('completed');
        } else if (stepNum === currentStep) {
            dot.classList.add('active');
        }
    });
}

async function processStepCompletion(step) {
    switch(step) {
        case 5: // After marketing step, generate quick wins
            onboardingData.quickWins = identifyQuickWins(onboardingData.businessContext);
            break;
        case 6: // After quick wins, generate tasks
            onboardingData.personalizedTasks = generatePersonalizedTasks(onboardingData.businessContext);
            break;
        case 7: // After tasks, generate benchmarks
            onboardingData.benchmarks = generateBenchmarkReport(onboardingData.businessContext);
            break;
        case 8: // After benchmarks, generate 30-day plan
            onboardingData.thirtyDayPlan = generate30DayPlan(onboardingData.businessContext);
            break;
    }
}

function displayQuickWins() {
    const container = document.getElementById('quick-wins-list');
    container.innerHTML = '';
    
    onboardingData.quickWins.forEach((win, index) => {
        const winCard = document.createElement('div');
        winCard.className = 'quick-win-card';
        winCard.innerHTML = `
            <div class="win-header">
                <span class="win-number">${index + 1}</span>
                <span class="win-impact impact-${win.impact.toLowerCase()}">${win.impact} Impact</span>
                <span class="win-effort effort-${win.effort.toLowerCase()}">${win.effort} Effort</span>
            </div>
            <h3 class="win-title">${win.description}</h3>
            <p class="win-potential">Potential: ${win.potentialIncrease}</p>
            <p class="win-implementation">${win.implementation}</p>
            <div class="win-timeframe">⏱ ${win.timeframe}</div>
        `;
        container.appendChild(winCard);
    });
    
    // Update completion summary
    document.getElementById('quick-wins-count').textContent = onboardingData.quickWins.length;
}

function displayPersonalizedTasks() {
    const container = document.getElementById('personalized-tasks');
    container.innerHTML = '';
    
    // Group tasks by category
    const tasksByCategory = {};
    onboardingData.personalizedTasks.forEach(task => {
        if (!tasksByCategory[task.category]) {
            tasksByCategory[task.category] = [];
        }
        tasksByCategory[task.category].push(task);
    });
    
    // Display tasks by category
    Object.entries(tasksByCategory).forEach(([category, tasks]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'task-category';
        categoryDiv.innerHTML = `
            <h3 class="category-title">${category}</h3>
            <div class="task-list">
                ${tasks.map(task => `
                    <div class="task-item">
                        <input type="checkbox" id="task-${task.text.replace(/\s+/g, '-')}" />
                        <label for="task-${task.text.replace(/\s+/g, '-')}">${task.text}</label>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(categoryDiv);
    });
    
    // Update completion summary
    document.getElementById('tasks-count').textContent = onboardingData.personalizedTasks.length;
}

function displayBenchmarks() {
    const container = document.getElementById('benchmark-report');
    const benchmark = onboardingData.benchmarks;
    
    container.innerHTML = `
        <div class="benchmark-grid">
            <div class="benchmark-card">
                <h3>Your Current Position</h3>
                <div class="metric">
                    <span class="metric-label">Clients:</span>
                    <span class="metric-value">${benchmark.yourProfile.clients}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Revenue:</span>
                    <span class="metric-value">$${benchmark.yourProfile.revenue.toLocaleString()}/mo</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Session Rate:</span>
                    <span class="metric-value">$${benchmark.yourProfile.pricing}</span>
                </div>
            </div>
            
            <div class="benchmark-card">
                <h3>Market Average</h3>
                <div class="metric">
                    <span class="metric-label">Clients:</span>
                    <span class="metric-value">${benchmark.marketAverage.clients}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Revenue:</span>
                    <span class="metric-value">$${benchmark.marketAverage.revenue.toLocaleString()}/mo</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Session Rate:</span>
                    <span class="metric-value">$${benchmark.marketAverage.pricing}</span>
                </div>
            </div>
            
            <div class="benchmark-card">
                <h3>Top Performers</h3>
                <div class="metric">
                    <span class="metric-label">Clients:</span>
                    <span class="metric-value">${benchmark.topPerformers.clients}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Revenue:</span>
                    <span class="metric-value">$${benchmark.topPerformers.revenue.toLocaleString()}/mo</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Session Rate:</span>
                    <span class="metric-value">$${benchmark.topPerformers.pricing}</span>
                </div>
            </div>
        </div>
        
        <div class="insights-section">
            <h3>Key Insights</h3>
            <ul class="insights-list">
                ${benchmark.insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
            
            <h3>Opportunities</h3>
            <ul class="opportunities-list">
                ${benchmark.opportunities.map(opp => `<li>${opp}</li>`).join('')}
            </ul>
        </div>
    `;
}

function display30DayPlan() {
    const container = document.getElementById('thirty-day-plan');
    const plan = onboardingData.thirtyDayPlan;
    
    container.innerHTML = Object.entries(plan).map(([week, data]) => `
        <div class="week-card">
            <h3>${week.replace('week', 'Week ')}: ${data.theme}</h3>
            <p class="week-focus">${data.focus}</p>
            <div class="week-tasks">
                ${data.tasks.map(task => `
                    <div class="plan-task">
                        <span class="task-text">${task.task}</span>
                        <span class="task-impact impact-${task.impact.toLowerCase()}">${task.impact}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updateProfileField(e) {
    const fieldMap = {
        'trainer-bio': 'bio',
        'trainer-phone': 'phone',
        'years-in-business': 'yearsInBusiness',
        'success-story': 'successStories'
    };
    
    const field = fieldMap[e.target.id];
    if (field) {
        if (field === 'successStories') {
            onboardingData.profile[field] = [e.target.value];
        } else {
            onboardingData.profile[field] = e.target.value;
        }
    }
}

async function completeEnhancedOnboarding() {
    try {
        showLoading(true);
        
        // Collect final profile data
        onboardingData.profile.bio = document.getElementById('trainer-bio').value;
        onboardingData.profile.phone = document.getElementById('trainer-phone').value;
        onboardingData.profile.yearsInBusiness = document.getElementById('years-in-business').value;
        onboardingData.profile.successStories = [document.getElementById('success-story').value];
        
        // Generate SMART goals
        onboardingData.goals = generateSMARTGoals(onboardingData.businessContext);
        
        // Save to Firebase
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user logged in');
        }
        
        const updateData = {
            ...onboardingData,
            enhancedOnboardingComplete: true,
            onboardingCompletedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save main profile
        await db.collection('users').doc(user.uid).set(updateData, { merge: true });
        
        // Save quick wins as tasks
        const batch = db.batch();
        onboardingData.quickWins.forEach((win, index) => {
            const taskRef = db.collection('users').doc(user.uid).collection('quickWins').doc();
            batch.set(taskRef, {
                ...win,
                order: index + 1,
                completed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        // Save personalized tasks
        onboardingData.personalizedTasks.forEach((task, index) => {
            const taskRef = db.collection('users').doc(user.uid).collection('tasks').doc();
            batch.set(taskRef, {
                ...task,
                order: index + 1,
                completed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        // Save 30-day plan
        const planRef = db.collection('users').doc(user.uid).collection('plans').doc('30day');
        batch.set(planRef, {
            ...onboardingData.thirtyDayPlan,
            startDate: firebase.firestore.FieldValue.serverTimestamp(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        
        await batch.commit();
        
        // Show completion
        showCompletionStep();
        
    } catch (error) {
        console.error('Error completing enhanced onboarding:', error);
        showError('Failed to complete setup: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function showCompletionStep() {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById('completion-step').style.display = 'block';
    
    // Add confetti animation
    launchConfetti();
}

function goToEnhancedDashboard() {
    window.location.href = 'gymbag_dashboard.html';
}

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    console.error(message);
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function launchConfetti() {
    // Simple confetti effect
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Export for testing
window.nextStep = nextStep;
window.previousStep = previousStep;
window.completeEnhancedOnboarding = completeEnhancedOnboarding;
window.goToEnhancedDashboard = goToEnhancedDashboard;
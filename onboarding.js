let currentStep = 1;
const totalSteps = 5;
let onboardingData = {
    userType: null,
    goals: [],
    preferences: {
        theme: 'light',
        notifications: 'all',
        reports: 'enabled'
    },
    profile: {
        bio: '',
        phone: '',
        specialties: [],
        certifications: []
    }
};

async function initializeOnboarding() {
    try {
        if (typeof auth === 'undefined' || !auth) {
            console.error('Firebase auth not initialized');
            setTimeout(initializeOnboarding, 100);
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'signin-page.html';
            return;
        }

        const userData = await getUserData();
        if (userData.success && userData.data.onboardingComplete) {
            window.location.href = 'gymbag_dashboard.html';
            return;
        }

        setupEventListeners();
        
    } catch (error) {
        console.error('Onboarding initialization error:', error);
        showError('Failed to initialize onboarding');
    }
}

function setupEventListeners() {
    document.querySelectorAll('.user-type-option').forEach(option => {
        option.addEventListener('click', () => selectUserType(option));
    });

    document.querySelectorAll('.goal-option').forEach(option => {
        option.addEventListener('click', () => toggleGoal(option));
    });

    document.querySelectorAll('.preference-option').forEach(option => {
        option.addEventListener('click', () => selectPreference(option));
    });

    document.getElementById('onboarding-bio').addEventListener('input', updateBio);
    document.getElementById('onboarding-phone').addEventListener('input', updatePhone);
}

function selectUserType(option) {
    document.querySelectorAll('.user-type-option').forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    
    onboardingData.userType = option.dataset.type;
    document.getElementById('user-type-next').disabled = false;

    if (onboardingData.userType === 'trainer') {
        document.getElementById('trainer-fields').style.display = 'block';
    } else {
        document.getElementById('trainer-fields').style.display = 'none';
    }
}

function toggleGoal(option) {
    const goal = option.dataset.goal;
    
    if (option.classList.contains('selected')) {
        option.classList.remove('selected');
        onboardingData.goals = onboardingData.goals.filter(g => g !== goal);
    } else {
        option.classList.add('selected');
        onboardingData.goals.push(goal);
    }
}

function selectPreference(option) {
    const prefType = option.dataset.pref;
    const value = option.dataset.value;
    
    document.querySelectorAll(`[data-pref="${prefType}"]`).forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    
    onboardingData.preferences[prefType] = value;
}

function updateBio() {
    onboardingData.profile.bio = document.getElementById('onboarding-bio').value;
}

function updatePhone() {
    onboardingData.profile.phone = document.getElementById('onboarding-phone').value;
}

function nextStep() {
    if (currentStep < totalSteps) {
        if (validateStep(currentStep)) {
            document.getElementById(`step-${currentStep}`).classList.remove('active');
            currentStep++;
            document.getElementById(`step-${currentStep}`).classList.add('active');
            updateStepIndicator();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        updateStepIndicator();
    }
}

function validateStep(step) {
    switch (step) {
        case 2:
            if (!onboardingData.userType) {
                showError('Please select your user type');
                return false;
            }
            break;
        case 3:
            if (onboardingData.goals.length === 0) {
                showError('Please select at least one goal');
                return false;
            }
            break;
    }
    return true;
}

function updateStepIndicator() {
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        const stepNumber = index + 1;
        dot.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            dot.classList.add('completed');
        } else if (stepNumber === currentStep) {
            dot.classList.add('active');
        }
    });
}

function addSpecialtyField() {
    const container = document.getElementById('specialties-container');
    const div = document.createElement('div');
    div.className = 'dynamic-field';
    div.innerHTML = `
        <input type="text" class="form-input specialty-input" placeholder="e.g., Weight Training, Yoga, Nutrition">
        <button type="button" class="remove-field-btn" onclick="removeField(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addCertificationField() {
    const container = document.getElementById('certifications-container');
    const div = document.createElement('div');
    div.className = 'dynamic-field';
    div.innerHTML = `
        <input type="text" class="form-input cert-name" placeholder="Certification name">
        <input type="text" class="form-input cert-issuer" placeholder="Issuing organization">
        <input type="number" class="form-input cert-year" placeholder="Year" min="1900" max="2030">
        <button type="button" class="remove-field-btn" onclick="removeField(this)">Remove</button>
    `;
    container.appendChild(div);
}

function removeField(button) {
    button.parentElement.remove();
}

function collectProfileData() {
    onboardingData.profile.specialties = [];
    document.querySelectorAll('.specialty-input').forEach(input => {
        if (input.value.trim()) {
            onboardingData.profile.specialties.push(input.value.trim());
        }
    });

    onboardingData.profile.certifications = [];
    document.querySelectorAll('.dynamic-field').forEach(field => {
        const nameInput = field.querySelector('.cert-name');
        const issuerInput = field.querySelector('.cert-issuer');
        const yearInput = field.querySelector('.cert-year');
        
        if (nameInput && nameInput.value.trim()) {
            onboardingData.profile.certifications.push({
                name: nameInput.value.trim(),
                issuer: issuerInput ? issuerInput.value.trim() : '',
                year: yearInput ? parseInt(yearInput.value) || null : null
            });
        }
    });
}

async function completeOnboarding() {
    try {
        collectProfileData();
        showLoading(true);

        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user logged in');
        }

        const updateData = {
            userType: onboardingData.userType,
            onboardingComplete: true,
            preferences: {
                theme: onboardingData.preferences.theme,
                notifications: onboardingData.preferences.notifications !== 'none',
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            profile: {
                bio: onboardingData.profile.bio,
                contactInfo: {
                    phone: onboardingData.profile.phone
                },
                specialties: onboardingData.profile.specialties,
                certifications: onboardingData.profile.certifications
            },
            settings: {
                emailNotifications: onboardingData.preferences.notifications !== 'none',
                pushNotifications: onboardingData.preferences.notifications === 'all',
                weeklyReports: onboardingData.preferences.reports === 'enabled',
                privacy: 'private'
            },
            goals: onboardingData.goals,
            onboardingCompletedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const result = await updateUserProfile(updateData);

        if (!result.success) {
            throw new Error(result.error);
        }

        await createInitialGoals();

        await customizeTasksForUser();

        await logSecurityEvent(user.uid, 'onboarding_completed', {
            userType: onboardingData.userType,
            goals: onboardingData.goals,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        showCompletionStep();

    } catch (error) {
        console.error('Onboarding completion error:', error);
        showError('Failed to complete setup: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function createInitialGoals() {
    try {
        const user = auth.currentUser;
        const batch = db.batch();

        const goalTemplates = {
            'weight-loss': { title: 'Lose Weight', target: 10, unit: 'lbs', category: 'weight' },
            'muscle-gain': { title: 'Build Muscle', target: 5, unit: 'lbs', category: 'weight' },
            'endurance': { title: 'Improve Endurance', target: 30, unit: 'minutes', category: 'cardio' },
            'strength': { title: 'Increase Strength', target: 50, unit: 'lbs', category: 'strength' },
            'flexibility': { title: 'Improve Flexibility', target: 21, unit: 'days', category: 'flexibility' },
            'general-health': { title: 'General Health', target: 7, unit: 'days/week', category: 'health' }
        };

        onboardingData.goals.forEach((goalType, index) => {
            const template = goalTemplates[goalType];
            if (template) {
                const goalRef = db.collection('users').doc(user.uid).collection('goals').doc();
                batch.set(goalRef, {
                    ...template,
                    type: goalType,
                    current: 0,
                    completed: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
                    priority: index + 1
                });
            }
        });

        await batch.commit();
        
    } catch (error) {
        console.error('Error creating initial goals:', error);
    }
}

async function customizeTasksForUser() {
    try {
        const user = auth.currentUser;
        
        const taskTemplates = {
            'weight-loss': [
                { category: 'Cardio', text: 'Complete 30 minutes of cardio', enabled: true },
                { category: 'Nutrition', text: 'Track all meals and calories', enabled: true },
                { category: 'Hydration', text: 'Drink 8 glasses of water', enabled: true }
            ],
            'muscle-gain': [
                { category: 'Strength', text: 'Complete strength training session', enabled: true },
                { category: 'Nutrition', text: 'Eat protein-rich meals', enabled: true },
                { category: 'Recovery', text: 'Get adequate sleep (7-9 hours)', enabled: true }
            ],
            'endurance': [
                { category: 'Cardio', text: 'Run or cycle for endurance', enabled: true },
                { category: 'Training', text: 'Practice breathing exercises', enabled: true },
                { category: 'Recovery', text: 'Stretch and cool down properly', enabled: true }
            ],
            'strength': [
                { category: 'Lifting', text: 'Focus on compound movements', enabled: true },
                { category: 'Progression', text: 'Track weights and reps', enabled: true },
                { category: 'Recovery', text: 'Rest between workout days', enabled: true }
            ],
            'flexibility': [
                { category: 'Stretching', text: 'Complete flexibility routine', enabled: true },
                { category: 'Yoga', text: 'Practice yoga or mobility work', enabled: true },
                { category: 'Mindfulness', text: 'Practice mindful movement', enabled: true }
            ],
            'general-health': [
                { category: 'Exercise', text: 'Get 30 minutes of physical activity', enabled: true },
                { category: 'Wellness', text: 'Practice stress management', enabled: true },
                { category: 'Habits', text: 'Maintain healthy daily routines', enabled: true }
            ]
        };

        let customTasks = [];
        onboardingData.goals.forEach(goalType => {
            if (taskTemplates[goalType]) {
                customTasks.push(...taskTemplates[goalType]);
            }
        });

        if (customTasks.length === 0) {
            customTasks = [
                { category: 'Fitness', text: 'Complete daily workout', enabled: true },
                { category: 'Nutrition', text: 'Eat balanced meals', enabled: true },
                { category: 'Wellness', text: 'Practice self-care', enabled: true },
                { category: 'Hydration', text: 'Stay hydrated', enabled: true }
            ];
        }

        customTasks = customTasks.slice(0, 8).map((task, index) => ({
            ...task,
            order: index + 1,
            id: `task-${Date.now()}-${index}`
        }));

        await db.collection('users').doc(user.uid).collection('customTasks').doc('default').set({
            tasks: customTasks,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastModified: firebase.firestore.FieldValue.serverTimestamp(),
            version: '2.0'
        }, { merge: true });

    } catch (error) {
        console.error('Error customizing tasks:', error);
    }
}

function showCompletionStep() {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById('completion-step').style.display = 'block';
}

function goToDashboard() {
    window.location.href = 'gymbag_dashboard.html';
}

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    alert(message);
}

document.addEventListener('DOMContentLoaded', initializeOnboarding);
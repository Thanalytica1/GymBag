let currentUser = null;
let userData = null;
let dailyTasks = [];
let customTasks = [];
let userGoals = [];
let motivationalQuotes = [
    "Every workout brings you closer to your goals! 💪",
    "Consistency is key to transformation! 🔥",
    "Your only competition is who you were yesterday! 🌟",
    "Strong doesn't come from comfort zones! 💯",
    "Progress, not perfection! 📈",
    "Your body can do it. It's your mind you need to convince! 🧠",
    "Believe in yourself and you're halfway there! ✨"
];

const defaultTaskTemplates = {
    trainer: [
        // Client Care & Service
        { category: 'Client Care', text: 'Update client programs and workout plans', priority: 1 },
        { category: 'Client Care', text: 'Review client meal logs and provide feedback', priority: 1 },
        { category: 'Client Care', text: 'Log client progress and session notes', priority: 1 },
        { category: 'Client Care', text: 'Schedule client check-ins and assessments', priority: 2 },
        
        // Business Development  
        { category: 'Business', text: 'Post valuable fitness content (social/blog)', priority: 1 },
        { category: 'Business', text: 'Complete 5+ lead generation activities', priority: 1 },
        { category: 'Business', text: 'Follow up with prospects and consultations', priority: 2 },
        { category: 'Business', text: 'Handle client payments and admin tasks', priority: 2 },
        
        // Professional Growth
        { category: 'Professional', text: 'Read fitness study or industry article', priority: 3 },
        { category: 'Professional', text: 'Note insights to share with clients', priority: 3 },
        { category: 'Professional', text: 'Continue education or certification work', priority: 4 },
        
        // Personal Maintenance  
        { category: 'Personal', text: 'Complete your own workout (lead by example)', priority: 2 },
        { category: 'Personal', text: 'Meal prep and nutrition planning', priority: 3 }
    ]
};

async function initializeApp() {
    try {
        currentUser = await getCurrentUser();
        if (!currentUser) {
            window.location.href = 'signin-page.html';
            return;
        }

        await loadUserData();
        await loadUserTasks();
        await loadUserGoals();
        
        displayPersonalizedContent();
        applyUserPreferences();
        
        const todayProgress = await getDailyProgress();
        if (todayProgress.success && todayProgress.data) {
            updateTasksFromProgress(todayProgress.data.completedTasks);
        }
        
        updateAllDisplays();
        setupPeriodicSave();
        
    } catch (error) {
        console.error('App initialization error:', error);
        showNotification('Failed to load your data. Please refresh the page.', 'error');
    }
}

async function loadUserData() {
    const userDataResult = await getUserData();
    if (userDataResult.success) {
        userData = userDataResult.data;
        
        if (!userData.onboardingComplete) {
            window.location.href = 'onboarding.html';
            return;
        }
    } else {
        throw new Error('Failed to load user data');
    }
}

async function loadUserTasks() {
    try {
        const tasksDoc = await db.collection('users').doc(currentUser.uid).collection('customTasks').doc('default').get();
        
        if (tasksDoc.exists) {
            customTasks = tasksDoc.data().tasks || [];
            dailyTasks = customTasks.map(task => ({
                ...task,
                completed: false
            }));
        } else {
            await createDefaultTasks();
        }
        
    } catch (error) {
        console.error('Load user tasks error:', error);
        await createDefaultTasks();
    }
}

async function createDefaultTasks() {
    // Always use trainer tasks (remove userType logic)
    const defaultTasks = defaultTaskTemplates.trainer;
    
    customTasks = [...defaultTasks];
    dailyTasks = customTasks.map(task => ({ ...task, completed: false }));
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('customTasks').doc('default').set({
            tasks: customTasks,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Create default tasks error:', error);
    }
}

async function loadUserGoals() {
    try {
        const goalsSnapshot = await db.collection('users').doc(currentUser.uid).collection('goals')
            .where('completed', '==', false)
            .orderBy('priority', 'asc')
            .limit(3)
            .get();
        
        userGoals = [];
        goalsSnapshot.forEach(doc => {
            userGoals.push({ id: doc.id, ...doc.data() });
        });
        
    } catch (error) {
        console.error('Load user goals error:', error);
        userGoals = [];
    }
}

function displayPersonalizedContent() {
    updateWelcomeMessage();
    updateMotivationalContent();
    updateGoalsDisplay();
    updateStreakDisplay(userData?.stats?.streak || 0);
}

function updateWelcomeMessage() {
    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        const timeOfDay = getTimeOfDay();
        const name = userData?.displayName || currentUser?.displayName || 'there';
        welcomeElement.textContent = `Good ${timeOfDay}, ${name}! 👋`;
    }
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

function updateMotivationalContent() {
    const motivationElement = document.getElementById('daily-motivation');
    if (motivationElement) {
        const todayQuote = getMotivationalQuote();
        motivationElement.innerHTML = `
            <div class="motivation-card">
                <div class="motivation-icon">✨</div>
                <div class="motivation-text">${todayQuote}</div>
            </div>
        `;
    }
}

function getMotivationalQuote() {
    const today = new Date().toDateString();
    const quoteIndex = today.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % motivationalQuotes.length;
    return motivationalQuotes[quoteIndex];
}

function updateGoalsDisplay() {
    const goalsContainer = document.getElementById('user-goals');
    if (goalsContainer && userGoals.length > 0) {
        goalsContainer.innerHTML = `
            <div class="goals-section">
                <h3>Your Active Goals 🎯</h3>
                ${userGoals.map(goal => `
                    <div class="goal-card">
                        <div class="goal-title">${goal.title}</div>
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(goal.current / goal.target) * 100}%"></div>
                            </div>
                            <span class="progress-text">${goal.current}/${goal.target} ${goal.unit}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function applyUserPreferences() {
    if (userData?.preferences) {
        const theme = userData.preferences.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        if (userData.preferences.notifications === false) {
            disableNotifications();
        }
    }
}

function updateTasksFromProgress(completedTasks) {
    if (completedTasks && Array.isArray(completedTasks)) {
        completedTasks.forEach((savedTask, index) => {
            if (index < dailyTasks.length) {
                dailyTasks[index].completed = savedTask.completed;
                if (savedTask.completed) {
                    updateTaskUI(index, false);
                }
            }
        });
    }
}

function updateAllDisplays() {
    updateProgressDisplay();
    updateDate();
    updateUserStats();
    renderTasksList();
}

function updateUserStats() {
    const statsElement = document.getElementById('user-stats');
    if (statsElement && userData?.stats) {
        const stats = userData.stats;
        statsElement.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${stats.totalTasksCompleted || 0}</div>
                    <div class="stat-label">Tasks Completed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.perfectDays || 0}</div>
                    <div class="stat-label">Perfect Days</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Math.round(stats.averageCompletionRate || 0)}%</div>
                    <div class="stat-label">Avg Completion</div>
                </div>
            </div>
        `;
    }
}

function renderTasksList() {
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) return;

    const sortedTasks = dailyTasks.sort((a, b) => (a.priority || 5) - (b.priority || 5));
    
    tasksContainer.innerHTML = sortedTasks.map((task, index) => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-task="${index}">
            <div class="task-checkbox" onclick="toggleTask(${index})">${task.completed ? '✓' : ''}</div>
            <div class="task-content">
                <div class="task-category">${task.category}</div>
                <div class="task-text">${task.text}</div>
                <div class="task-priority priority-${task.priority || 3}">
                    ${getPriorityLabel(task.priority || 3)}
                </div>
            </div>
        </div>
    `).join('');
}

function getPriorityLabel(priority) {
    const labels = {
        1: 'High Priority 🔴',
        2: 'Medium Priority 🟡',
        3: 'Normal Priority 🟢',
        4: 'Low Priority ⚪'
    };
    return labels[priority] || 'Normal Priority 🟢';
}

function setupPeriodicSave() {
    setInterval(async () => {
        if (dailyTasks.some(task => task.completed)) {
            await saveDailyProgress(dailyTasks);
        }
    }, 5 * 60 * 1000); // Save every 5 minutes
}

function updateStreakDisplay(streak) {
    const streakBadge = document.getElementById('streakBadge');
    if (streakBadge) {
        streakBadge.textContent = `🔥 Day ${streak}`;
    }
}

function updateDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

function toggleTask(taskIndex, saveProgress = true) {
    const taskItem = document.querySelector(`[data-task="${taskIndex}"]`);
    const checkbox = taskItem.querySelector('.task-checkbox');
    
    if (!taskItem || !checkbox) return;
    
    dailyTasks[taskIndex].completed = !dailyTasks[taskIndex].completed;
    dailyTasks[taskIndex].completedAt = dailyTasks[taskIndex].completed ? new Date().toISOString() : null;
    
    updateTaskUI(taskIndex, saveProgress);
    updateProgressDisplay();
    
    if (saveProgress) {
        saveDailyProgress(dailyTasks);
        trackTaskCompletion(dailyTasks[taskIndex]);
    }
    
    checkForAchievements();
}

function updateTaskUI(taskIndex, animate = true) {
    const taskItem = document.querySelector(`[data-task="${taskIndex}"]`);
    const checkbox = taskItem.querySelector('.task-checkbox');
    
    if (!taskItem || !checkbox) return;
    
    if (dailyTasks[taskIndex].completed) {
        taskItem.classList.add('completed');
        checkbox.innerHTML = '✓';
        
        if (animate) {
            taskItem.style.transform = 'scale(1.05)';
            setTimeout(() => {
                taskItem.style.transform = 'scale(1)';
            }, 200);
            
            showTaskCompletionEffect(taskItem);
        }
    } else {
        taskItem.classList.remove('completed');
        checkbox.innerHTML = '';
    }
}

function showTaskCompletionEffect(taskElement) {
    const effect = document.createElement('div');
    effect.className = 'completion-effect';
    effect.innerHTML = '🎉';
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        font-size: 24px;
        animation: celebration 0.8s ease-out forwards;
        pointer-events: none;
        z-index: 10;
    `;
    
    taskElement.style.position = 'relative';
    taskElement.appendChild(effect);
    
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 800);
}

async function trackTaskCompletion(task) {
    try {
        if (task.completed && userData?.userType) {
            await updateGoalProgress(task);
            
            const completedCount = dailyTasks.filter(t => t.completed).length;
            const totalTasks = dailyTasks.length;
            
            if (completedCount === totalTasks) {
                await recordPerfectDay();
            }
        }
    } catch (error) {
        console.error('Task completion tracking error:', error);
    }
}

async function updateGoalProgress(task) {
    try {
        const relatedGoals = userGoals.filter(goal => 
            goal.category?.toLowerCase() === task.category?.toLowerCase() ||
            goal.type?.includes(task.category?.toLowerCase())
        );
        
        for (const goal of relatedGoals) {
            const newCurrent = Math.min(goal.current + 1, goal.target);
            
            await db.collection('users').doc(currentUser.uid)
                .collection('goals').doc(goal.id).update({
                    current: newCurrent,
                    completed: newCurrent >= goal.target,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            goal.current = newCurrent;
            goal.completed = newCurrent >= goal.target;
            
            if (goal.completed) {
                showGoalCompletionNotification(goal);
            }
        }
        
        updateGoalsDisplay();
        
    } catch (error) {
        console.error('Goal progress update error:', error);
    }
}

async function recordPerfectDay() {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            'stats.perfectDays': firebase.firestore.FieldValue.increment(1),
            'stats.lastPerfectDay': new Date().toDateString()
        });
        
        userData.stats.perfectDays = (userData.stats.perfectDays || 0) + 1;
        updateUserStats();
        
    } catch (error) {
        console.error('Perfect day recording error:', error);
    }
}

function checkForAchievements() {
    const completedCount = dailyTasks.filter(t => t.completed).length;
    const totalTasks = dailyTasks.length;
    const completionRate = (completedCount / totalTasks) * 100;
    
    if (completionRate === 100) {
        showAchievement('Perfect Day! 🏆', 'You completed all your daily tasks!');
    } else if (completionRate >= 75) {
        showAchievement('Great Progress! 🌟', 'You\'re almost there!');
    } else if (completedCount === 1) {
        showAchievement('Great Start! 🚀', 'Every journey begins with a single step!');
    }
}

function showGoalCompletionNotification(goal) {
    showNotification(`🎯 Goal Achieved: ${goal.title}!`, 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 300px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function disableNotifications() {
    window.showNotification = () => {};
}

function updateProgressDisplay() {
    const completedCount = dailyTasks.filter(t => t.completed).length;
    const totalCount = dailyTasks.length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    
    document.getElementById('progressCount').textContent = `${completedCount}/${totalCount} Tasks`;
    document.getElementById('progressPercentage').textContent = `${percentage}%`;
    document.getElementById('progressFill').style.width = `${percentage}%`;
    
    const dotsContainer = document.getElementById('progressDots');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (i < completedCount) {
            dot.classList.add('active');
        }
        dotsContainer.appendChild(dot);
    }
}

function showAchievement(title = 'Perfect Day! 🏆', message = 'You\'ve completed all your daily tasks!') {
    const achievementEl = document.getElementById('achievement') || createAchievementElement();
    
    achievementEl.innerHTML = `
        <div class="achievement-icon">${getAchievementIcon(title)}</div>
        <div class="achievement-text">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <div class="achievement-close" onclick="hideAchievement()">×</div>
    `;
    
    achievementEl.classList.add('show');
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        hideAchievement();
    }, 8000);
    
    // Play celebration animation
    triggerCelebration();
}

function createAchievementElement() {
    const achievementEl = document.createElement('div');
    achievementEl.id = 'achievement';
    achievementEl.className = 'achievement';
    achievementEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        z-index: 1001;
        max-width: 400px;
        text-align: center;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    
    document.body.appendChild(achievementEl);
    return achievementEl;
}

function getAchievementIcon(title) {
    if (title.includes('Perfect Day')) return '🏆';
    if (title.includes('Great Progress')) return '🌟';
    if (title.includes('Great Start')) return '🚀';
    if (title.includes('Goal')) return '🎯';
    return '🎉';
}

function hideAchievement() {
    const achievementEl = document.getElementById('achievement');
    if (achievementEl && achievementEl.classList.contains('show')) {
        achievementEl.classList.remove('show');
    }
}

function triggerCelebration() {
    createConfetti();
    
    // Add screen flash effect
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
        z-index: 999;
        pointer-events: none;
        animation: flash 0.5s ease-out;
    `;
    
    document.body.appendChild(flash);
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 500);
}

function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#eb4d4b', '#6c5ce7'];
    const confettiCount = 30;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * 100}%;
            border-radius: 50%;
            z-index: 1002;
            pointer-events: none;
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
}

// Add CSS animations to the document
function addAchievementStyles() {
    if (document.getElementById('achievement-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'achievement-styles';
    style.textContent = `
        .achievement.show {
            opacity: 1 !important;
            transform: translateX(-50%) translateY(0) !important;
        }
        
        .achievement-close {
            position: absolute;
            top: 8px;
            right: 12px;
            font-size: 20px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        
        .achievement-close:hover {
            opacity: 1;
        }
        
        .achievement-icon {
            font-size: 32px;
            margin-right: 10px;
        }
        
        .achievement-text strong {
            font-size: 18px;
            display: block;
            margin-bottom: 5px;
        }
        
        .achievement-text p {
            margin: 0;
            opacity: 0.9;
            font-size: 14px;
        }
        
        @keyframes flash {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
        }
        
        @keyframes confettiFall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes celebration {
            0% {
                transform: translateY(-50%) scale(0) rotate(0deg);
                opacity: 1;
            }
            50% {
                transform: translateY(-50%) scale(1.2) rotate(180deg);
                opacity: 1;
            }
            100% {
                transform: translateY(-50%) scale(0) rotate(360deg);
                opacity: 0;
            }
        }
        
        .task-priority {
            font-size: 11px;
            margin-top: 5px;
            opacity: 0.8;
        }
        
        .priority-1 { color: #dc3545; font-weight: bold; }
        .priority-2 { color: #ffc107; font-weight: bold; }
        .priority-3 { color: #28a745; }
        .priority-4 { color: #6c757d; }
        
        .motivation-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .motivation-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .motivation-text {
            font-size: 16px;
            font-weight: 500;
        }
        
        .goals-section {
            margin: 20px 0;
        }
        
        .goal-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            transition: border-color 0.3s;
        }
        
        .goal-card:hover {
            border-color: #007bff;
        }
        
        .goal-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .goal-progress {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .progress-bar {
            flex: 1;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
        
        .progress-text {
            font-size: 12px;
            color: #666;
            white-space: nowrap;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 2px solid #e9ecef;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
    `;
    
    document.head.appendChild(style);
}

async function handleLogout() {
    const result = await signOut();
    if (result.success) {
        window.location.href = 'signin-page.html';
    }
}

if (window.location.pathname.includes('gymbag_webapp.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        addAchievementStyles();
        initializeApp();
    });
}
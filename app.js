let currentUser = null;
let dailyTasks = [
    { category: 'Programming', text: 'Update client programs and workout plans', completed: false },
    { category: 'Nutrition', text: 'Check client meal logs and prep guidance', completed: false },
    { category: 'Communication', text: 'Log client feedback and progress notes', completed: false },
    { category: 'Follow-ups', text: 'Send check-in messages to clients', completed: false },
    { category: 'Analysis', text: 'Review form videos and movement assessments', completed: false },
    { category: 'Planning', text: 'Schedule next sessions and consultations', completed: false },
    { category: 'Content', text: 'Post workout tips or motivational content', completed: false },
    { category: 'Education', text: 'Research new exercises or training methods', completed: false },
    { category: 'Admin', text: 'Update client billing and session packages', completed: false },
    { category: 'Equipment', text: 'Check and maintain training equipment', completed: false },
    { category: 'Review', text: 'Reflect on today\'s sessions and improvements', completed: false }
];

async function initializeApp() {
    currentUser = await getCurrentUser();
    if (!currentUser) {
        window.location.href = 'signin-page.html';
        return;
    }
    
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    
    updateStreakDisplay(userData.streak || 0);
    
    const todayProgress = await getDailyProgress();
    if (todayProgress.success && todayProgress.data) {
        dailyTasks = todayProgress.data.completedTasks;
        dailyTasks.forEach((task, index) => {
            if (task.completed) {
                toggleTask(index, false);
            }
        });
    }
    
    updateProgressDisplay();
    updateDate();
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
    
    dailyTasks[taskIndex].completed = !dailyTasks[taskIndex].completed;
    
    if (dailyTasks[taskIndex].completed) {
        taskItem.classList.add('completed');
        checkbox.innerHTML = '✓';
        
        const completedCount = dailyTasks.filter(t => t.completed).length;
        if (completedCount === dailyTasks.length) {
            showAchievement();
        }
    } else {
        taskItem.classList.remove('completed');
        checkbox.innerHTML = '';
    }
    
    updateProgressDisplay();
    
    if (saveProgress) {
        saveDailyProgress(dailyTasks);
    }
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

function showAchievement() {
    const achievementEl = document.getElementById('achievement');
    achievementEl.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
            <strong>Perfect Day!</strong>
            <p>You've completed all your daily tasks!</p>
        </div>
    `;
    achievementEl.classList.add('show');
    
    setTimeout(() => {
        achievementEl.classList.remove('show');
    }, 5000);
}

async function handleLogout() {
    const result = await signOut();
    if (result.success) {
        window.location.href = 'signin-page.html';
    }
}

if (window.location.pathname.includes('gymbag_webapp.html')) {
    document.addEventListener('DOMContentLoaded', initializeApp);
}
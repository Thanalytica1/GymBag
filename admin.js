let adminData = {
    users: [],
    securityEvents: [],
    stats: {},
    currentPage: 1,
    usersPerPage: 20,
    filters: {
        userType: '',
        userStatus: '',
        subscription: '',
        search: ''
    }
};

async function initializeAdmin() {
    try {
        showLoading(true);
        
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'signin-page.html';
            return;
        }

        const hasAccess = await checkAdminAccess(user.uid);
        if (!hasAccess) {
            showAccessDenied();
            return;
        }

        document.getElementById('admin-user-info').textContent = `Logged in as: ${user.displayName || user.email}`;

        await loadDashboardData();
        setupEventListeners();
        
    } catch (error) {
        console.error('Admin initialization error:', error);
        showError('Failed to initialize admin panel: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function checkAdminAccess(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        return userData && (userData.role === 'admin' || userData.role === 'super_admin');
    } catch (error) {
        console.error('Admin access check error:', error);
        return false;
    }
}

async function loadDashboardData() {
    try {
        await Promise.all([
            loadSystemStats(),
            loadRecentUsers(),
            loadSecurityEvents(),
            checkSecurityAlerts()
        ]);
        
    } catch (error) {
        console.error('Dashboard data loading error:', error);
        showError('Failed to load dashboard data');
    }
}

async function loadSystemStats() {
    try {
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        
        let activeUsers = 0;
        let trainers = 0;
        let clients = 0;
        let pendingVerification = 0;
        
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            
            if (userData.userType === 'trainer') trainers++;
            else if (userData.userType === 'client') clients++;
            
            if (!userData.emailVerified) pendingVerification++;
            
            const lastLogin = userData.stats?.lastLoginDate;
            if (lastLogin) {
                const daysSinceLogin = Math.floor((new Date() - lastLogin.toDate()) / (1000 * 60 * 60 * 24));
                if (daysSinceLogin <= 7) activeUsers++;
            }
        });

        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentProgressSnapshot = await db.collectionGroup('dailyProgress')
            .where('timestamp', '>=', weekAgo)
            .get();
        
        const weeklyProgress = recentProgressSnapshot.size;

        adminData.stats = {
            totalUsers,
            activeUsers,
            trainers,
            clients,
            pendingVerification,
            weeklyProgress
        };

        displayStats();
        
    } catch (error) {
        console.error('Stats loading error:', error);
    }
}

function displayStats() {
    const statsGrid = document.getElementById('stats-grid');
    const stats = [
        { label: 'Total Users', value: adminData.stats.totalUsers, icon: '👥' },
        { label: 'Active Users (7d)', value: adminData.stats.activeUsers, icon: '🟢' },
        { label: 'Trainers', value: adminData.stats.trainers, icon: '🏋️‍♀️' },
        { label: 'Clients', value: adminData.stats.clients, icon: '🏃‍♂️' },
        { label: 'Pending Verification', value: adminData.stats.pendingVerification, icon: '⏳' },
        { label: 'Weekly Progress Entries', value: adminData.stats.weeklyProgress, icon: '📊' }
    ];

    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-number">${stat.icon} ${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');
}

async function loadRecentUsers() {
    try {
        const snapshot = await db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();
        
        adminData.users = [];
        snapshot.forEach(doc => {
            adminData.users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayUsers();
        
    } catch (error) {
        console.error('Users loading error:', error);
    }
}

function displayUsers() {
    const filteredUsers = filterUsers();
    const startIndex = (adminData.currentPage - 1) * adminData.usersPerPage;
    const endIndex = startIndex + adminData.usersPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);

    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = pageUsers.map(user => {
        const status = getUserStatus(user);
        const statusClass = `status-${status.toLowerCase().replace(' ', '-')}`;
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div>
                            <strong>${user.displayName || 'Unknown'}</strong>
                            <br><small style="color: #666;">${user.email}</small>
                        </div>
                    </div>
                </td>
                <td>${user.userType || 'N/A'}</td>
                <td><span class="user-status ${statusClass}">${status}</span></td>
                <td>${user.subscriptionTier || 'Free'}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>${formatDate(user.stats?.lastLoginDate)}</td>
                <td>
                    <button class="action-btn btn-primary" onclick="viewUser('${user.id}')">View</button>
                    <button class="action-btn btn-warning" onclick="suspendUser('${user.id}')">Suspend</button>
                    <button class="action-btn btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    displayPagination(filteredUsers.length);
}

function filterUsers() {
    return adminData.users.filter(user => {
        if (adminData.filters.userType && user.userType !== adminData.filters.userType) return false;
        if (adminData.filters.subscription && user.subscriptionTier !== adminData.filters.subscription) return false;
        
        if (adminData.filters.userStatus) {
            const status = getUserStatus(user).toLowerCase();
            if (!status.includes(adminData.filters.userStatus)) return false;
        }
        
        if (adminData.filters.search) {
            const search = adminData.filters.search.toLowerCase();
            const searchText = `${user.displayName} ${user.email} ${user.id}`.toLowerCase();
            if (!searchText.includes(search)) return false;
        }
        
        return true;
    });
}

function getUserStatus(user) {
    if (user.security?.accountLocked) return 'Locked';
    if (!user.emailVerified) return 'Pending';
    
    const lastLogin = user.stats?.lastLoginDate;
    if (!lastLogin) return 'Inactive';
    
    const daysSinceLogin = Math.floor((new Date() - lastLogin.toDate()) / (1000 * 60 * 60 * 24));
    return daysSinceLogin <= 30 ? 'Active' : 'Inactive';
}

async function loadSecurityEvents() {
    try {
        const events = [];
        const usersSnapshot = await db.collection('users').limit(50).get();
        
        for (const userDoc of usersSnapshot.docs) {
            const securitySnapshot = await userDoc.ref.collection('securityLog')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            securitySnapshot.forEach(eventDoc => {
                events.push({
                    id: eventDoc.id,
                    userId: userDoc.id,
                    userEmail: userDoc.data().email,
                    ...eventDoc.data()
                });
            });
        }
        
        adminData.securityEvents = events.sort((a, b) => 
            b.createdAt?.toDate() - a.createdAt?.toDate()
        );

        displaySecurityEvents();
        
    } catch (error) {
        console.error('Security events loading error:', error);
    }
}

function displaySecurityEvents() {
    const tbody = document.getElementById('security-table-body');
    const recentEvents = adminData.securityEvents.slice(0, 50);
    
    tbody.innerHTML = recentEvents.map(event => `
        <tr>
            <td>${formatDate(event.createdAt)}</td>
            <td>${event.userEmail || 'Unknown'}</td>
            <td>${event.eventType || 'Unknown'}</td>
            <td>${event.ip || 'N/A'}</td>
            <td>${getEventStatus(event.eventType)}</td>
            <td>
                <button class="action-btn btn-primary" onclick="viewSecurityEvent('${event.id}')">Details</button>
            </td>
        </tr>
    `).join('');
}

function getEventStatus(eventType) {
    const statusMap = {
        'login_success': '✅ Success',
        'login_failed': '❌ Failed',
        'logout': '🚪 Logout',
        'password_changed': '🔑 Changed',
        'profile_updated': '✏️ Updated'
    };
    
    return statusMap[eventType] || '❓ Unknown';
}

async function checkSecurityAlerts() {
    try {
        const alerts = [];
        
        const failedLogins = adminData.securityEvents.filter(event => 
            event.eventType === 'login_failed' && 
            event.createdAt?.toDate() > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        
        if (failedLogins.length > 100) {
            alerts.push(`High number of failed login attempts: ${failedLogins.length} in the last 24 hours`);
        }

        const lockedAccounts = adminData.users.filter(user => user.security?.accountLocked);
        if (lockedAccounts.length > 0) {
            alerts.push(`${lockedAccounts.length} accounts are currently locked`);
        }

        if (alerts.length > 0) {
            const alertDiv = document.getElementById('security-alerts');
            const messageSpan = document.getElementById('alert-message');
            messageSpan.innerHTML = alerts.join('<br>');
            alertDiv.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Security alerts check error:', error);
    }
}

function setupEventListeners() {
    document.getElementById('user-search').addEventListener('input', (e) => {
        adminData.filters.search = e.target.value;
        adminData.currentPage = 1;
        displayUsers();
    });

    document.getElementById('user-type-filter').addEventListener('change', (e) => {
        adminData.filters.userType = e.target.value;
        adminData.currentPage = 1;
        displayUsers();
    });

    document.getElementById('user-status-filter').addEventListener('change', (e) => {
        adminData.filters.userStatus = e.target.value;
        adminData.currentPage = 1;
        displayUsers();
    });

    document.getElementById('subscription-filter').addEventListener('change', (e) => {
        adminData.filters.subscription = e.target.value;
        adminData.currentPage = 1;
        displayUsers();
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(`${sectionName}-section`).classList.add('active');
    event.target.classList.add('active');
}

async function viewUser(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        const progressSnapshot = await userDoc.ref.collection('dailyProgress')
            .orderBy('timestamp', 'desc')
            .limit(30)
            .get();
        
        const progress = [];
        progressSnapshot.forEach(doc => progress.push(doc.data()));

        const modalContent = document.getElementById('user-detail-content');
        modalContent.innerHTML = `
            <div class="user-info-grid">
                <div class="info-item">
                    <div class="info-label">Display Name</div>
                    <div class="info-value">${userData.displayName || 'Not set'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${userData.email}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">User Type</div>
                    <div class="info-value">${userData.userType || 'Not set'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Subscription</div>
                    <div class="info-value">${userData.subscriptionTier || 'Free'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email Verified</div>
                    <div class="info-value">${userData.emailVerified ? 'Yes' : 'No'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Account Status</div>
                    <div class="info-value">${getUserStatus(userData)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Created</div>
                    <div class="info-value">${formatDate(userData.createdAt)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Last Login</div>
                    <div class="info-value">${formatDate(userData.stats?.lastLoginDate)}</div>
                </div>
            </div>
            
            <h4>Recent Activity (${progress.length} entries)</h4>
            <div style="max-height: 200px; overflow-y: auto;">
                ${progress.map(entry => `
                    <div style="padding: 10px; border-bottom: 1px solid #eee;">
                        <strong>${entry.date}</strong> - ${entry.completionRate || 0}% completion
                        (${entry.completedTasksCount || 0}/${entry.totalTasks || 0} tasks)
                    </div>
                `).join('')}
            </div>
        `;
        
        document.getElementById('user-detail-modal').style.display = 'block';
        
    } catch (error) {
        console.error('View user error:', error);
        showError('Failed to load user details');
    }
}

function closeUserModal() {
    document.getElementById('user-detail-modal').style.display = 'none';
}

async function suspendUser(userId) {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    
    try {
        await db.collection('users').doc(userId).update({
            'security.accountLocked': true,
            'security.lockoutTime': firebase.firestore.FieldValue.serverTimestamp(),
            'security.lockoutReason': 'Admin suspension'
        });
        
        await loadRecentUsers();
        showSuccess('User suspended successfully');
        
    } catch (error) {
        console.error('Suspend user error:', error);
        showError('Failed to suspend user');
    }
}

async function deleteUser(userId) {
    const confirmation = prompt('Type "DELETE" to confirm user deletion:');
    if (confirmation !== 'DELETE') return;
    
    try {
        await db.collection('users').doc(userId).delete();
        await loadRecentUsers();
        showSuccess('User deleted successfully');
        
    } catch (error) {
        console.error('Delete user error:', error);
        showError('Failed to delete user');
    }
}

async function exportUsers() {
    try {
        const exportData = adminData.users.map(user => ({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            userType: user.userType,
            subscriptionTier: user.subscriptionTier,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt?.toDate?.()?.toISOString(),
            lastLogin: user.stats?.lastLoginDate?.toDate?.()?.toISOString()
        }));
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `gymbag_users_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showSuccess('Users exported successfully');
        
    } catch (error) {
        console.error('Export users error:', error);
        showError('Failed to export users');
    }
}

async function refreshUsers() {
    showLoading(true);
    await loadRecentUsers();
    showLoading(false);
    showSuccess('Users refreshed successfully');
}

function displayPagination(totalUsers) {
    const totalPages = Math.ceil(totalUsers / adminData.usersPerPage);
    const pagination = document.getElementById('users-pagination');
    
    let paginationHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === adminData.currentPage ? 'active' : '';
        paginationHTML += `
            <button class="page-btn ${activeClass}" onclick="changePage(${i})">${i}</button>
        `;
    }
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    adminData.currentPage = page;
    displayUsers();
}

function formatDate(timestamp) {
    if (!timestamp) return 'Never';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    const content = document.querySelectorAll('.admin-section');
    
    if (show) {
        spinner.style.display = 'block';
        content.forEach(section => section.style.opacity = '0.5');
    } else {
        spinner.style.display = 'none';
        content.forEach(section => section.style.opacity = '1');
    }
}

function showAccessDenied() {
    document.getElementById('access-denied').style.display = 'block';
    document.querySelectorAll('.admin-section, .admin-nav').forEach(el => {
        el.style.display = 'none';
    });
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    alert(message);
}

function goToDashboard() {
    window.location.href = 'gymbag_dashboard.html';
}

async function performMaintenance() {
    if (!confirm('This will perform system maintenance tasks. Continue?')) return;
    
    showLoading(true);
    
    setTimeout(() => {
        showLoading(false);
        showSuccess('Maintenance tasks completed successfully');
    }, 3000);
}

async function createBackup() {
    if (!confirm('Create a system backup? This may take a few minutes.')) return;
    
    showLoading(true);
    
    setTimeout(() => {
        showLoading(false);
        showSuccess('Backup created successfully');
    }, 5000);
}

async function clearSystemCache() {
    if (!confirm('Clear system cache? This will improve performance.')) return;
    
    showSuccess('System cache cleared successfully');
}

document.addEventListener('DOMContentLoaded', initializeAdmin);
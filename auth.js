async function signUp(email, password, displayName, additionalData = {}) {
    try {
        if (!isFirebaseInitialized()) {
            throw new Error('Firebase not initialized');
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await user.updateProfile({
            displayName: displayName
        });

        await user.sendEmailVerification({
            url: `${window.location.origin}/signin-page.html?verified=true`,
            handleCodeInApp: false
        });
        
        const userProfile = {
            uid: user.uid,
            email: email,
            displayName: displayName,
            emailVerified: false,
            userType: additionalData.userType || 'client',
            subscriptionTier: additionalData.subscriptionTier || 'free',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLoginDate: null,
            registrationComplete: false,
            onboardingComplete: false,
            streak: 0,
            totalSessions: 0,
            preferences: {
                theme: additionalData.theme || 'light',
                notifications: additionalData.notifications !== false,
                language: additionalData.language || 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                ...additionalData.preferences
            },
            profile: {
                avatar: additionalData.avatar || null,
                bio: additionalData.bio || '',
                certifications: additionalData.certifications || [],
                specialties: additionalData.specialties || [],
                contactInfo: {
                    phone: additionalData.phone || '',
                    address: additionalData.address || ''
                }
            },
            stats: {
                streak: 0,
                totalSessions: 0,
                lastLoginDate: null,
                accountCreated: firebase.firestore.FieldValue.serverTimestamp(),
                totalTasksCompleted: 0,
                averageCompletionRate: 0
            },
            settings: {
                privacy: additionalData.privacy || 'private',
                dataSharing: additionalData.dataSharing || false,
                emailNotifications: additionalData.emailNotifications !== false,
                pushNotifications: additionalData.pushNotifications !== false,
                weeklyReports: additionalData.weeklyReports !== false
            },
            security: {
                twoFactorEnabled: false,
                lastPasswordChange: firebase.firestore.FieldValue.serverTimestamp(),
                securityQuestions: additionalData.securityQuestions || [],
                loginAttempts: 0,
                accountLocked: false
            }
        };
        
        await db.collection('users').doc(user.uid).set(userProfile);
        
        await createUserCollections(user.uid);
        
        return { 
            success: true, 
            user: user,
            emailVerificationSent: true,
            message: 'Account created successfully! Please check your email to verify your account.'
        };
    } catch (error) {
        console.error('Sign up error:', error);
        return { 
            success: false, 
            error: getErrorMessage(error),
            code: error.code 
        };
    }
}

async function createUserCollections(userId) {
    try {
        const batch = db.batch();
        
        const defaultTasks = [
            { category: 'Fitness', text: 'Complete morning workout', enabled: true, order: 1 },
            { category: 'Nutrition', text: 'Log meals and water intake', enabled: true, order: 2 },
            { category: 'Wellness', text: 'Practice mindfulness or meditation', enabled: true, order: 3 },
            { category: 'Planning', text: 'Review and plan tomorrow\'s goals', enabled: true, order: 4 }
        ];
        
        const tasksRef = db.collection('users').doc(userId).collection('customTasks').doc('default');
        batch.set(tasksRef, {
            tasks: defaultTasks,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        const goalsRef = db.collection('users').doc(userId).collection('goals').doc('initial');
        batch.set(goalsRef, {
            type: 'welcome',
            title: 'Welcome to GymBag!',
            description: 'Complete your first week of daily tasks',
            target: 7,
            current: 0,
            completed: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await batch.commit();
        
    } catch (error) {
        console.error('Error creating user collections:', error);
        throw error;
    }
}

async function signIn(email, password, rememberMe = false) {
    try {
        if (!isFirebaseInitialized()) {
            throw new Error('Firebase not initialized');
        }

        const persistence = rememberMe ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;
        
        await auth.setPersistence(persistence);
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists) {
            await signOut();
            throw new Error('User profile not found. Please contact support.');
        }
        
        const userData = userDoc.data();
        
        if (userData.security?.accountLocked) {
            await signOut();
            throw new Error('Account is temporarily locked. Please contact support.');
        }
        
        const today = new Date().toDateString();
        const now = new Date();
        let streak = userData.streak || 0;
        const lastLogin = userData.lastLoginDate;
        
        if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            const daysDiff = Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                streak++;
            } else if (daysDiff > 1) {
                streak = 1;
            }
        } else {
            streak = 1;
        }
        
        const updateData = {
            lastLoginDate: today,
            'stats.streak': streak,
            'stats.lastLoginDate': firebase.firestore.FieldValue.serverTimestamp(),
            'security.loginAttempts': 0,
            'security.lastSuccessfulLogin': firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: user.emailVerified
        };
        
        if (!userData.onboardingComplete && userData.userType) {
            updateData.onboardingComplete = false;
        }
        
        await userDocRef.update(updateData);
        
        await logSecurityEvent(user.uid, 'login_success', {
            userAgent: navigator.userAgent,
            ip: await getUserIP(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        clearUserCache();
        
        return { 
            success: true, 
            user: user,
            userData: { ...userData, ...updateData },
            needsOnboarding: !userData.onboardingComplete,
            emailVerified: user.emailVerified
        };
        
    } catch (error) {
        console.error('Sign in error:', error);
        
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            await incrementLoginAttempts(email);
        }
        
        return { 
            success: false, 
            error: getErrorMessage(error),
            code: error.code 
        };
    }
}

async function incrementLoginAttempts(email) {
    try {
        const usersSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            const userData = userDoc.data();
            const currentAttempts = userData.security?.loginAttempts || 0;
            const newAttempts = currentAttempts + 1;
            
            const updateData = {
                'security.loginAttempts': newAttempts,
                'security.lastFailedLogin': firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (newAttempts >= 5) {
                updateData['security.accountLocked'] = true;
                updateData['security.lockoutTime'] = firebase.firestore.FieldValue.serverTimestamp();
            }
            
            await userDoc.ref.update(updateData);
            
            await logSecurityEvent(userDoc.id, 'login_failed', {
                attempts: newAttempts,
                locked: newAttempts >= 5,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error tracking login attempts:', error);
    }
}

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

async function logSecurityEvent(userId, eventType, eventData) {
    try {
        await db.collection('users').doc(userId).collection('securityLog').add({
            eventType,
            ...eventData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging security event:', error);
    }
}

async function signOut() {
    try {
        const user = auth.currentUser;
        if (user) {
            await logSecurityEvent(user.uid, 'logout', {
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        await auth.signOut();
        clearUserCache();
        
        if (typeof(Storage) !== "undefined") {
            localStorage.removeItem('gymbag_user_preferences');
            sessionStorage.clear();
        }
        
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function resetPassword(email) {
    try {
        if (!isFirebaseInitialized()) {
            throw new Error('Firebase not initialized');
        }

        await auth.sendPasswordResetEmail(email, {
            url: `${window.location.origin}/signin-page.html?reset=true`,
            handleCodeInApp: false
        });
        
        const usersSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            await logSecurityEvent(userDoc.id, 'password_reset_requested', {
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        return { 
            success: true, 
            message: 'Password reset email sent! Please check your inbox and follow the instructions.' 
        };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function updateUserProfile(updates) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        if (!isFirebaseInitialized()) {
            throw new Error('Firebase not initialized');
        }

        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists) {
            throw new Error('User profile not found');
        }
        
        const batch = db.batch();
        const userUpdates = {};
        
        if (updates.displayName && updates.displayName !== user.displayName) {
            await user.updateProfile({ displayName: updates.displayName });
            userUpdates.displayName = updates.displayName;
        }
        
        if (updates.email && updates.email !== user.email) {
            await user.updateEmail(updates.email);
            userUpdates.email = updates.email;
            userUpdates.emailVerified = false;
            
            await user.sendEmailVerification();
        }
        
        if (updates.profile) {
            Object.keys(updates.profile).forEach(key => {
                userUpdates[`profile.${key}`] = updates.profile[key];
            });
        }
        
        if (updates.preferences) {
            Object.keys(updates.preferences).forEach(key => {
                userUpdates[`preferences.${key}`] = updates.preferences[key];
            });
        }
        
        if (updates.settings) {
            Object.keys(updates.settings).forEach(key => {
                userUpdates[`settings.${key}`] = updates.settings[key];
            });
        }
        
        userUpdates.lastModified = firebase.firestore.FieldValue.serverTimestamp();
        
        if (Object.keys(userUpdates).length > 0) {
            batch.update(userDocRef, userUpdates);
            await batch.commit();
            
            await logSecurityEvent(user.uid, 'profile_updated', {
                updatedFields: Object.keys(userUpdates),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function changePassword(currentPassword, newPassword) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, 
            currentPassword
        );
        
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
        
        await db.collection('users').doc(user.uid).update({
            'security.lastPasswordChange': firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await logSecurityEvent(user.uid, 'password_changed', {
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, message: 'Password changed successfully' };
    } catch (error) {
        console.error('Password change error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function deleteUserAccount() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        const userDocRef = db.collection('users').doc(user.uid);
        
        await logSecurityEvent(user.uid, 'account_deletion_requested', {
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        const batch = db.batch();
        
        const userCollections = ['dailyProgress', 'customTasks', 'goals', 'securityLog'];
        for (const collectionName of userCollections) {
            const snapshot = await userDocRef.collection(collectionName).get();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        
        batch.delete(userDocRef);
        await batch.commit();
        
        await user.delete();
        
        return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
        console.error('Account deletion error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function verifyEmail() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        await user.sendEmailVerification();
        return { success: true, message: 'Verification email sent' };
    } catch (error) {
        console.error('Email verification error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function checkEmailVerification() {
    try {
        const user = auth.currentUser;
        if (!user) return { success: false, verified: false };
        
        await user.reload();
        
        if (user.emailVerified) {
            await db.collection('users').doc(user.uid).update({
                emailVerified: true,
                'security.emailVerifiedAt': firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        return { success: true, verified: user.emailVerified };
    } catch (error) {
        console.error('Email verification check error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

let authStateInitialized = false;
let sessionTimeout = null;

auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('User is signed in:', user.email);
        
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            if (!userData) {
                console.error('User data not found, signing out');
                await signOut();
                return;
            }
            
            if (userData.security?.accountLocked) {
                console.error('Account is locked, signing out');
                await signOut();
                return;
            }
            
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem('gymbag_user_preferences', JSON.stringify({
                    theme: userData.preferences?.theme || 'light',
                    language: userData.preferences?.language || 'en',
                    notifications: userData.preferences?.notifications !== false
                }));
            }
            
            setupSessionTimeout();
            
            if (authStateInitialized) {
                const currentPath = window.location.pathname;
                
                if (!userData.emailVerified && !currentPath.includes('verify-email')) {
                    console.warn('Email not verified');
                }
                
                if (!userData.onboardingComplete && !currentPath.includes('onboarding')) {
                    if (currentPath.includes('signin-page.html') || 
                        currentPath.includes('signup-page.html')) {
                        window.location.href = 'onboarding.html';
                        return;
                    }
                }
                
                if (currentPath.includes('signin-page.html') || 
                    currentPath.includes('signup-page.html')) {
                    const redirectTo = userData.onboardingComplete ? 
                        'gymbag_dashboard.html' : 'onboarding.html';
                    window.location.href = redirectTo;
                }
            }
            
        } catch (error) {
            console.error('Error in auth state change:', error);
        }
        
    } else {
        console.log('User is signed out');
        clearSessionTimeout();
        clearUserCache();
        
        if (typeof(Storage) !== "undefined") {
            localStorage.removeItem('gymbag_user_preferences');
        }
        
        if (authStateInitialized) {
            const currentPath = window.location.pathname;
            const publicPages = ['signin-page.html', 'signup-page.html', 'forgot-password-page.html'];
            const isOnPublicPage = publicPages.some(page => currentPath.includes(page));
            
            if (!isOnPublicPage) {
                window.location.href = 'signin-page.html';
            }
        }
    }
    
    if (!authStateInitialized) {
        authStateInitialized = true;
    }
});

function setupSessionTimeout() {
    clearSessionTimeout();
    
    const THIRTY_MINUTES = 30 * 60 * 1000;
    
    sessionTimeout = setTimeout(async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await user.getIdToken(true);
                setupSessionTimeout();
            } catch (error) {
                console.log('Session expired, signing out');
                await signOut();
            }
        }
    }, THIRTY_MINUTES);
}

function clearSessionTimeout() {
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        sessionTimeout = null;
    }
}

function extendSession() {
    if (auth.currentUser) {
        setupSessionTimeout();
    }
}

document.addEventListener('click', extendSession);
document.addEventListener('keypress', extendSession);
document.addEventListener('scroll', extendSession);

window.addEventListener('beforeunload', () => {
    clearSessionTimeout();
});

async function getUserData(userId = null) {
    try {
        const user = auth.currentUser;
        if (!user && !userId) throw new Error('No user logged in');
        
        const targetUserId = userId || user.uid;
        const userDoc = await db.collection('users').doc(targetUserId).get();
        
        if (!userDoc.exists) {
            throw new Error('User data not found');
        }
        
        return { success: true, data: userDoc.data() };
    } catch (error) {
        console.error('Get user data error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function updateLastActivity() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        await db.collection('users').doc(user.uid).update({
            lastActivity: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Update last activity error:', error);
    }
}

setInterval(updateLastActivity, 5 * 60 * 1000);
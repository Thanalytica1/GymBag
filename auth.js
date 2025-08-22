async function signUp(email, password, displayName) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await user.updateProfile({
            displayName: displayName
        });
        
        await db.collection('users').doc(user.uid).set({
            email: email,
            displayName: displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            streak: 0,
            lastLoginDate: null,
            completedTasks: [],
            settings: {
                notifications: true,
                theme: 'light'
            }
        });
        
        return { success: true, user: user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

async function signIn(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        const today = new Date().toDateString();
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        let streak = userData.streak || 0;
        const lastLogin = userData.lastLoginDate;
        
        if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            const daysDiff = Math.floor((new Date() - lastLoginDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                streak++;
            } else if (daysDiff > 1) {
                streak = 1;
            }
        } else {
            streak = 1;
        }
        
        await db.collection('users').doc(user.uid).update({
            lastLoginDate: today,
            streak: streak,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, user: user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
}

async function updateUserProfile(updates) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        if (updates.displayName) {
            await user.updateProfile({ displayName: updates.displayName });
        }
        
        if (updates.email && updates.email !== user.email) {
            await user.updateEmail(updates.email);
        }
        
        const userUpdates = {};
        if (updates.displayName) userUpdates.displayName = updates.displayName;
        if (updates.email) userUpdates.email = updates.email;
        
        if (Object.keys(userUpdates).length > 0) {
            await db.collection('users').doc(user.uid).update(userUpdates);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
    }
}

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.email);
        if (window.location.pathname.includes('signin-page.html') || 
            window.location.pathname.includes('signup-page.html')) {
            window.location.href = 'gymbag_dashboard.html';
        }
    } else {
        console.log('User is signed out');
        if (!window.location.pathname.includes('signin-page.html') && 
            !window.location.pathname.includes('signup-page.html') &&
            !window.location.pathname.includes('forgot-password-page.html')) {
            window.location.href = 'signin-page.html';
        }
    }
});
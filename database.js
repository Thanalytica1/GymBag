async function saveDailyProgress(tasks) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        if (!isFirebaseInitialized()) {
            throw new Error('Firebase not initialized');
        }

        const today = new Date().toDateString();
        const completedCount = tasks.filter(t => t.completed).length;
        const completionRate = (completedCount / tasks.length) * 100;
        
        const progressData = {
            userId: user.uid,
            date: today,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            completedTasks: tasks.map(task => ({
                category: task.category || 'General',
                text: task.text,
                completed: task.completed,
                completedAt: task.completed ? firebase.firestore.FieldValue.serverTimestamp() : null
            })),
            completionRate: completionRate,
            totalTasks: tasks.length,
            completedTasksCount: completedCount,
            metadata: {
                version: '2.0',
                source: 'webapp',
                userAgent: navigator.userAgent.substring(0, 100)
            }
        };
        
        const batch = db.batch();
        
        const progressRef = db.collection('users').doc(user.uid).collection('dailyProgress').doc(today);
        batch.set(progressRef, progressData, { merge: true });
        
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        const updatedStats = {
            lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            'stats.totalTasksCompleted': (userData.stats?.totalTasksCompleted || 0) + completedCount,
            'stats.lastCompletionDate': today,
            'stats.averageCompletionRate': calculateAverageCompletionRate(userData, completionRate)
        };
        
        if (completionRate === 100) {
            updatedStats['stats.perfectDays'] = (userData.stats?.perfectDays || 0) + 1;
            updatedStats['stats.lastPerfectDay'] = today;
        }
        
        batch.update(userRef, updatedStats);
        
        await batch.commit();
        
        return { success: true, data: progressData };
    } catch (error) {
        console.error('Save progress error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

function calculateAverageCompletionRate(userData, newRate) {
    const currentAverage = userData.stats?.averageCompletionRate || 0;
    const totalDays = userData.stats?.totalDays || 0;
    
    return ((currentAverage * totalDays) + newRate) / (totalDays + 1);
}

async function getDailyProgress(date = null) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        if (!isFirebaseInitialized()) {
            throw new Error('Firebase not initialized');
        }

        const targetDate = date || new Date().toDateString();
        const doc = await db.collection('users').doc(user.uid).collection('dailyProgress').doc(targetDate).get();
        
        if (doc.exists) {
            const data = doc.data();
            
            if (data.userId !== user.uid) {
                throw new Error('Unauthorized access to progress data');
            }
            
            return { success: true, data: data };
        } else {
            return { success: true, data: null };
        }
    } catch (error) {
        console.error('Get progress error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function getWeeklyProgress() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        if (!isFirebaseInitialized()) {
            throw new Error('Firebase not initialized');
        }

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        const snapshot = await db.collection('users').doc(user.uid).collection('dailyProgress')
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .orderBy('timestamp', 'desc')
            .get();
        
        const weeklyData = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.userId === user.uid) {
                weeklyData.push(data);
            }
        });
        
        const weeklyStats = calculateWeeklyStats(weeklyData);
        
        return { success: true, data: weeklyData, stats: weeklyStats };
    } catch (error) {
        console.error('Get weekly progress error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

function calculateWeeklyStats(weeklyData) {
    if (weeklyData.length === 0) {
        return {
            averageCompletion: 0,
            totalDays: 0,
            perfectDays: 0,
            streak: 0,
            totalTasks: 0,
            completedTasks: 0
        };
    }
    
    const totalCompletion = weeklyData.reduce((sum, day) => sum + (day.completionRate || 0), 0);
    const perfectDays = weeklyData.filter(day => day.completionRate === 100).length;
    const totalTasks = weeklyData.reduce((sum, day) => sum + (day.totalTasks || 0), 0);
    const completedTasks = weeklyData.reduce((sum, day) => sum + (day.completedTasksCount || 0), 0);
    
    return {
        averageCompletion: Math.round(totalCompletion / weeklyData.length),
        totalDays: weeklyData.length,
        perfectDays: perfectDays,
        totalTasks: totalTasks,
        completedTasks: completedTasks,
        consistency: Math.round((weeklyData.length / 7) * 100)
    };
}

async function saveClient(clientData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        if (!isFirebaseInitialized()) {
            throw new Error('Firebase not initialized');
        }

        const userData = await getUserData();
        if (!userData.success || userData.data.userType !== 'trainer') {
            throw new Error('Only trainers can add clients');
        }
        
        const client = {
            ...clientData,
            trainerId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            metadata: {
                version: '2.0',
                createdBy: user.uid,
                source: 'trainer_portal'
            }
        };
        
        const docRef = await db.collection('users').doc(user.uid).collection('clients').add(client);
        
        await logSecurityEvent(user.uid, 'client_created', {
            clientId: docRef.id,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, clientId: docRef.id };
    } catch (error) {
        console.error('Save client error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function getClients() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        if (!isFirebaseInitialized()) {
            throw new Error('Firebase not initialized');
        }

        const userData = await getUserData();
        if (!userData.success || userData.data.userType !== 'trainer') {
            throw new Error('Only trainers can view clients');
        }
        
        const snapshot = await db.collection('users').doc(user.uid).collection('clients')
            .where('isActive', '==', true)
            .orderBy('createdAt', 'desc')
            .get();
        
        const clients = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.trainerId === user.uid) {
                clients.push({ id: doc.id, ...data });
            }
        });
        
        return { success: true, data: clients };
    } catch (error) {
        console.error('Get clients error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

async function updateClient(clientId, updates) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        await db.collection('clients').doc(clientId).update({
            ...updates,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Update client error:', error);
        return { success: false, error: error.message };
    }
}

async function deleteClient(clientId) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        await db.collection('clients').doc(clientId).delete();
        return { success: true };
    } catch (error) {
        console.error('Delete client error:', error);
        return { success: false, error: error.message };
    }
}

async function saveWorkoutPlan(workoutData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        const workout = {
            ...workoutData,
            trainerId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('workoutPlans').add(workout);
        return { success: true, workoutId: docRef.id };
    } catch (error) {
        console.error('Save workout error:', error);
        return { success: false, error: error.message };
    }
}

async function getWorkoutPlans(clientId = null) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        let query = db.collection('workoutPlans').where('trainerId', '==', user.uid);
        
        if (clientId) {
            query = query.where('clientId', '==', clientId);
        }
        
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        
        const workouts = [];
        snapshot.forEach(doc => {
            workouts.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: workouts };
    } catch (error) {
        console.error('Get workouts error:', error);
        return { success: false, error: error.message };
    }
}
async function saveDailyProgress(tasks) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        const today = new Date().toDateString();
        const progressData = {
            userId: user.uid,
            date: today,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            completedTasks: tasks,
            completionRate: (tasks.filter(t => t.completed).length / tasks.length) * 100
        };
        
        await db.collection('dailyProgress').doc(`${user.uid}_${today}`).set(progressData);
        
        await db.collection('users').doc(user.uid).update({
            lastActivity: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Save progress error:', error);
        return { success: false, error: error.message };
    }
}

async function getDailyProgress(date = null) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        const targetDate = date || new Date().toDateString();
        const doc = await db.collection('dailyProgress').doc(`${user.uid}_${targetDate}`).get();
        
        if (doc.exists) {
            return { success: true, data: doc.data() };
        } else {
            return { success: true, data: null };
        }
    } catch (error) {
        console.error('Get progress error:', error);
        return { success: false, error: error.message };
    }
}

async function getWeeklyProgress() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        const snapshot = await db.collection('dailyProgress')
            .where('userId', '==', user.uid)
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .orderBy('timestamp', 'desc')
            .get();
        
        const weeklyData = [];
        snapshot.forEach(doc => {
            weeklyData.push(doc.data());
        });
        
        return { success: true, data: weeklyData };
    } catch (error) {
        console.error('Get weekly progress error:', error);
        return { success: false, error: error.message };
    }
}

async function saveClient(clientData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        const client = {
            ...clientData,
            trainerId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('clients').add(client);
        return { success: true, clientId: docRef.id };
    } catch (error) {
        console.error('Save client error:', error);
        return { success: false, error: error.message };
    }
}

async function getClients() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        const snapshot = await db.collection('clients')
            .where('trainerId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        const clients = [];
        snapshot.forEach(doc => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: clients };
    } catch (error) {
        console.error('Get clients error:', error);
        return { success: false, error: error.message };
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
class ErrorMonitoring {
    constructor() {
        this.errorQueue = [];
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
        this.setupPeriodicReporting();
    }

    setupEventListeners() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'unhandled_promise_rejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushErrorQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this.errorQueue.length > 0) {
                this.flushErrorQueue();
            }
        });

        window.addEventListener('beforeunload', () => {
            if (this.errorQueue.length > 0) {
                this.sendBeacon();
            }
        });
    }

    logError(errorData) {
        const enhancedError = this.enhanceErrorData(errorData);
        
        console.error('Error logged:', enhancedError);
        
        this.errorQueue.push(enhancedError);
        
        if (this.isOnline && this.errorQueue.length >= 5) {
            this.flushErrorQueue();
        }
        
        this.storeErrorLocally(enhancedError);
    }

    enhanceErrorData(errorData) {
        const user = auth?.currentUser;
        
        return {
            ...errorData,
            userId: user?.uid || 'anonymous',
            userEmail: user?.email || null,
            sessionId: this.getSessionId(),
            buildVersion: '2.0.0',
            environment: window.location.hostname === 'localhost' ? 'development' : 'production',
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null,
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null,
            timing: performance.timing ? {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            } : null
        };
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('gymbag_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('gymbag_session_id', sessionId);
        }
        return sessionId;
    }

    async flushErrorQueue() {
        if (this.errorQueue.length === 0 || !this.isOnline) return;

        const errorsToSend = [...this.errorQueue];
        this.errorQueue = [];

        try {
            if (isFirebaseInitialized() && auth?.currentUser) {
                await this.sendToFirestore(errorsToSend);
            } else {
                await this.sendToExternalService(errorsToSend);
            }
            
            this.clearLocalErrors();
            
        } catch (error) {
            console.error('Failed to send errors:', error);
            this.errorQueue.unshift(...errorsToSend);
        }
    }

    async sendToFirestore(errors) {
        const user = auth.currentUser;
        if (!user) return;

        const batch = db.batch();
        
        errors.forEach(error => {
            const errorRef = db.collection('users').doc(user.uid).collection('errorLog').doc();
            batch.set(errorRef, {
                ...error,
                reportedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        
        await this.updateErrorStats(errors.length);
    }

    async sendToExternalService(errors) {
        // Fallback for when Firebase is not available
        try {
            const response = await fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ errors })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send to external service');
            }
        } catch (error) {
            console.warn('External error service unavailable');
            throw error;
        }
    }

    sendBeacon() {
        if (this.errorQueue.length === 0) return;

        const data = JSON.stringify({ errors: this.errorQueue });
        
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/errors/beacon', data);
        }
        
        this.errorQueue = [];
    }

    storeErrorLocally(error) {
        try {
            const localErrors = JSON.parse(localStorage.getItem('gymbag_local_errors') || '[]');
            localErrors.push(error);
            
            if (localErrors.length > 50) {
                localErrors.splice(0, localErrors.length - 50);
            }
            
            localStorage.setItem('gymbag_local_errors', JSON.stringify(localErrors));
        } catch (e) {
            console.warn('Failed to store error locally:', e);
        }
    }

    clearLocalErrors() {
        try {
            localStorage.removeItem('gymbag_local_errors');
        } catch (e) {
            console.warn('Failed to clear local errors:', e);
        }
    }

    async updateErrorStats(errorCount) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            await db.collection('users').doc(user.uid).update({
                'stats.totalErrors': firebase.firestore.FieldValue.increment(errorCount),
                'stats.lastErrorReport': firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.warn('Failed to update error stats:', error);
        }
    }

    setupPeriodicReporting() {
        setInterval(() => {
            if (this.errorQueue.length > 0 && this.isOnline) {
                this.flushErrorQueue();
            }
        }, 30000); // Send errors every 30 seconds
    }

    logCustomError(message, context = {}) {
        this.logError({
            type: 'custom_error',
            message: message,
            context: context,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });
    }

    logPerformanceIssue(metric, value, threshold) {
        if (value > threshold) {
            this.logError({
                type: 'performance_issue',
                message: `Performance threshold exceeded: ${metric}`,
                metric: metric,
                value: value,
                threshold: threshold,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
        }
    }

    logUserAction(action, data = {}) {
        try {
            const actionLog = {
                type: 'user_action',
                action: action,
                data: data,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userId: auth?.currentUser?.uid || 'anonymous'
            };

            if (this.isOnline && auth?.currentUser) {
                db.collection('users').doc(auth.currentUser.uid).collection('actionLog').add(actionLog);
            }
        } catch (error) {
            console.warn('Failed to log user action:', error);
        }
    }

    async getErrorReport() {
        try {
            const user = auth.currentUser;
            if (!user) return { errors: [], stats: {} };

            const errorsSnapshot = await db.collection('users').doc(user.uid).collection('errorLog')
                .orderBy('reportedAt', 'desc')
                .limit(100)
                .get();

            const errors = [];
            errorsSnapshot.forEach(doc => {
                errors.push({ id: doc.id, ...doc.data() });
            });

            const userDoc = await db.collection('users').doc(user.uid).get();
            const stats = userDoc.data()?.stats || {};

            return { errors, stats };
        } catch (error) {
            console.error('Failed to get error report:', error);
            return { errors: [], stats: {} };
        }
    }
}

class PerformanceMonitoring {
    constructor() {
        this.metrics = [];
        this.setupObservers();
    }

    setupObservers() {
        if ('PerformanceObserver' in window) {
            this.observeLCP();
            this.observeFID();
            this.observeCLS();
            this.observeFCP();
            this.observeTTFB();
        }

        this.observeResourceTiming();
        this.observeNavigationTiming();
    }

    observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.recordMetric('LCP', lastEntry.startTime);
                
                if (lastEntry.startTime > 2500) {
                    errorMonitor.logPerformanceIssue('LCP', lastEntry.startTime, 2500);
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
            console.warn('LCP observation not supported');
        }
    }

    observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.recordMetric('FID', entry.processingStart - entry.startTime);
                    
                    if (entry.processingStart - entry.startTime > 100) {
                        errorMonitor.logPerformanceIssue('FID', entry.processingStart - entry.startTime, 100);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (error) {
            console.warn('FID observation not supported');
        }
    }

    observeCLS() {
        try {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.recordMetric('CLS', clsValue);
                
                if (clsValue > 0.1) {
                    errorMonitor.logPerformanceIssue('CLS', clsValue, 0.1);
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('CLS observation not supported');
        }
    }

    observeFCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        this.recordMetric('FCP', entry.startTime);
                        
                        if (entry.startTime > 1800) {
                            errorMonitor.logPerformanceIssue('FCP', entry.startTime, 1800);
                        }
                    }
                });
            });
            
            observer.observe({ entryTypes: ['paint'] });
        } catch (error) {
            console.warn('FCP observation not supported');
        }
    }

    observeTTFB() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        const ttfb = entry.responseStart - entry.requestStart;
                        this.recordMetric('TTFB', ttfb);
                        
                        if (ttfb > 800) {
                            errorMonitor.logPerformanceIssue('TTFB', ttfb, 800);
                        }
                    }
                });
            });
            
            observer.observe({ entryTypes: ['navigation'] });
        } catch (error) {
            console.warn('TTFB observation not supported');
        }
    }

    observeResourceTiming() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    const duration = entry.responseEnd - entry.startTime;
                    
                    if (duration > 3000) {
                        errorMonitor.logPerformanceIssue('Slow Resource', duration, 3000);
                    }
                    
                    if (entry.transferSize > 1024 * 1024) { // 1MB
                        errorMonitor.logPerformanceIssue('Large Resource', entry.transferSize, 1024 * 1024);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        } catch (error) {
            console.warn('Resource timing observation not supported');
        }
    }

    observeNavigationTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                
                this.recordMetric('Page Load Time', loadTime);
                
                if (loadTime > 5000) {
                    errorMonitor.logPerformanceIssue('Page Load Time', loadTime, 5000);
                }
            }, 0);
        });
    }

    recordMetric(name, value) {
        this.metrics.push({
            name,
            value,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });

        if (this.metrics.length > 100) {
            this.metrics.splice(0, this.metrics.length - 100);
        }
    }

    getMetrics() {
        return [...this.metrics];
    }

    async reportMetrics() {
        try {
            const user = auth?.currentUser;
            if (!user || this.metrics.length === 0) return;

            await db.collection('users').doc(user.uid).collection('performanceMetrics').add({
                metrics: this.metrics,
                reportedAt: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            });

            this.metrics = [];
        } catch (error) {
            console.warn('Failed to report performance metrics:', error);
        }
    }
}

// Initialize monitoring
const errorMonitor = new ErrorMonitoring();
const performanceMonitor = new PerformanceMonitoring();

// Report performance metrics every 5 minutes
setInterval(() => {
    performanceMonitor.reportMetrics();
}, 5 * 60 * 1000);

// Enhanced console methods for better debugging
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
};

console.error = function(...args) {
    originalConsole.error.apply(console, args);
    
    const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    errorMonitor.logCustomError(message, {
        level: 'error',
        args: args
    });
};

console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
    
    const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    errorMonitor.logCustomError(message, {
        level: 'warning',
        args: args
    });
};

// Export for global use
window.errorMonitor = errorMonitor;
window.performanceMonitor = performanceMonitor;
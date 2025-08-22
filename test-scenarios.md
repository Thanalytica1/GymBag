# GymBag v2.0 Test Scenarios

## Authentication Flow Testing

### 1. User Registration Flow

#### Test Case 1.1: Basic Registration
**Steps:**
1. Navigate to `signup-page.html`
2. Enter valid email, password, and display name
3. Submit registration form

**Expected Results:**
- User account created in Firebase Auth
- User profile document created in Firestore
- Email verification sent
- User redirected to onboarding page
- Default tasks and goals created

**Data Validation:**
```javascript
// Verify user document structure
{
  uid: "user_unique_id",
  email: "test@example.com",
  displayName: "Test User",
  userType: null, // Set during onboarding
  subscriptionTier: "free",
  emailVerified: false,
  onboardingComplete: false,
  createdAt: Timestamp,
  stats: { streak: 0, totalSessions: 0, ... },
  preferences: { theme: "light", notifications: true, ... },
  security: { twoFactorEnabled: false, loginAttempts: 0, ... }
}
```

#### Test Case 1.2: Registration with Invalid Data
**Steps:**
1. Try registration with invalid email formats
2. Try registration with weak passwords
3. Try registration with existing email

**Expected Results:**
- Appropriate error messages displayed
- No user account created
- User remains on registration page

#### Test Case 1.3: Email Verification
**Steps:**
1. Complete registration
2. Check email for verification link
3. Click verification link
4. Return to application

**Expected Results:**
- Email verification status updated in Firestore
- User can access full features
- `emailVerified` field set to true

### 2. Authentication State Management

#### Test Case 2.1: Session Persistence
**Steps:**
1. Sign in with "Remember Me" checked
2. Close browser
3. Reopen browser and navigate to app

**Expected Results:**
- User remains signed in
- Session restored automatically
- User preferences applied

#### Test Case 2.2: Session Timeout
**Steps:**
1. Sign in without "Remember Me"
2. Wait for session timeout (30 minutes)
3. Try to perform an action

**Expected Results:**
- Session expires automatically
- User redirected to sign-in page
- Security event logged

#### Test Case 2.3: Account Lockout
**Steps:**
1. Attempt sign-in with wrong password 5 times
2. Try to sign in with correct password

**Expected Results:**
- Account locked after 5 failed attempts
- Error message indicating lockout
- Security event logged with lockout reason

### 3. User Data Isolation Testing

#### Test Case 3.1: Basic Data Isolation
**Setup:**
- Create User A with email userA@test.com
- Create User B with email userB@test.com

**Steps:**
1. Sign in as User A
2. Create daily progress data
3. Create custom tasks
4. Set personal goals
5. Sign out and sign in as User B
6. Try to access User A's data

**Expected Results:**
- User B cannot see User A's progress
- User B cannot access User A's tasks
- User B cannot view User A's goals
- Each user sees only their own data

#### Test Case 3.2: Firestore Security Rules Validation
**Test with Firebase Emulator:**
```javascript
// Test that users cannot read other users' data
await assertFails(
  db.collection('users').doc('userA_id').get()
  // When authenticated as userB
);

// Test that users can read their own data
await assertSucceeds(
  db.collection('users').doc('userA_id').get()
  // When authenticated as userA
);
```

#### Test Case 3.3: Cross-User Data Access Attempts
**Steps:**
1. Sign in as User A
2. Manually modify client-side code to request User B's data
3. Attempt database operations

**Expected Results:**
- All unauthorized requests rejected by Firestore rules
- Security events logged for suspicious activity
- Error messages displayed appropriately

### 4. Onboarding Flow Testing

#### Test Case 4.1: Complete Onboarding Flow
**Steps:**
1. Register new user
2. Complete all onboarding steps:
   - Select user type (client/trainer)
   - Choose fitness goals
   - Set preferences
   - Complete profile
3. Finish onboarding

**Expected Results:**
- User type saved to profile
- Custom tasks generated based on goals
- Initial goals created
- `onboardingComplete` set to true
- User redirected to dashboard

#### Test Case 4.2: Onboarding Data Validation
**Steps:**
1. Start onboarding
2. Try to skip required steps
3. Enter invalid data

**Expected Results:**
- Cannot proceed without required information
- Validation errors displayed
- Data sanitized before saving

### 5. Admin Panel Testing

#### Test Case 5.1: Admin Access Control
**Setup:**
- Create admin user with role: "admin"
- Create regular user with role: null

**Steps:**
1. Sign in as regular user
2. Try to access `/admin.html`
3. Sign out and sign in as admin
4. Access admin panel

**Expected Results:**
- Regular user denied access to admin panel
- Admin user can access all admin features
- User management functions work correctly

#### Test Case 5.2: Admin Operations
**Steps:**
1. Sign in as admin
2. View user list
3. View user details
4. Suspend a user account
5. View security logs

**Expected Results:**
- All user data visible to admin
- User operations function correctly
- Security events properly logged
- Suspended users cannot sign in

### 6. Error Handling and Monitoring

#### Test Case 6.1: Error Collection
**Steps:**
1. Trigger JavaScript errors intentionally
2. Cause network failures
3. Create Firebase permission errors

**Expected Results:**
- All errors captured by monitoring system
- Error details saved to user's error log
- Performance metrics collected

#### Test Case 6.2: Offline Functionality
**Steps:**
1. Sign in to application
2. Disconnect from internet
3. Try to complete tasks
4. Reconnect to internet

**Expected Results:**
- Application continues to function offline
- Changes queued for synchronization
- Data syncs when connection restored

### 7. Security Testing

#### Test Case 7.1: SQL Injection Prevention
**Steps:**
1. Try to inject malicious data in form fields
2. Attempt NoSQL injection attacks
3. Test input sanitization

**Expected Results:**
- All malicious input sanitized
- No unauthorized database access
- Security events logged

#### Test Case 7.2: XSS Prevention
**Steps:**
1. Try to inject script tags in user inputs
2. Attempt to execute malicious JavaScript
3. Test data rendering in UI

**Expected Results:**
- Script tags escaped or removed
- No malicious code execution
- User data safely rendered

#### Test Case 7.3: Authentication Bypass Attempts
**Steps:**
1. Try to access protected pages without authentication
2. Attempt to modify authentication tokens
3. Try to escalate user privileges

**Expected Results:**
- All unauthorized access attempts blocked
- Authentication required for protected resources
- Role-based access control enforced

### 8. Performance Testing

#### Test Case 8.1: Page Load Performance
**Metrics to Track:**
- First Contentful Paint (FCP) < 1.8s
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1

#### Test Case 8.2: Database Query Performance
**Steps:**
1. Load user with extensive data
2. Measure query response times
3. Test with multiple concurrent users

**Expected Results:**
- Database queries complete within reasonable time
- No significant performance degradation
- Efficient data fetching and caching

### 9. Integration Testing

#### Test Case 9.1: End-to-End User Journey
**Complete User Flow:**
1. User registers account
2. Verifies email
3. Completes onboarding
4. Sets up profile
5. Completes daily tasks
6. Views progress dashboard
7. Updates goals
8. Changes preferences
9. Signs out

**Expected Results:**
- All features work seamlessly together
- Data consistency maintained throughout
- No errors or data loss

#### Test Case 9.2: Trainer-Specific Features
**Steps (for trainer users):**
1. Complete trainer onboarding
2. Add clients
3. Create workout plans
4. Monitor client progress
5. Update client information

**Expected Results:**
- Trainer features accessible only to trainer users
- Client data properly isolated
- Trainer-client relationships maintained

### 10. Data Migration and Backup Testing

#### Test Case 10.1: Data Export
**Steps:**
1. Create comprehensive user data
2. Request data export
3. Verify exported data completeness

**Expected Results:**
- All user data included in export
- Data format is valid JSON
- Export includes all subcollections

#### Test Case 10.2: Account Deletion
**Steps:**
1. Create user with extensive data
2. Request account deletion
3. Verify data removal

**Expected Results:**
- All user data completely removed
- User authentication record deleted
- No orphaned data remains

## Testing Checklist

### Pre-Testing Setup
- [ ] Firebase emulator configured
- [ ] Test database with clean state
- [ ] Error monitoring enabled
- [ ] Test accounts created (regular user, trainer, admin)

### Authentication Testing
- [ ] User registration with validation
- [ ] Email verification flow
- [ ] Sign-in with remember me
- [ ] Password reset functionality
- [ ] Account lockout mechanism
- [ ] Session timeout handling

### Data Isolation Testing
- [ ] User-specific data access
- [ ] Firestore security rules
- [ ] Cross-user access prevention
- [ ] Admin access controls

### Feature Testing
- [ ] Onboarding completion
- [ ] Task customization
- [ ] Goal setting and tracking
- [ ] Progress synchronization
- [ ] Preference management

### Security Testing
- [ ] Input validation and sanitization
- [ ] Authentication bypass prevention
- [ ] Role-based access control
- [ ] Error handling security

### Performance Testing
- [ ] Page load times
- [ ] Database query performance
- [ ] Concurrent user handling
- [ ] Memory usage optimization

### Integration Testing
- [ ] End-to-end user flows
- [ ] Feature interactions
- [ ] Data consistency
- [ ] Error recovery

## Testing Tools and Commands

### Firebase Emulator Testing
```bash
# Start Firebase emulators
firebase emulators:start

# Run security rules tests
firebase emulators:exec --only firestore "npm test"
```

### Performance Testing
```javascript
// Measure Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Error Testing
```javascript
// Trigger test errors
window.errorMonitor.logCustomError('Test error', { context: 'testing' });

// Test performance monitoring
window.performanceMonitor.logPerformanceIssue('test_metric', 5000, 1000);
```

## Expected Test Results Summary

✅ **Authentication**: Secure user registration, sign-in, and session management
✅ **Data Isolation**: Complete separation of user data with proper access controls
✅ **Security**: Protection against common web vulnerabilities and attacks
✅ **Performance**: Fast loading times and responsive user interface
✅ **Error Handling**: Comprehensive error capture and user-friendly error messages
✅ **Admin Features**: Functional admin panel with proper access controls
✅ **User Experience**: Smooth onboarding and intuitive interface
✅ **Data Integrity**: Consistent data storage and retrieval across all features
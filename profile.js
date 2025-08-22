async function initializeProfile() {
    try {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'signin-page.html';
            return;
        }

        const userData = await getUserData();
        if (!userData.success) {
            throw new Error('Failed to load user profile');
        }

        populateProfileForm(userData.data);
        setupProfileEventListeners();
        loadProfilePicture(userData.data.profile?.avatar);
        
    } catch (error) {
        console.error('Profile initialization error:', error);
        showProfileError('Failed to load profile data');
    }
}

function populateProfileForm(userData) {
    const fields = {
        'profile-display-name': userData.displayName,
        'profile-email': userData.email,
        'profile-phone': userData.profile?.contactInfo?.phone,
        'profile-bio': userData.profile?.bio,
        'profile-user-type': userData.userType,
        'profile-subscription': userData.subscriptionTier,
        'theme-preference': userData.preferences?.theme,
        'notification-email': userData.settings?.emailNotifications,
        'notification-push': userData.settings?.pushNotifications,
        'privacy-level': userData.settings?.privacy,
        'data-sharing': userData.settings?.dataSharing
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value || '';
            }
        }
    });

    if (userData.profile?.specialties) {
        populateSpecialties(userData.profile.specialties);
    }

    if (userData.profile?.certifications) {
        populateCertifications(userData.profile.certifications);
    }
}

function setupProfileEventListeners() {
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', handleSaveProfile);
    }

    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handleChangePassword);
    }

    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }

    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
    if (uploadAvatarBtn) {
        uploadAvatarBtn.addEventListener('change', handleAvatarUpload);
    }

    const addSpecialtyBtn = document.getElementById('add-specialty-btn');
    if (addSpecialtyBtn) {
        addSpecialtyBtn.addEventListener('click', addSpecialtyField);
    }

    const addCertificationBtn = document.getElementById('add-certification-btn');
    if (addCertificationBtn) {
        addCertificationBtn.addEventListener('click', addCertificationField);
    }

    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', handleDataExport);
    }
}

async function handleSaveProfile() {
    try {
        showProfileLoading(true);

        const formData = {
            displayName: document.getElementById('profile-display-name')?.value,
            profile: {
                bio: document.getElementById('profile-bio')?.value,
                contactInfo: {
                    phone: document.getElementById('profile-phone')?.value
                },
                specialties: getSpecialties(),
                certifications: getCertifications()
            },
            preferences: {
                theme: document.getElementById('theme-preference')?.value
            },
            settings: {
                emailNotifications: document.getElementById('notification-email')?.checked,
                pushNotifications: document.getElementById('notification-push')?.checked,
                privacy: document.getElementById('privacy-level')?.value,
                dataSharing: document.getElementById('data-sharing')?.checked
            }
        };

        const result = await updateUserProfile(formData);

        if (result.success) {
            showProfileSuccess('Profile updated successfully!');
            
            if (formData.preferences.theme) {
                applyTheme(formData.preferences.theme);
            }
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('Save profile error:', error);
        showProfileError('Failed to save profile: ' + error.message);
    } finally {
        showProfileLoading(false);
    }
}

async function handleChangePassword() {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = prompt('Enter your new password:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirm your new password:');
    if (newPassword !== confirmPassword) {
        showProfileError('Passwords do not match');
        return;
    }

    try {
        showProfileLoading(true);
        const result = await changePassword(currentPassword, newPassword);

        if (result.success) {
            showProfileSuccess('Password changed successfully!');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Change password error:', error);
        showProfileError('Failed to change password: ' + error.message);
    } finally {
        showProfileLoading(false);
    }
}

async function handleDeleteAccount() {
    const confirmation = prompt('This action cannot be undone. Type "DELETE" to confirm:');
    if (confirmation !== 'DELETE') return;

    const password = prompt('Enter your password to confirm account deletion:');
    if (!password) return;

    try {
        showProfileLoading(true);
        
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        await user.reauthenticateWithCredential(credential);

        const result = await deleteUserAccount();

        if (result.success) {
            alert('Account deleted successfully');
            window.location.href = 'signin-page.html';
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Delete account error:', error);
        showProfileError('Failed to delete account: ' + error.message);
    } finally {
        showProfileLoading(false);
    }
}

async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showProfileError('File size must be less than 5MB');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showProfileError('Please select an image file');
        return;
    }

    try {
        showProfileLoading(true);
        
        const user = auth.currentUser;
        const fileName = `avatars/${user.uid}/${Date.now()}_${file.name}`;
        const uploadTask = storage.ref(fileName).put(file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                updateUploadProgress(progress);
            },
            (error) => {
                console.error('Upload error:', error);
                showProfileError('Failed to upload avatar');
            },
            async () => {
                try {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    
                    const result = await updateUserProfile({
                        profile: { avatar: downloadURL }
                    });

                    if (result.success) {
                        loadProfilePicture(downloadURL);
                        showProfileSuccess('Avatar updated successfully!');
                    } else {
                        throw new Error(result.error);
                    }
                } catch (error) {
                    showProfileError('Failed to save avatar: ' + error.message);
                }
            }
        );

    } catch (error) {
        console.error('Avatar upload error:', error);
        showProfileError('Failed to upload avatar: ' + error.message);
    } finally {
        showProfileLoading(false);
    }
}

function loadProfilePicture(avatarUrl) {
    const avatarImg = document.getElementById('profile-avatar');
    if (avatarImg && avatarUrl) {
        avatarImg.src = avatarUrl;
        avatarImg.style.display = 'block';
    }
}

function populateSpecialties(specialties) {
    const container = document.getElementById('specialties-container');
    if (!container) return;

    container.innerHTML = '';
    specialties.forEach(specialty => {
        addSpecialtyField(specialty);
    });
}

function populateCertifications(certifications) {
    const container = document.getElementById('certifications-container');
    if (!container) return;

    container.innerHTML = '';
    certifications.forEach(cert => {
        addCertificationField(cert);
    });
}

function addSpecialtyField(value = '') {
    const container = document.getElementById('specialties-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'specialty-item';
    div.innerHTML = `
        <input type="text" value="${value}" class="specialty-input" placeholder="Enter specialty">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

function addCertificationField(cert = { name: '', issuer: '', year: '' }) {
    const container = document.getElementById('certifications-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'certification-item';
    div.innerHTML = `
        <input type="text" value="${cert.name}" class="cert-name" placeholder="Certification name">
        <input type="text" value="${cert.issuer}" class="cert-issuer" placeholder="Issuing organization">
        <input type="number" value="${cert.year}" class="cert-year" placeholder="Year" min="1900" max="2030">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

function getSpecialties() {
    const inputs = document.querySelectorAll('.specialty-input');
    return Array.from(inputs).map(input => input.value).filter(value => value.trim());
}

function getCertifications() {
    const items = document.querySelectorAll('.certification-item');
    return Array.from(items).map(item => ({
        name: item.querySelector('.cert-name')?.value || '',
        issuer: item.querySelector('.cert-issuer')?.value || '',
        year: parseInt(item.querySelector('.cert-year')?.value) || null
    })).filter(cert => cert.name.trim());
}

async function handleDataExport() {
    try {
        showProfileLoading(true);

        const user = auth.currentUser;
        const userData = await getUserData();
        
        if (!userData.success) {
            throw new Error('Failed to retrieve user data');
        }

        const progressData = await getWeeklyProgress();
        const clientsData = userData.data.userType === 'trainer' ? await getClients() : { data: [] };

        const exportData = {
            profile: userData.data,
            progress: progressData.data || [],
            clients: clientsData.data || [],
            exportDate: new Date().toISOString(),
            version: '2.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `gymbag_data_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        showProfileSuccess('Data exported successfully!');

    } catch (error) {
        console.error('Data export error:', error);
        showProfileError('Failed to export data: ' + error.message);
    } finally {
        showProfileLoading(false);
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (typeof(Storage) !== "undefined") {
        const preferences = JSON.parse(localStorage.getItem('gymbag_user_preferences') || '{}');
        preferences.theme = theme;
        localStorage.setItem('gymbag_user_preferences', JSON.stringify(preferences));
    }
}

function showProfileLoading(show) {
    const loader = document.getElementById('profile-loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

function showProfileSuccess(message) {
    showProfileMessage(message, 'success');
}

function showProfileError(message) {
    showProfileMessage(message, 'error');
}

function showProfileMessage(message, type) {
    const messageDiv = document.getElementById('profile-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `profile-message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

function updateUploadProgress(progress) {
    const progressBar = document.getElementById('upload-progress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.style.display = 'block';
        
        if (progress >= 100) {
            setTimeout(() => {
                progressBar.style.display = 'none';
            }, 1000);
        }
    }
}

if (window.location.pathname.includes('profile.html')) {
    document.addEventListener('DOMContentLoaded', initializeProfile);
}
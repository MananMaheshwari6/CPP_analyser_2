// Handle authentication-related functionality
class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.headerUserInfo = document.getElementById('user-info');
        this.headerAuthButtons = document.getElementById('auth-header-buttons');

        // Initialize
        this.init();
    }

    // Initialize auth state
    async init() {
        // Try to get user from localStorage first for quick UI update
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                this.user = JSON.parse(storedUser);
                this.isAuthenticated = true;
                this.updateUI();
            } catch (e) {
                console.error('Failed to parse stored user data');
                localStorage.removeItem('user');
            }
        }

        // Validate with server
        await this.checkAuthStatus();
    }

    // Check authentication status with server
    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                this.user = userData;
                this.isAuthenticated = true;

                // Update localStorage
                localStorage.setItem('user', JSON.stringify({
                    id: userData._id,
                    username: userData.username
                }));
            } else {
                // Not authenticated
                this.user = null;
                this.isAuthenticated = false;
                localStorage.removeItem('user');
            }

            this.updateUI();

        } catch (error) {
            console.error('Error checking authentication status:', error);
            this.isAuthenticated = false;
            this.user = null;
            this.updateUI();
        }
    }

    // Logout function
    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            // Clear user data
            this.user = null;
            this.isAuthenticated = false;
            localStorage.removeItem('user');

            // Update UI
            this.updateUI();

            // Redirect to login page if on a protected page
            if (window.location.pathname.includes('history.html')) {
                window.location.href = 'login.html';
            }

        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Update UI based on authentication state
    updateUI() {
        if (!this.headerUserInfo || !this.headerAuthButtons) return;

        if (this.isAuthenticated && this.user) {
            // Show user info
            this.headerUserInfo.classList.remove('hidden');
            this.headerAuthButtons.classList.add('hidden');

            // Update username display
            const usernameElements = document.querySelectorAll('.username-display');
            usernameElements.forEach(el => {
                el.textContent = this.user.username;
            });

            // Set first letter of username for avatar
            const userAvatars = document.querySelectorAll('.user-avatar');
            userAvatars.forEach(avatar => {
                avatar.textContent = this.user.username.charAt(0).toUpperCase();
            });

        } else {
            // Show auth buttons
            this.headerUserInfo.classList.add('hidden');
            this.headerAuthButtons.classList.remove('hidden');
        }

        // Trigger an event for other components that need to react to auth changes
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: this.isAuthenticated, user: this.user }
        }));
    }

    // Toggle user dropdown
    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    // Hide user dropdown when clicking outside
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('user-dropdown');
            const userInfo = document.getElementById('user-info');

            if (dropdown && !dropdown.classList.contains('hidden')) {
                if (!dropdown.contains(e.target) && !userInfo.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            }
        });
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();

    // Setup event listeners for user dropdown
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.addEventListener('click', () => {
            window.authManager.toggleUserDropdown();
        });
    }

    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.authManager.logout();
        });
    }

    // Setup click outside for dropdown
    window.authManager.setupClickOutside();
});

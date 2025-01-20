// public/auth.js
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelector('.nav__links');
    let isLoggedIn = false;
    
    // Function to check login status
    async function checkLoginStatus() {
        try {
            const response = await fetch('/check-session');
            const data = await response.json();
            isLoggedIn = data.isLoggedIn;
            
            if (data.isLoggedIn) {
                updateUIForLoggedInUser();
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    }
    
    // Function to update UI for logged-in user
    function updateUIForLoggedInUser() {
        // Find the login and signup buttons
        const loginBtn = navLinks.querySelector('a[href="login.html"]')?.parentElement;
        const signupBtn = navLinks.querySelector('a[href="signup.html"]')?.parentElement;
        
        // Remove login and signup buttons if they exist
        if (loginBtn) loginBtn.remove();
        if (signupBtn) signupBtn.remove();
        
        // Add logout button if it doesn't exist
        if (!navLinks.querySelector('.logout-btn')) {
            const logoutLi = document.createElement('li');
            logoutLi.className = 'link';
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'btn logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', handleLogout);
            logoutLi.appendChild(logoutBtn);
            navLinks.appendChild(logoutLi);
        }
    }
    
    // Function to handle logout
    async function handleLogout(e) {
        if (e) e.preventDefault();
        try {
            const response = await fetch('/logout');
            const data = await response.json();
            
            if (data.success) {
                isLoggedIn = false;
                window.location.href = '/';
            } else {
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
        }
    }

    // Handle tab/window close
    window.addEventListener('beforeunload', async (e) => {
        if (isLoggedIn) {
            // Send a synchronous request to logout
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/logout', false);  // false makes it synchronous
            xhr.send();
        }
    });

    // Handle visibility change (tab switch/minimize)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && isLoggedIn) {
            navigator.sendBeacon('/logout');
        }
    });

    // Periodic session check
    setInterval(async () => {
        if (isLoggedIn) {
            try {
                const response = await fetch('/check-session');
                const data = await response.json();
                if (!data.isLoggedIn && isLoggedIn) {
                    // Session expired, reload page
                    window.location.reload();
                }
            } catch (error) {
                console.error('Session check error:', error);
            }
        }
    }, 60000); // Check every minute

    // Initial check
    checkLoginStatus();
});
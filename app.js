// Wait for the page to fully load before running any code
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded!');

    // Initialize Supabase - REPLACE THESE WITH YOUR ACTUAL VALUES
    const SUPABASE_URL = 'https://ogfwvffqoofacdoaavrf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nZnd2ZmZxb29mYWNkb2FhdnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzQ0NTYsImV4cCI6MjA4NTIxMDQ1Nn0.XHCkZgNLYq9aBXMV_VFOh8XrC4jO9JUxcAdrqO7UIu4';

    console.log('Creating Supabase client...');
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client created!');

    // Get DOM elements
    const authSection = document.getElementById('auth-section');
    const appSection = document.getElementById('app-section');
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signoutBtn = document.getElementById('signout-btn');
    const toggleSignup = document.getElementById('toggle-signup');

    console.log('Toggle signup element:', toggleSignup);

    let isSignUp = false;

    // Toggle between sign in and sign up
    function toggleAuthMode() {
    console.log('Toggle clicked!');
    isSignUp = !isSignUp;
    
    const h2 = authSection.querySelector('h2');
    const button = authForm.querySelector('button');
    const p = authSection.querySelector('p');
    
    // Get the extra sign-up fields
    const firstNameField = document.getElementById('first-name-field');
    const lastNameField = document.getElementById('last-name-field');
    const confirmPasswordField = document.getElementById('confirm-password-field');
    const firstNameInput = document.getElementById('first-name');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    if (isSignUp) {
        h2.textContent = 'Sign Up';
        button.textContent = 'Sign Up';
        p.innerHTML = 'Already have an account? <a href="#" id="toggle-signup">Sign In</a>';
        
        // Show sign-up fields
        firstNameField.style.display = 'block';
        lastNameField.style.display = 'block';
        confirmPasswordField.style.display = 'block';
        
        // Make fields required for sign up
        firstNameInput.required = true;
        confirmPasswordInput.required = true;
        
    } else {
        h2.textContent = 'Sign In';
        button.textContent = 'Sign In';
        p.innerHTML = 'Don\'t have an account? <a href="#" id="toggle-signup">Sign Up</a>';
        
        // Hide sign-up fields
        firstNameField.style.display = 'none';
        lastNameField.style.display = 'none';
        confirmPasswordField.style.display = 'none';
        
        // Remove required for sign in
        firstNameInput.required = false;
        confirmPasswordInput.required = false;
    }
    
    // Re-attach listener to the new link
    const newToggle = document.getElementById('toggle-signup');
    newToggle.addEventListener('click', handleToggleClick);
}

    function handleToggleClick(e) {
        console.log('Link clicked!');
        e.preventDefault();
        toggleAuthMode();
    }

    // Attach initial listener
    if (toggleSignup) {
        console.log('Attaching click listener to toggle signup link...');
        toggleSignup.addEventListener('click', handleToggleClick);
        console.log('Listener attached!');
    } else {
        console.error('ERROR: Could not find toggle-signup element!');
    }

    // Handle authentication
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted! Mode:', isSignUp ? 'Sign Up' : 'Sign In');
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    // Get sign-up specific fields
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    console.log('Attempting authentication...');
    
    try {
        if (isSignUp) {
            // Validate passwords match
            if (password !== confirmPasswordInput.value) {
                alert('Passwords do not match! Please try again.');
                return;
            }
            
            // Validate first name
            const firstName = firstNameInput.value.trim();
            if (!firstName) {
                alert('Please enter your first name.');
                return;
            }
            
            const lastName = lastNameInput.value.trim();
            
            // Sign up with user metadata
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName
                    }
                }
            });
            
            if (error) throw error;
            console.log('Sign up successful!', data);
            alert('Account created successfully!');
            
            // If auto-logged in, show app
            if (data.user) {
                showApp();
            }
        } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                
                if (error) throw error;
                console.log('Sign in successful!', data);
                showApp();
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert('Error: ' + error.message);
        }
    });

    // Handle sign out
    signoutBtn.addEventListener('click', async () => {
        console.log('Signing out...');
        await supabase.auth.signOut();
        showAuth();
    });

    // Show/hide sections
    function showAuth() {
    authSection.style.display = 'block';
    appSection.style.display = 'none';
    // Clear communications list when signing out
    communicationsList.innerHTML = '<p>No communications logged yet.</p>';
}

   async function showApp() {
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    
    // Get and display current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Get user's first name from metadata
        const firstName = user.user_metadata?.first_name || user.email.split('@')[0];
        const welcomeText = document.querySelector('.header p');
        welcomeText.innerHTML = `Welcome back, <strong>${firstName}</strong>! <button id="signout-btn">Sign Out</button>`;
        
        // Re-attach sign out listener
        document.getElementById('signout-btn').addEventListener('click', async () => {
            console.log('Signing out...');
            logForm.reset();
            charCounter.textContent = '0';
            await supabase.auth.signOut();
            showAuth();
        });
    }
    
    loadCommunications();
}
// Get form elements
const logForm = document.getElementById('log-form');
const studentNameInput = document.getElementById('student-name');
const parentNameInput = document.getElementById('parent-name');
const methodSelect = document.getElementById('method');
const topicSelect = document.getElementById('topic');
const summaryTextarea = document.getElementById('summary');
const followUpCheckbox = document.getElementById('follow-up');
const charCounter = document.getElementById('char-counter');
const communicationsList = document.getElementById('communications-list');

// Character counter for summary
summaryTextarea.addEventListener('input', () => {
    charCounter.textContent = summaryTextarea.value.length;
});

// Handle log form submission
logForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    
    // Get form values
    const communication = {
        student_name: studentNameInput.value.trim(),
        parent_name: parentNameInput.value.trim(),
        method: methodSelect.value,
        topic: topicSelect.value,
        summary: summaryTextarea.value.trim(),
        follow_up_needed: followUpCheckbox.checked,
        communication_date: new Date().toISOString()
    };
    
    console.log('Communication data:', communication);
    
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            alert('You must be logged in to log communications');
            return;
        }
        
        // Add user_id to the communication
        communication.user_id = user.id;
        
        // Insert into database
        const { data, error } = await supabase
            .from('communications')
            .insert([communication])
            .select();
        
        if (error) throw error;
        
        console.log('Communication saved!', data);
        alert('✅ Communication logged successfully!');
        
        // Reset form
        logForm.reset();
        charCounter.textContent = '0';
        
        // Reload communications list
        loadCommunications();
        
    } catch (error) {
        console.error('Error saving communication:', error);
        alert('Error: ' + error.message);
    }
});

// Load and display communications
async function loadCommunications() {
    console.log('Loading communications...');
    
    try {
        const { data, error } = await supabase
            .from('communications')
            .select('*')
            .order('communication_date', { ascending: false });
        
        if (error) throw error;
        
        console.log('Communications loaded:', data);
        
        // Store all communications
        allCommunications = data || [];
        filteredCommunications = [...allCommunications];
        
        // Attach search listeners (only once)
        attachSearchListeners();
        
        if (allCommunications.length === 0) {
            communicationsList.innerHTML = '<p>No communications logged yet.</p>';
        } else {
            displayCommunications(filteredCommunications);
        }
        
    } catch (error) {
        console.error('Error loading communications:', error);
        communicationsList.innerHTML = '<p>Error loading communications: ' + error.message + '</p>';
    }
}
// Search and filter state
let allCommunications = [];
let filteredCommunications = [];

// Get search elements
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');

// Search function
function searchCommunications(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        // If search is empty, show all communications
        filteredCommunications = [...allCommunications];
    } else {
        // Filter communications that match search term
        filteredCommunications = allCommunications.filter(comm => {
            const studentName = (comm.student_name || '').toLowerCase();
            const parentName = (comm.parent_name || '').toLowerCase();
            const summary = (comm.summary || '').toLowerCase();
            
            return studentName.includes(term) || 
                   parentName.includes(term) || 
                   summary.includes(term);
        });
    }
    
    // Display filtered results
    displayCommunications(filteredCommunications);
    
    // Show/hide clear button
    clearSearchBtn.style.display = term ? 'block' : 'none';
}

// Add search event listener (will be attached after DOM loads)
function attachSearchListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchCommunications(e.target.value);
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchCommunications('');
        });
    }
}
// Display communications in the list
function displayCommunications(communications) {
    // Show "no results" if filtered list is empty
    if (communications.length === 0) {
        communicationsList.innerHTML = '<p>No communications found matching your search.</p>';
        return;
    }
    
    communicationsList.innerHTML = communications.map(comm => {
// Display communications in the list
function displayCommunications(communications) {
    communicationsList.innerHTML = communications.map(comm => {
        const date = new Date(comm.communication_date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const methodIcon = {
            'phone': '📞',
            'email': '✉️',
            'in-person': '👤',
            'text': '💬',
            'other': '📝'
        }[comm.method] || '📝';
        
        return `
            <div class="communication-card">
                <div class="comm-header">
                    <div>
                        <strong>${comm.student_name}</strong> ${methodIcon}
                        <span class="topic-badge">${comm.topic}</span>
                    </div>
                    <span class="comm-date">${formattedDate}</span>
                </div>
                <div class="comm-body">
                    <p><strong>Parent/Guardian:</strong> ${comm.parent_name}</p>
                    <p><strong>Summary:</strong> ${comm.summary}</p>
                    ${comm.follow_up_needed ? '<p class="follow-up">⚠️ Follow-up needed</p>' : ''}
                </div>
            </div>
        `;
    }).join('');
}
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            console.log('User already logged in!');
            showApp();
        } else {
            console.log('No active session');
            showAuth();
        }
    });

    console.log('App initialization complete!');
})}});
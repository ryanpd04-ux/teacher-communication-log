// Wait for the page to fully load before running any code
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded!');
   
    // ==========================================
    // NOTIFICATION BANNER (Safari-compatible)
    // ==========================================
    
    function showNotification(message, type) {
        if (!type) type = 'success';
        
        var banner = document.getElementById('notification-banner');
        if (!banner) return;
        
        banner.textContent = message;
        banner.className = type;
        banner.style.display = 'block';
        
        setTimeout(function() {
            banner.style.display = 'none';
        }, 3000);
    }
    // ==========================================
    // LOADING OVERLAY FUNCTIONS
    // ==========================================
    
    function showLoading(message) {
        if (!message) message = 'Loading...';
        
        var overlay = document.getElementById('loading-overlay');
        var messageEl = document.getElementById('loading-message');
        
        if (overlay && messageEl) {
            messageEl.textContent = message;
            overlay.style.display = 'flex';
        }
    }
    
    function hideLoading() {
        var overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
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
            showNotification('Error: ' + error.message, 'error');
        }
    });

    // Handle sign out
    function handleSignOut() {
        console.log('Signing out...');
        
        // Clear the form
        if (logForm) {
            logForm.reset();
            if (charCounter) {
                charCounter.textContent = '0';
            }
        }
        
        // Sign out
        supabase.auth.signOut().then(() => {
            showAuth();
        });
    }

    // Show/hide sections
    function showAuth() {
    authSection.style.display = 'block';
    appSection.style.display = 'none';
    
    // Clear communications list when signing out
    if (communicationsList) {
        communicationsList.innerHTML = '';
    }
    
    // Reset all filters
    currentMethodFilter = 'all';
    currentTopicFilter = 'all';
    currentDateFilter = 'all';
    customStartDate = null;
    customEndDate = null;
    
    // Clear search input
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Hide clear filters and export buttons
    const clearAllFiltersBtn = document.getElementById('clear-all-filters');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (clearAllFiltersBtn) clearAllFiltersBtn.style.display = 'none';
    if (exportPdfBtn) exportPdfBtn.style.display = 'none';
    
    // Collapse filters
    const filtersContent = document.getElementById('filters-content');
    const filtersToggle = document.getElementById('filters-toggle');
    if (filtersContent) filtersContent.style.display = 'none';
    if (filtersToggle) filtersToggle.classList.remove('expanded');
}

    async function showApp() {
        showLoading('Loading your communications...');
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        
        // Get and display current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Get user's first name from metadata
            const firstName = user.user_metadata?.first_name || user.email.split('@')[0];
            const welcomeText = document.querySelector('.header p');
            if (welcomeText) {
                welcomeText.innerHTML = `Welcome back, <strong>${firstName}</strong>! <button id="signout-btn">Sign Out</button>`;
                
                // Re-attach sign out listener
                const newSignoutBtn = document.getElementById('signout-btn');
                if (newSignoutBtn) {
                    newSignoutBtn.addEventListener('click', handleSignOut);
                }
            }
        }
        
        // Reset all filters when signing in
    currentMethodFilter = 'all';
    currentTopicFilter = 'all';
    currentDateFilter = 'all';
    customStartDate = null;
    customEndDate = null;
    if (searchInput) searchInput.value = '';
    
    // Collapse filters
    const filtersContent = document.getElementById('filters-content');
    const filtersToggle = document.getElementById('filters-toggle');
    if (filtersContent) filtersContent.style.display = 'none';
    if (filtersToggle) filtersToggle.classList.remove('expanded');
    
    loadCommunications().then(() => {
        // Reset all filter buttons to "All"
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
        });
        
        document.querySelectorAll('.topic-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-topic') === 'all');
        });
        
        document.querySelectorAll('.date-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-days') === 'all');
        });
        
        // Display all communications on initial load
        searchCommunications('');
        hideLoading();
    });
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
    if (summaryTextarea && charCounter) {
        summaryTextarea.addEventListener('input', () => {
            charCounter.textContent = summaryTextarea.value.length;
        });
    }

    // Handle log form submission
    if (logForm) {
        logForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted!');
            
            showLoading('Saving communication...');
            
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
                hideLoading();
                showNotification('Communication logged successfully!', 'success');
                
              // Reset form
                logForm.reset();
                charCounter.textContent = '0';

                // Reload communications list but maintain current filters
                loadCommunications().then(() => {
                    // Re-apply current search/filters after loading
                    const currentSearchTerm = searchInput ? searchInput.value : '';
                    searchCommunications(currentSearchTerm);
                });
                
            } catch (error) {
                console.error('Error saving communication:', error);
                hideLoading();
                showNotification('Error: ' + error.message, 'error');
            }
        });
    }

    // Search and filter state
let allCommunications = [];
let filteredCommunications = [];
let currentMethodFilter = 'all';
let currentTopicFilter = 'all';
let currentDateFilter = 'all';
let customStartDate = null;
let customEndDate = null;
let listenersAttached = false;

    // Get search elements
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');

    // Search function
function searchCommunications(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    // Start with all communications
    let results = [...allCommunications];
    
    // Apply method filter
    if (currentMethodFilter !== 'all') {
        results = results.filter(comm => comm.method === currentMethodFilter);
    }
    
    // Apply topic filter
    if (currentTopicFilter !== 'all') {
        results = results.filter(comm => comm.topic === currentTopicFilter);
    }
    
    // Apply date filter
    if (currentDateFilter !== 'all') {
        const now = new Date();
        
        if (currentDateFilter === 'custom') {
            // Custom date range
            if (customStartDate && customEndDate) {
                const start = new Date(customStartDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(customEndDate);
                end.setHours(23, 59, 59, 999);
                
                results = results.filter(comm => {
                    const commDate = new Date(comm.communication_date);
                    return commDate >= start && commDate <= end;
                });
            }
        } else {
            // Last X days
            const daysAgo = parseInt(currentDateFilter);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
            cutoffDate.setHours(0, 0, 0, 0);
            
            results = results.filter(comm => {
                const commDate = new Date(comm.communication_date);
                return commDate >= cutoffDate;
            });
        }
    }
    
    // Apply search term
    if (term) {
        results = results.filter(comm => {
            const studentName = (comm.student_name || '').toLowerCase();
            const parentName = (comm.parent_name || '').toLowerCase();
            const summary = (comm.summary || '').toLowerCase();
            
            return studentName.includes(term) || 
                   parentName.includes(term) || 
                   summary.includes(term);
        });
    }
    
    filteredCommunications = results;
    
    // Display filtered results
    displayCommunications(filteredCommunications);
    
    // Show/hide clear button
    if (clearSearchBtn) {
        clearSearchBtn.style.display = term ? 'block' : 'none';
    }
}
   // Add search event listeners
function attachSearchListeners() {
    if (listenersAttached) return;
    listenersAttached = true;
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
    
    // Attach method filter button listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all method filter buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get filter value
            currentMethodFilter = btn.getAttribute('data-filter');
            
            // Re-run search with current filters
            searchCommunications(searchInput ? searchInput.value : '');
            updateClearFiltersButton(); 
        });
    });
    
    // Attach topic filter button listeners
    const topicFilterButtons = document.querySelectorAll('.topic-filter-btn');
    topicFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all topic filter buttons
            topicFilterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get filter value
            currentTopicFilter = btn.getAttribute('data-topic');
            
            // Re-run search with current filters
            searchCommunications(searchInput ? searchInput.value : '');
            updateClearFiltersButton(); // Add this line
        });
    });
    // Attach date filter button listeners
    const dateFilterButtons = document.querySelectorAll('.date-filter-btn');
    const customDateRange = document.getElementById('custom-date-range');
    
    dateFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all date filter buttons
            dateFilterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get filter value
            const days = btn.getAttribute('data-days');
            
            if (days === 'custom') {
                // Show custom date inputs
                if (customDateRange) {
                    customDateRange.style.display = 'block';
                }
                currentDateFilter = 'custom';
                // Don't filter yet - wait for user to apply custom dates
            } else {
                // Hide custom date inputs
                if (customDateRange) {
                    customDateRange.style.display = 'none';
                }
                currentDateFilter = days;
                // Re-run search with current filters
                searchCommunications(searchInput ? searchInput.value : '');
                updateClearFiltersButton(); // Add this line
            }
        });
    });
    
    // Attach custom date range apply button
    const applyCustomDateBtn = document.getElementById('apply-custom-date');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (applyCustomDateBtn && startDateInput && endDateInput) {
        applyCustomDateBtn.addEventListener('click', () => {
            customStartDate = startDateInput.value;
            customEndDate = endDateInput.value;
            
            if (!customStartDate || !customEndDate) {
                alert('Please select both start and end dates.');
                return;
            }
            
            if (new Date(customStartDate) > new Date(customEndDate)) {
                alert('Start date must be before end date.');
                return;
            }
            
            // Re-run search with custom date range
            currentDateFilter = 'custom';
            searchCommunications(searchInput ? searchInput.value : '');
            updateClearFiltersButton();
        });
    }
    // ==========================================
    // COLLAPSIBLE FILTERS FUNCTIONALITY
    // ==========================================
    
    // Main Filters Toggle
    const filtersToggle = document.getElementById('filters-toggle');
    const filtersContent = document.getElementById('filters-content');
    
    if (filtersToggle && filtersContent) {
        filtersToggle.addEventListener('click', () => {
            const isExpanded = filtersContent.style.display === 'block';
            
            if (isExpanded) {
                // Collapse main filters
                filtersContent.style.display = 'none';
                filtersToggle.classList.remove('expanded');
            } else {
                // Expand main filters
                filtersContent.style.display = 'block';
                filtersToggle.classList.add('expanded');
            }
        });
    }
    
    // Subsection Toggles (Method, Topic, Date)
    const subsectionToggles = document.querySelectorAll('.filter-subsection-toggle');
    
    subsectionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                const isExpanded = targetContent.style.display === 'block';
                
                if (isExpanded) {
                    // Collapse this subsection
                    targetContent.style.display = 'none';
                    toggle.classList.remove('expanded');
                } else {
                    // Expand this subsection
                    targetContent.style.display = 'block';
                    toggle.classList.add('expanded');
                }
            }
        });
    });
    // ==========================================
    // CLEAR ALL FILTERS FUNCTIONALITY
    // ==========================================
    
    const clearAllFiltersBtn = document.getElementById('clear-all-filters');
    
    function updateClearFiltersButton() {
        if (!clearAllFiltersBtn) return;
        
        // Show button if any filter is active (not "all")
        const hasActiveFilters = 
            currentMethodFilter !== 'all' || 
            currentTopicFilter !== 'all' || 
            currentDateFilter !== 'all';
        
        clearAllFiltersBtn.style.display = hasActiveFilters ? 'block' : 'none';
    }
    
    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', () => {
            // Reset all filter states
            currentMethodFilter = 'all';
            currentTopicFilter = 'all';
            currentDateFilter = 'all';
            customStartDate = null;
            customEndDate = null;
            
            // Reset all filter buttons to "All"
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
            });
            
            document.querySelectorAll('.topic-filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-topic') === 'all');
            });
            
            document.querySelectorAll('.date-filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-days') === 'all');
            });
            
            // Hide custom date range
            const customDateRange = document.getElementById('custom-date-range');
            if (customDateRange) {
                customDateRange.style.display = 'none';
            }
            
            // Clear search input
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Re-run search to show all communications
            searchCommunications('');
            
            // Update button visibility
            updateClearFiltersButton();
        });
    }
    // ==========================================
    // EXPORT PDF BUTTON
    // ==========================================
    
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', async () => {
            console.log('Export PDF clicked');
            
            // Get current user info
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                alert('You must be logged in to export.');
                return;
            }
            
            // Check if there are communications to export
            if (filteredCommunications.length === 0) {
                alert('No communications to export. Try clearing your filters.');
                return;
            }
            
            // Get user info for PDF header
            const userInfo = {
                firstName: user.user_metadata?.first_name || user.email.split('@')[0],
                lastName: user.user_metadata?.last_name || ''
            };
            
            // Generate PDF
            try {
                showLoading('Generating PDF...');
                exportToPDF(filteredCommunications, userInfo);
                hideLoading();
                showNotification('PDF exported successfully! Check your downloads folder.', 'success');
            } catch (error) {
                console.error('Error generating PDF:', error);
                hideLoading();
                showNotification('Error generating PDF: ' + error.message, 'error');
            }
        });
    }
}

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
        
        // DON'T automatically set filteredCommunications here
        // Let searchCommunications handle it
        
        // Attach search listeners (only once)
        attachSearchListeners();
        
        hideLoading(); // ← ADD THIS LINE
        
        return allCommunications;
        
    } catch (error) {
        console.error('Error loading communications:', error);
        hideLoading(); // ← ADD THIS LINE
        if (communicationsList) {
            communicationsList.innerHTML = '<p>Error loading communications: ' + error.message + '</p>';
        }
        return [];
    }
}

    // Display communications in the list
function displayCommunications(communications) {
    // Show/hide export button based on whether there are communications
    const exportBtn = document.getElementById('export-pdf-btn');
    if (exportBtn) {
        exportBtn.style.display = communications.length > 0 ? 'block' : 'none';
    }
    
    // Show appropriate message if no communications to display
    if (communications.length === 0) {
        // Check if we have ANY communications at all
        if (allCommunications.length === 0) {
            // No communications logged yet
            communicationsList.innerHTML = '<p class="empty-state">No communications logged yet.</p>';
        } else {
            // Have communications but filters are hiding them
            communicationsList.innerHTML = '<p class="empty-state">No communications found matching your filters. <button class="clear-filters-link" onclick="document.getElementById(\'clear-all-filters\').click()">Clear filters</button></p>';
        }
        return;
    }
        
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
    <div class="communication-card" data-comm-id="${comm.id}">
        <div class="comm-header">
            <div class="comm-header-left">
                <strong>${comm.student_name}</strong> ${methodIcon}
                <span class="topic-badge">${comm.topic}</span>
            </div>
            <div class="comm-header-right">
                <span class="comm-date">${formattedDate}</span>
                <button class="menu-btn" data-id="${comm.id}">⋮</button>
            </div>
        </div>
        <div class="comm-body">
            <p><strong>Parent/Guardian:</strong> ${comm.parent_name}</p>
            <p><strong>Summary:</strong> ${comm.summary}</p>
            ${comm.follow_up_needed ? '<p class="follow-up">⚠️ Follow-up needed</p>' : ''}
        </div>
        <div class="comm-actions">
            <button class="edit-btn" data-id="${comm.id}">✏️ Edit</button>
            <button class="delete-btn" data-id="${comm.id}">🗑️ Delete</button>
        </div>
    </div>
`;
        }).join('');
        // Attach menu toggle listeners
        attachMenuListeners();
    }

    // Always start at sign in page
    supabase.auth.signOut().then(() => {
        console.log('Starting fresh - showing sign in page');
        showAuth();
    });

    
    // ==========================================
    // MENU TOGGLE FUNCTIONALITY
    // ==========================================
    
    function attachMenuListeners() {
        const menuBtns = document.querySelectorAll('.menu-btn');
        
        menuBtns.forEach(btn => {
            // Remove any existing listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const commId = newBtn.getAttribute('data-id');
                const card = document.querySelector(`[data-comm-id="${commId}"]`);
                const actionsDiv = card.querySelector('.comm-actions');
                
                // Close all other open menus
                document.querySelectorAll('.comm-actions.show').forEach(div => {
                    if (div !== actionsDiv) {
                        div.classList.remove('show');
                    }
                });
                
                document.querySelectorAll('.menu-btn.active').forEach(b => {
                    if (b !== newBtn) {
                        b.classList.remove('active');
                    }
                });
                
                // Toggle this menu
                actionsDiv.classList.toggle('show');
                newBtn.classList.toggle('active');
            });
        });
        
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.communication-card')) {
                document.querySelectorAll('.comm-actions.show').forEach(div => {
                    div.classList.remove('show');
                });
                document.querySelectorAll('.menu-btn.active').forEach(btn => {
                    btn.classList.remove('active');
                });
            }
        });
        // Attach delete button listeners
    const deleteBtns = document.querySelectorAll('.delete-btn');
    
    deleteBtns.forEach(btn => {
        // Remove any existing listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const commId = newBtn.getAttribute('data-id');
            console.log('Delete button clicked for ID:', commId);
            
            // Confirmation dialog
            const confirmed = confirm('Are you sure you want to delete this communication? This cannot be undone.');
            
            if (!confirmed) {
                console.log('Delete cancelled by user');
                return;
            }
            
            try {
                console.log('Starting delete process...');
                showLoading('Deleting communication...');
                console.log('allCommunications BEFORE delete:', allCommunications.length);
                
                // Delete from database
                const { data, error } = await supabase
                    .from('communications')
                    .delete()
                    .eq('id', commId);
                
                if (error) throw error;
                
                console.log('Database delete successful');
                console.log('Delete response:', data);
                
                // Remove from allCommunications array
const beforeLength = allCommunications.length;
console.log('Trying to remove ID:', commId, 'Type:', typeof commId);
console.log('Sample ID from array:', allCommunications[0]?.id, 'Type:', typeof allCommunications[0]?.id);

allCommunications = allCommunications.filter(c => {
    // Convert both to strings for comparison
    return String(c.id) !== String(commId);
});

console.log('allCommunications AFTER delete:', allCommunications.length);
console.log('Actually removed:', beforeLength - allCommunications.length, 'items');
                // Re-run search to update display
                const currentSearchTerm = searchInput ? searchInput.value : '';
                console.log('Re-running search with term:', currentSearchTerm);
                searchCommunications(currentSearchTerm);
                
                // Show success message
                hideLoading();
                showNotification('Communication deleted successfully!', 'success');
                
            } catch (error) {
                console.error('Error deleting communication:', error);
                hideLoading();
                showNotification('Error deleting communication: ' + error.message, 'error');
            }
        });
    });

// Attach edit button listeners
    const editBtns = document.querySelectorAll('.edit-btn');
    
    editBtns.forEach(btn => {
        // Remove any existing listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const commId = newBtn.getAttribute('data-id');
            console.log('Edit button clicked for ID:', commId);
            
            // Find the communication data
            const comm = allCommunications.find(c => String(c.id) === String(commId));
            
            if (!comm) {
                showNotification('Error: Communication not found', 'error');
                return;
            }
            
            // Open edit modal with this communication's data
            openEditModal(comm);
        });
    });
} // Close attachMenuListeners

// ==========================================
// EDIT MODAL FUNCTIONALITY
// ==========================================
    
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeEditModalBtn = document.getElementById('close-edit-modal');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const editCharCounter = document.getElementById('edit-char-counter');
    const editSummaryTextarea = document.getElementById('edit-summary');
    
    // Character counter for edit summary
    if (editSummaryTextarea && editCharCounter) {
        editSummaryTextarea.addEventListener('input', () => {
            editCharCounter.textContent = editSummaryTextarea.value.length;
        });
    }
    
    // Open edit modal with communication data
    function openEditModal(comm) {
        console.log('Opening edit modal for:', comm);
        
        // Populate form fields
        document.getElementById('edit-comm-id').value = comm.id;
        document.getElementById('edit-student-name').value = comm.student_name;
        document.getElementById('edit-parent-name').value = comm.parent_name;
        document.getElementById('edit-method').value = comm.method;
        document.getElementById('edit-topic').value = comm.topic;
        document.getElementById('edit-summary').value = comm.summary;
        document.getElementById('edit-follow-up').checked = comm.follow_up_needed;
        
        // Update character counter
        editCharCounter.textContent = comm.summary.length;
        
        // Show modal
        editModal.style.display = 'flex';
        
        // Close any open menus
        document.querySelectorAll('.comm-actions.show').forEach(div => {
            div.classList.remove('show');
        });
        document.querySelectorAll('.menu-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // Close edit modal
    function closeEditModal() {
        editModal.style.display = 'none';
        editForm.reset();
    }
    
    // Close modal when clicking X or Cancel
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', closeEditModal);
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }
    
    // Close modal when clicking outside
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }
    
    // Handle edit form submission
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Edit form submitted');
            
            showLoading('Updating communication...');
            
            const commId = document.getElementById('edit-comm-id').value;
            
            const updatedData = {
                student_name: document.getElementById('edit-student-name').value.trim(),
                parent_name: document.getElementById('edit-parent-name').value.trim(),
                method: document.getElementById('edit-method').value,
                topic: document.getElementById('edit-topic').value,
                summary: document.getElementById('edit-summary').value.trim(),
                follow_up_needed: document.getElementById('edit-follow-up').checked
            };
            
            console.log('Updated data:', updatedData);
            
            try {
                // Update in database
                const { error } = await supabase
                    .from('communications')
                    .update(updatedData)
                    .eq('id', commId);
                
                if (error) throw error;
                
                console.log('Update successful');
                
                // Update in allCommunications array
                const index = allCommunications.findIndex(c => String(c.id) === String(commId));
                if (index !== -1) {
                    allCommunications[index] = {
                        ...allCommunications[index],
                        ...updatedData
                    };
                }
                
                // Re-run search to update display
                const currentSearchTerm = searchInput ? searchInput.value : '';
                searchCommunications(currentSearchTerm);
                
                // Close modal
                closeEditModal();
                
                // Show success message
                hideLoading();
                showNotification('Communication updated successfully!', 'success');
                
            } catch (error) {
                console.error('Error updating communication:', error);
                hideLoading();
                showNotification('Error updating communication: ' + error.message, 'error');
            }
        });
    }

}); // ← This closes DOMContentLoaded

// ==========================================
// PDF EXPORT FUNCTIONALITY
// ==========================================

function exportToPDF(communications, userInfo) {
    // Access jsPDF from the global window object
    const { jsPDF } = window.jspdf;
    
    // Create new PDF (letter size, portrait)
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
    });
    
    // Get current date for filename and header
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const filename = `Parent_Communications_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`;
    
    // PDF Settings
    const margin = 15;
    const pageWidth = 216; // Letter width in mm
    const pageHeight = 279; // Letter height in mm
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;
    
    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Parent Communication Log', margin, yPosition);
    yPosition += 8;
    
    // User info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Teacher: ${userInfo.firstName} ${userInfo.lastName}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Generated: ${dateStr}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Total Communications: ${communications.length}`, margin, yPosition);
    yPosition += 10;
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    // Communications
    communications.forEach((comm, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = margin;
        }
        
        // Communication header
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        
        const commDate = new Date(comm.communication_date);
        const formattedDate = commDate.toLocaleDateString() + ' ' + commDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        doc.text(`${index + 1}. ${comm.student_name} - ${formattedDate}`, margin, yPosition);
        yPosition += 6;
        
        // Communication details
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        
        const methodIcon = {
            'phone': 'Phone Call',
            'email': 'Email',
            'in-person': 'In-Person',
            'text': 'Text Message',
            'other': 'Other'
        }[comm.method] || comm.method;
        
        doc.text(`Parent/Guardian: ${comm.parent_name}`, margin + 5, yPosition);
        yPosition += 5;
        doc.text(`Method: ${methodIcon} | Topic: ${comm.topic}`, margin + 5, yPosition);
        yPosition += 5;
        
        // Summary (wrap text if long)
        doc.text(`Summary: ${comm.summary}`, margin + 5, yPosition, {
            maxWidth: contentWidth - 10
        });
        
        // Calculate how many lines the summary took
        const summaryLines = doc.splitTextToSize(comm.summary, contentWidth - 10);
        yPosition += (summaryLines.length * 4);
        
        // Follow-up flag
        if (comm.follow_up_needed) {
            yPosition += 4;
            doc.setTextColor(220, 53, 69); // Red color
            doc.text('⚠ Follow-up needed', margin + 5, yPosition);
            doc.setTextColor(0, 0, 0); // Back to black
        }
        
        yPosition += 8;
        
        // Separator line between communications
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;
    });
    
    // Footer on last page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(filename);
    
    console.log(`PDF exported: ${filename}`);
}
// Global notification function (backup)
window.showNotification = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('Notification container not found');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

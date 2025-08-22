// Performance data extraction and display functionality
class PerformanceAnalyzer {
    constructor() {
        this.improvementArray = [];
        this.regressionArray = [];
        this.isAnalyzing = false;
        this.allData = [];
        this.activeTab = 'regressions'; // Default to regressions tab
        this.dataCache = null; // Cache for extracted data
        this.cacheTimestamp = null; // Track when data was cached
        this.isVisible = false; // Track visibility state
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }

    init() {
        // Only run on performance comparison pages
        if (!window.location.href.includes('edgeteam.ms/perf-lab/perf-comparison-requests/details/')) {
            return;
        }

        console.log('📊 Pantheon Toolkit initializing...');
        console.log('📋 XLSX library available:', typeof XLSX !== 'undefined');

        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    setupUI() {
        // Create floating action button
        this.createFloatingButton();
        
        // Create results container
        this.createResultsContainer();
        
        // Start background data fetching immediately
        this.startBackgroundDataFetch();
    }

    startBackgroundDataFetch() {
        console.log('🚀 Starting background data fetch...');
        
        // Check if we have cached data that's still valid
        const now = Date.now();
        if (this.dataCache && this.cacheTimestamp && (now - this.cacheTimestamp < this.cacheTimeout)) {
            console.log('📋 Using cached data from background');
            // Update button to show data is ready
            const button = document.getElementById('perf-analyzer-btn');
            if (button) {
                button.innerHTML = '📊 View Results';
                button.classList.remove('fetching', 'retry', 'error');
                button.classList.add('data-ready');
            }
            return;
        }
        
        // Start fetching data in background with a longer delay to ensure page is loaded
        setTimeout(() => {
            this.fetchDataInBackground();
        }, 5000); // Increased from 2 seconds to 5 seconds for better reliability
    }

    updateProgress(percentage, message = 'Fetching Results') {
        const button = document.getElementById('perf-analyzer-btn');
        if (button && button.classList.contains('fetching')) {
            button.innerHTML = `⏳ ${message}... ${percentage}%`;
        }
    }

    async fetchDataInBackground() {
        if (this.isAnalyzing) {
            console.log('⏳ Data extraction already in progress');
            return;
        }

        try {
            console.log('📊 Background data extraction starting...');
            this.isAnalyzing = true;
            
            // Update button to show background processing
            const button = document.getElementById('perf-analyzer-btn');
            if (button) {
                button.innerHTML = '⏳ Fetching Results... 0%';
                button.classList.add('fetching');
                button.classList.remove('data-ready');
            }

            // Extract data using the same method
            console.log('🔍 Calling extractData method...');
            const result = await this.extractData();
            console.log('📋 ExtractData result:', result);
            
            if (result && result.success) {
                this.dataCache = {
                    improvements: result.improvements || [],
                    regressions: result.regressions || []
                };
                this.cacheTimestamp = Date.now();
                
                this.improvementArray = result.improvements || [];
                this.regressionArray = result.regressions || [];
                
                console.log(`✅ Background fetch complete: ${this.regressionArray.length} regressions, ${this.improvementArray.length} improvements`);
                
                // Update button to show data is ready
                if (button) {
                    button.innerHTML = '📊 View Results';
                    button.classList.remove('fetching', 'retry', 'error');
                    button.classList.add('data-ready');
                    console.log('🔄 Button updated to "View Results"');
                }
            } else {
                console.log('❌ Background fetch failed:', result ? result.message : 'No result returned');
                
                // Diagnose the problem
                const pageIndicator = document.querySelector('[data-automation-id="DetailsRow"] [data-automation-key="PageIndicator"]');
                const improvementElements = document.querySelectorAll('.ms-List-page .ms-DetailsRow-cell');
                const spinnerElement = document.querySelector('.ms-Spinner');
                
                console.log('� Diagnostic information:');
                console.log('  Page indicator found:', !!pageIndicator, pageIndicator?.textContent?.trim());
                console.log('  Improvement elements found:', improvementElements.length);
                console.log('  Spinner active:', !!spinnerElement);
                console.log('  Document ready state:', document.readyState);
                console.log('  Page URL:', window.location.href);
                
                // Change button to allow retry
                if (button) {
                    button.innerHTML = '🔄 Retry Results';
                    button.classList.remove('fetching');
                    button.classList.add('data-ready', 'retry');
                    console.log('🔄 Button changed to "Retry Results" - user can click to try again');
                }
            }
        } catch (error) {
            console.error('❌ Background fetch error:', error);
            console.error('Error stack:', error.stack);
            
            // Change button to allow retry
            const button = document.getElementById('perf-analyzer-btn');
            if (button) {
                button.innerHTML = '⚠️ Error - Retry';
                button.classList.remove('fetching');
                button.classList.add('data-ready', 'error');
                console.log('🔄 Error occurred - button changed to allow retry');
            }
        } finally {
            this.isAnalyzing = false;
            console.log('🏁 Background fetch finally block - isAnalyzing set to false');
        }
    }

    createFloatingButton() {
        const button = document.createElement('button');
        button.id = 'perf-analyzer-btn';
        button.innerHTML = '⏳ Fetching Results... 0%';
        button.className = 'perf-analyzer-floating-btn fetching';
        
        // Make button draggable
        this.makeDraggable(button);
        
        button.addEventListener('click', () => {
            // Get current button state
            const buttonText = button.innerHTML;
            const isViewResultsState = buttonText.includes('View Results');
            const isFetchingState = buttonText.includes('Fetching Results');
            const isRetryState = buttonText.includes('Retry') || buttonText.includes('Error');
            
            console.log('🔍 Button click debug:', {
                buttonText,
                isViewResultsState,
                isFetchingState,
                isRetryState,
                isAnalyzing: this.isAnalyzing,
                hasCache: !!this.dataCache,
                cacheAge: this.cacheTimestamp ? (Date.now() - this.cacheTimestamp) / 1000 + 's' : 'no cache',
                improvementsCount: this.improvementArray.length,
                regressionsCount: this.regressionArray.length
            });
            
            // PRIORITY 1: If button shows "View Results", show data immediately - NO CHECKS, NO RE-FETCHING
            if (isViewResultsState) {
                console.log('⚡ INSTANT: Button shows "View Results" - showing data immediately');
                this.showResults();
                return; // Exit immediately - no further processing
            }
            
            // PRIORITY 2: Handle retry states - restart background fetch
            if (isRetryState) {
                console.log('🔄 RETRY: User clicked retry button - starting background fetch');
                button.innerHTML = '⏳ Fetching Results... 0%';
                button.classList.remove('data-ready', 'retry', 'error');
                button.classList.add('fetching');
                
                // Clear old cache and restart background fetch
                this.dataCache = null;
                this.cacheTimestamp = null;
                this.improvementArray = [];
                this.regressionArray = [];
                
                // Start background fetch
                setTimeout(() => {
                    this.fetchDataInBackground();
                }, 1000); // Give a moment for UI to update
                
                return;
            }
            
            // PRIORITY 3: Handle fetching state - provide user feedback
            if (isFetchingState || this.isAnalyzing) {
                console.log('⏳ FETCHING: Data extraction in progress - showing feedback');
                
                // Check if data is actually ready but button hasn't updated yet
                const now = Date.now();
                const hasValidCache = this.dataCache && this.cacheTimestamp && (now - this.cacheTimestamp < this.cacheTimeout);
                const hasDataArrays = this.improvementArray.length > 0 || this.regressionArray.length > 0;
                
                if (hasValidCache && hasDataArrays) {
                    console.log('⚡ SURPRISE: Data actually ready! Showing immediately');
                    // Update button state and show results
                    button.innerHTML = '📊 View Results';
                    button.classList.remove('fetching');
                    button.classList.add('data-ready');
                    this.showResults();
                    return;
                }
                
                // Provide visual feedback that click was registered
                const originalText = button.innerHTML;
                button.innerHTML = '⏳ Please wait...';
                button.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.transform = 'scale(1)';
                }, 500);
                
                return; // Don't start another analysis
            }
            
            // PRIORITY 4: Check if we have valid cached data (for other button states)
            const now = Date.now();
            const hasValidCache = this.dataCache && this.cacheTimestamp && (now - this.cacheTimestamp < this.cacheTimeout);
            const hasDataArrays = this.improvementArray.length > 0 || this.regressionArray.length > 0;
            
            if (hasValidCache && hasDataArrays) {
                console.log('⚡ INSTANT: Using cached data arrays');
                this.showResults();
                return; // Exit immediately
            }
            
            if (hasValidCache && this.dataCache) {
                console.log('⚡ INSTANT: Restoring from cache object');
                this.improvementArray = [...this.dataCache.improvements];
                this.regressionArray = [...this.dataCache.regressions];
                this.showResults();
                return; // Exit immediately
            }
            
            // PRIORITY 5: Only start fresh analysis if no cache and not already analyzing
            if (!this.isAnalyzing) {
                console.log('🔄 FRESH: Starting new data analysis');
                button.innerHTML = '⏳ Fetching Results... 0%';
                button.classList.add('fetching');
                button.classList.remove('data-ready');
                this.analyzePerformanceData();
            } else {
                console.log('⏳ WAIT: Analysis already in progress - this should not happen');
            }
        });

        document.body.appendChild(button);
    }

    makeDraggable(element) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        // Load saved position from localStorage
        const savedPosition = localStorage.getItem('pantheon-toolkit-button-position');
        if (savedPosition) {
            const { x, y } = JSON.parse(savedPosition);
            xOffset = x;
            yOffset = y;
        } else {
            // Get initial position from CSS or set default
            const computedStyle = window.getComputedStyle(element);
            const right = computedStyle.right;
            const bottom = computedStyle.bottom;
            
            // Convert right/bottom to left/top for easier calculation
            if (right !== 'auto') {
                xOffset = window.innerWidth - parseInt(right) - element.offsetWidth;
            }
            if (bottom !== 'auto') {
                yOffset = window.innerHeight - parseInt(bottom) - element.offsetHeight;
            }
        }
        
        // Apply position
        element.style.right = 'auto';
        element.style.bottom = 'auto';
        element.style.left = xOffset + 'px';
        element.style.top = yOffset + 'px';

        element.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        // Touch events for mobile
        element.addEventListener('touchstart', dragStart);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', dragEnd);

        function dragStart(e) {
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            if (e.target === element) {
                isDragging = true;
                element.style.cursor = 'grabbing';
                element.style.userSelect = 'none';
                e.preventDefault();
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                // Constrain to viewport
                const maxX = window.innerWidth - element.offsetWidth;
                const maxY = window.innerHeight - element.offsetHeight;
                
                xOffset = Math.max(0, Math.min(xOffset, maxX));
                yOffset = Math.max(0, Math.min(yOffset, maxY));

                element.style.left = xOffset + 'px';
                element.style.top = yOffset + 'px';
            }
        }

        function dragEnd(e) {
            if (isDragging) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                element.style.cursor = 'grab';
                element.style.userSelect = 'auto';
                
                // Save position to localStorage
                localStorage.setItem('pantheon-toolkit-button-position', JSON.stringify({
                    x: xOffset,
                    y: yOffset
                }));
                
                console.log('💾 Button position saved:', { x: xOffset, y: yOffset });
            }
        }

        // Handle window resize to keep button in bounds
        window.addEventListener('resize', () => {
            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;
            
            xOffset = Math.max(0, Math.min(xOffset, maxX));
            yOffset = Math.max(0, Math.min(yOffset, maxY));
            
            element.style.left = xOffset + 'px';
            element.style.top = yOffset + 'px';
        });

        // Set initial cursor
        element.style.cursor = 'grab';
    }

    createResultsContainer() {
        const container = document.createElement('div');
        container.id = 'perf-analyzer-results';
        container.className = 'perf-analyzer-container hidden';
        
        container.innerHTML = `
            <div class="perf-analyzer-content">
                <button class="perf-analyzer-close" id="close-btn" title="Close" aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div class="perf-analyzer-header">
                    <div class="perf-analyzer-title">
                        <h2>📊 Performance Analysis Results</h2>
                        <div class="perf-analyzer-stats" id="perf-stats"></div>
                    </div>
                    <div class="perf-analyzer-controls">
                        <div class="perf-tabs">
                            <button class="tab-button active" id="tab-regressions">
                                ⬇️ Regressions
                            </button>
                            <button class="tab-button" id="tab-improvements">
                                ⬆️ Improvements
                            </button>
                        </div>
                        <button class="export-button" id="export-excel-btn" title="Export to Excel">
                            📋 Export Excel
                        </button>
                    </div>
                </div>
                <div class="perf-analyzer-loading" id="perf-loading">
                    <div class="spinner"></div>
                    <p>Extracting performance data...</p>
                </div>
                <div class="perf-analyzer-data" id="perf-data"></div>
            </div>
        `;

        document.body.appendChild(container);
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // Update display
        this.updateTabContent();
        this.updateStats();
    }

    updateTabContent() {
        const dataDiv = document.getElementById('perf-data');
        const data = this.activeTab === 'improvements' ? this.improvementArray : this.regressionArray;
        const type = this.activeTab === 'improvements' ? 'improvement' : 'regression';
        
        if (data.length === 0) {
            // Show debugging information
            let debugInfo = '';
            if (this.activeTab === 'improvements') {
                debugInfo = this.improvementArray.length === 0 && this.regressionArray.length > 0 
                    ? '<p><strong>Debug:</strong> Found regressions but no improvements. This might be normal if there are no performance improvements in this comparison.</p>'
                    : '<p><strong>Debug:</strong> No data extracted. Check browser console for detailed information about the extraction process.</p>';
            } else {
                debugInfo = this.regressionArray.length === 0 && this.improvementArray.length > 0
                    ? '<p><strong>Debug:</strong> Found improvements but no regressions. This might be normal if there are no performance regressions in this comparison.</p>'
                    : '<p><strong>Debug:</strong> No data extracted. Check browser console for detailed information about the extraction process.</p>';
            }
            
            dataDiv.innerHTML = `
                <div class="no-data">
                    <h3>No ${this.activeTab} found</h3>
                    <p>No ${this.activeTab} data was found for this performance comparison.</p>
                    ${debugInfo}
                    <button class="debug-button" id="show-debug-info">Show Debug Information</button>
                    <button class="debug-button" id="force-debug-extraction">Force Re-extraction with Debug</button>
                </div>
            `;
            
            // Add event listeners for debug buttons (primary method)
            setTimeout(() => {
                const showDebugBtn = document.getElementById('show-debug-info');
                const forceDebugBtn = document.getElementById('force-debug-extraction');
                
                if (showDebugBtn && !showDebugBtn.hasAttribute('data-listener-added')) {
                    showDebugBtn.addEventListener('click', () => {
                        console.log('Debug button clicked');
                        this.showDebugInfo();
                    });
                    showDebugBtn.setAttribute('data-listener-added', 'true');
                }
                if (forceDebugBtn && !forceDebugBtn.hasAttribute('data-listener-added')) {
                    forceDebugBtn.addEventListener('click', () => {
                        console.log('Force debug button clicked');
                        this.forceDebugExtraction();
                    });
                    forceDebugBtn.setAttribute('data-listener-added', 'true');
                }
            }, 100);
            return;
        }
        
        dataDiv.innerHTML = this.renderTable(data, type);
        
        // Add event listeners to table headers
        this.addTableHeaderListeners();
    }

    showDebugInfo() {
        const debugWindow = window.open('', 'debug', 'width=1000,height=700,scrollbars=yes');
        
        // Comprehensive page analysis
        const debugInfo = {
            url: window.location.href,
            pageTitle: document.title,
            timestamp: new Date().toISOString(),
            readyState: document.readyState,
            improvementsFound: this.improvementArray.length,
            regressionsFound: this.regressionArray.length,
            pageStructure: this.analyzePageStructureForDebug()
        };

        debugWindow.document.write(`
            <html>
                <head>
                    <title>Pantheon Toolkit Debug Information</title>
                    <style>
                        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                        .section { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; }
                        .error { color: red; font-weight: bold; }
                        .success { color: green; font-weight: bold; }
                        .warning { color: orange; font-weight: bold; }
                        pre { background: #f0f0f0; padding: 10px; overflow: auto; }
                        .highlight { background: yellow; }
                    </style>
                </head>
                <body>
                    <h1>🔍 Pantheon Toolkit Debug Report</h1>
                    
                    <div class="section">
                        <h2>📋 Basic Information</h2>
                        <p><strong>URL:</strong> ${debugInfo.url}</p>
                        <p><strong>Page Title:</strong> ${debugInfo.pageTitle}</p>
                        <p><strong>Ready State:</strong> ${debugInfo.readyState}</p>
                        <p><strong>Timestamp:</strong> ${debugInfo.timestamp}</p>
                    </div>

                    <div class="section">
                        <h2>📊 Extraction Results</h2>
                        <p class="${debugInfo.improvementsFound > 0 ? 'success' : 'error'}">
                            <strong>Improvements Found:</strong> ${debugInfo.improvementsFound}
                        </p>
                        <p class="${debugInfo.regressionsFound > 0 ? 'success' : 'error'}">
                            <strong>Regressions Found:</strong> ${debugInfo.regressionsFound}
                        </p>
                    </div>

                    <div class="section">
                        <h2>🏗️ Page Structure Analysis</h2>
                        <h3>Main Content Areas:</h3>
                        <ul>
                            <li>Main content (#main-content): ${debugInfo.pageStructure.hasMainContent ? '✅ Found' : '❌ Not found'}</li>
                            <li>Body classes: <code>${debugInfo.pageStructure.bodyClasses}</code></li>
                            <li>Total divs: ${debugInfo.pageStructure.totalDivs}</li>
                        </ul>
                        
                        <h3>P0 Element Search:</h3>
                        <ul>
                            <li>Elements with "P0": ${debugInfo.pageStructure.p0Elements}</li>
                            <li>Elements with "improvement": ${debugInfo.pageStructure.improvementElements}</li>
                            <li>Elements with "regression": ${debugInfo.pageStructure.regressionElements}</li>
                            <li>Elements with "performance": ${debugInfo.pageStructure.performanceElements}</li>
                        </ul>

                        <h3>Sample Page Content (first 10 divs):</h3>
                        <pre>${debugInfo.pageStructure.sampleContent}</pre>
                    </div>

                    <div class="section">
                        <h2>🔧 Troubleshooting Tips</h2>
                        <ul>
                            <li>Check the browser console (F12) for detailed extraction logs</li>
                            <li>Make sure the page has fully loaded before running the extension</li>
                            <li>Verify you're on a performance comparison page at edgeteam.ms</li>
                            <li>Try refreshing the page and running the extension again</li>
                            ${debugInfo.pageStructure.hasMainContent ? 
                                '<li class="success">✅ Main content area found - page structure looks correct</li>' : 
                                '<li class="error">❌ Main content area not found - this might not be a performance comparison page</li>'}
                        </ul>
                    </div>

                    <div class="section">
                        <h2>📝 Console Commands to Try</h2>
                        <p>Open browser console (F12) and try these commands:</p>
                        <pre>
// Check for main content
document.querySelector('#main-content')

// Look for P0 text
Array.from(document.querySelectorAll('*')).filter(el => el.textContent?.includes('P0')).length

// Check page structure
document.querySelectorAll('#main-content div').length

// Re-run extraction with debugging
perfAnalyzer.extractData()
                        </pre>
                    </div>
                </body>
            </html>
        `);
    }

    analyzePageStructureForDebug() {
        const structure = {
            hasMainContent: !!document.querySelector('#main-content'),
            bodyClasses: document.body.className || 'none',
            totalDivs: document.querySelectorAll('div').length,
            p0Elements: 0,
            improvementElements: 0,
            regressionElements: 0,
            performanceElements: 0,
            sampleContent: ''
        };

        // Count elements with specific text
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            const text = el.textContent?.toLowerCase() || '';
            if (text.includes('p0')) structure.p0Elements++;
            if (text.includes('improvement')) structure.improvementElements++;
            if (text.includes('regression')) structure.regressionElements++;
            if (text.includes('performance')) structure.performanceElements++;
        });

        // Get sample content from first 10 divs
        const sampleDivs = Array.from(document.querySelectorAll('div')).slice(0, 10);
        structure.sampleContent = sampleDivs.map((div, index) => {
            const text = (div.textContent || '').substring(0, 150);
            return `DIV ${index + 1}: Classes="${div.className}" ID="${div.id}"\nContent: ${text}${text.length >= 150 ? '...' : ''}\n`;
        }).join('\n');

        return structure;
    }

    applyFilters() {
        if (!this.allData.length) return;
        
        const showImprovements = document.getElementById('show-improvements').checked;
        const showRegressions = document.getElementById('show-regressions').checked;
        
        this.filteredData = this.allData.filter(item => {
            if (item.type === 'improvement' && !showImprovements) return false;
            if (item.type === 'regression' && !showRegressions) return false;
            return true;
        });
        
        this.updateTables(showImprovements, showRegressions);
        this.updateStats();
    }

    showResults() {
        // Show results container
        const resultsContainer = document.getElementById('perf-analyzer-results');
        resultsContainer.classList.remove('hidden');
        this.isVisible = true;
        
        // Hide loading and show data immediately
        const loadingDiv = document.getElementById('perf-loading');
        const dataDiv = document.getElementById('perf-data');
        loadingDiv.style.display = 'none';
        dataDiv.style.display = 'block';
        
        // Add event listeners for window controls
        this.addWindowControlListeners();
        
        // Display the cached results immediately
        this.displayResults();
        
        console.log('✅ Showing cached results instantly');
    }

    async analyzePerformanceData() {
        if (this.isAnalyzing) return;
        
        // Show results container first
        const resultsContainer = document.getElementById('perf-analyzer-results');
        resultsContainer.classList.remove('hidden');
        this.isVisible = true;
        
        // Add event listeners for minimize/close buttons
        this.addWindowControlListeners();
        
        // Check if we have cached data (valid for 5 minutes)
        const cacheValidityMs = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();
        
        if (this.dataCache && this.cacheTimestamp && (now - this.cacheTimestamp) < cacheValidityMs) {
            console.log('📋 Using cached data');
            // Restore from cache
            this.improvementArray = [...this.dataCache.improvements];
            this.regressionArray = [...this.dataCache.regressions];
            this.displayResults();
            return;
        }
        
        // No cache or expired cache - extract fresh data
        console.log('🔄 Extracting fresh data...');
        this.isAnalyzing = true;
        this.improvementArray = [];
        this.regressionArray = [];

        const loadingDiv = document.getElementById('perf-loading');
        const dataDiv = document.getElementById('perf-data');
        
        loadingDiv.style.display = 'block';
        dataDiv.style.display = 'none';

        try {
            const result = await this.extractData();
            
            if (result && result.success) {
                // Use the returned arrays
                this.improvementArray = result.improvements || [];
                this.regressionArray = result.regressions || [];
                
                // Cache the results
                this.dataCache = {
                    improvements: [...this.improvementArray],
                    regressions: [...this.regressionArray]
                };
                this.cacheTimestamp = Date.now();
                console.log('💾 Data cached successfully');
                
                this.displayResults();
            } else {
                throw new Error(result ? result.message : 'Data extraction failed');
            }
        } catch (error) {
            console.error('Error analyzing performance data:', error);
            // Show a more helpful error message for first-time failures
            const errorMessage = error.message.includes('Could not find P0 wrapper elements') 
                ? 'Page may still be loading. Please wait a moment and try again.'
                : error.message;
            this.showError(errorMessage);
            
            // Reset button on error
            const button = document.getElementById('perf-analyzer-btn');
            if (button) {
                button.innerHTML = '⏳ Fetching Results... 0%';
                button.classList.remove('fetching', 'data-ready');
                button.classList.add('fetching');
            }
        } finally {
            this.isAnalyzing = false;
            loadingDiv.style.display = 'none';
            dataDiv.style.display = 'block';
            
            // Update button to show results are ready
            const button = document.getElementById('perf-analyzer-btn');
            if (button && (this.improvementArray.length > 0 || this.regressionArray.length > 0)) {
                button.innerHTML = '📊 View Results';
                button.classList.remove('fetching');
                button.classList.add('data-ready');
            }
        }
    }

    addWindowControlListeners() {
        // Remove any existing listeners to prevent duplicates
        const closeBtn = document.getElementById('close-btn');
        const tabRegressions = document.getElementById('tab-regressions');
        const tabImprovements = document.getElementById('tab-improvements');
        const exportBtn = document.getElementById('export-excel-btn');
        
        if (closeBtn && !closeBtn.hasAttribute('data-listener-added')) {
            closeBtn.addEventListener('click', () => this.closeResults());
            closeBtn.setAttribute('data-listener-added', 'true');
        }
        
        if (tabRegressions && !tabRegressions.hasAttribute('data-listener-added')) {
            tabRegressions.addEventListener('click', () => this.switchTab('regressions'));
            tabRegressions.setAttribute('data-listener-added', 'true');
        }
        
        if (tabImprovements && !tabImprovements.hasAttribute('data-listener-added')) {
            tabImprovements.addEventListener('click', () => this.switchTab('improvements'));
            tabImprovements.setAttribute('data-listener-added', 'true');
        }
        
        if (exportBtn && !exportBtn.hasAttribute('data-listener-added')) {
            exportBtn.addEventListener('click', () => this.exportToExcel());
            exportBtn.setAttribute('data-listener-added', 'true');
            
            // Update button text based on XLSX availability
            if (typeof XLSX === 'undefined') {
                exportBtn.textContent = '❌ Excel (Library Missing)';
                exportBtn.disabled = true;
                exportBtn.title = 'Excel export library not loaded';
            } else {
                exportBtn.textContent = '📋 Export Excel';
                exportBtn.disabled = false;
                exportBtn.title = 'Export to Excel';
                console.log('✅ Excel export button ready');
            }
        }
    }

    addTableHeaderListeners() {
        // Add click listeners to all table headers
        const headers = document.querySelectorAll('.table-header[data-column]');
        headers.forEach(header => {
            if (!header.hasAttribute('data-listener-added')) {
                header.addEventListener('click', () => {
                    const column = header.getAttribute('data-column');
                    const type = header.getAttribute('data-type');
                    this.sortTable(type, column);
                });
                header.setAttribute('data-listener-added', 'true');
            }
        });
    }

    closeResults() {
        const resultsContainer = document.getElementById('perf-analyzer-results');
        resultsContainer.classList.add('hidden');
        this.isVisible = false;
    }

    forceDebugExtraction() {
        console.log('🚀 FORCE DEBUG EXTRACTION STARTED');
        console.log('='.repeat(60));
        console.log('📍 URL:', window.location.href);
        console.log('📄 Title:', document.title);
        console.log('⏰ Time:', new Date().toISOString());
        console.log('📊 Ready State:', document.readyState);
        
        // Reset arrays
        this.improvementArray = [];
        this.regressionArray = [];
        
        // Comprehensive page analysis
        console.log('\n🔍 PAGE ANALYSIS:');
        
        // Check main content
        const mainContent = document.querySelector('#main-content');
        console.log('Main content (#main-content):', mainContent ? '✅ Found' : '❌ Not found');
        
        if (mainContent) {
            const divsInMain = mainContent.querySelectorAll('div');
            console.log(`📦 Divs in main content: ${divsInMain.length}`);
            
            // Check for P0 text in main content
            const mainText = mainContent.textContent || '';
            console.log('🔤 Main content contains "P0":', mainText.includes('P0'));
            console.log('🔤 Main content contains "improvement":', mainText.toLowerCase().includes('improvement'));
            console.log('🔤 Main content contains "regression":', mainText.toLowerCase().includes('regression'));
        }
        
        // Global text search
        console.log('\n🌐 GLOBAL TEXT SEARCH:');
        const allElements = document.querySelectorAll('*');
        let p0Count = 0, improvementCount = 0, regressionCount = 0;
        
        allElements.forEach(el => {
            const text = el.textContent?.toLowerCase() || '';
            if (text.includes('p0')) p0Count++;
            if (text.includes('improvement')) improvementCount++;
            if (text.includes('regression')) regressionCount++;
        });
        
        console.log(`📊 Elements with "P0": ${p0Count}`);
        console.log(`📊 Elements with "improvement": ${improvementCount}`);
        console.log(`📊 Elements with "regression": ${regressionCount}`);
        
        // Find specific P0 elements
        console.log('\n🎯 SEARCHING FOR P0 ELEMENTS:');
        const p0Elements = Array.from(allElements).filter(el => {
            const text = el.textContent || '';
            return text.includes('P0 Improvements') || text.includes('P0 Regressions');
        });
        
        console.log(`Found ${p0Elements.length} elements with P0 Improvements/Regressions text:`);
        p0Elements.forEach((el, index) => {
            console.log(`  ${index + 1}. Tag: ${el.tagName}, Classes: "${el.className}", Text: "${el.textContent?.substring(0, 100)}"`);
        });
        
        // Try the current extraction method
        console.log('\n🔄 RUNNING CURRENT EXTRACTION METHOD:');
        try {
            this.extractData().then(() => {
                console.log('✅ Extraction completed');
                console.log(`📊 Results: ${this.improvementArray.length} improvements, ${this.regressionArray.length} regressions`);
                this.updateTabContent();
            }).catch(error => {
                console.error('❌ Extraction failed:', error);
            });
        } catch (error) {
            console.error('❌ Extraction threw error:', error);
        }
        
        console.log('🚀 FORCE DEBUG EXTRACTION COMPLETED');
        console.log('='.repeat(60));
    }

    async extractData() {
        console.log('🚀 Starting data extraction using proven approach...');
        
        // Update progress - step 1: Page loading
        this.updateProgress(10, 'Loading page');
        
        // Wait for page to fully load first
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update progress - step 2: Finding elements
        this.updateProgress(25, 'Finding elements');
        
        // Reset arrays
        this.improvementArray = [];
        this.regressionArray = [];
        
        try {
            // Use the exact selectors that work
            const P0ImprovementWrapperPath = '#main-content > div > div > div > div:nth-child(14) > div:nth-child(3)';
            const P0RegressionWrapperPath = '#main-content > div > div > div > div:nth-child(14) > div:nth-child(2)';
            
            console.log('🔍 Looking for P0 wrappers...');
            const P0ImprovementWrapperDiv = document.querySelector(P0ImprovementWrapperPath);
            const P0RegressionWrapperDiv = document.querySelector(P0RegressionWrapperPath);
            
            console.log('Improvement wrapper found:', !!P0ImprovementWrapperDiv);
            console.log('Regression wrapper found:', !!P0RegressionWrapperDiv);
            
            if (!P0ImprovementWrapperDiv || !P0RegressionWrapperDiv) {
                throw new Error('Could not find P0 wrapper elements using the expected selectors. Please ensure the page has fully loaded.');
            }
            
            // Update progress - step 3: Validating wrappers
            this.updateProgress(40, 'Validating elements');
            
            // Validate the wrappers
            const improvementTitle = P0ImprovementWrapperDiv.childNodes[0]?.textContent;
            const regressionTitle = P0RegressionWrapperDiv.childNodes[0]?.textContent;
            
            console.log('Improvement wrapper title:', improvementTitle);
            console.log('Regression wrapper title:', regressionTitle);
            
            if (!improvementTitle?.startsWith('P0 Improvements')) {
                console.warn(`Unexpected P0 Improvements wrapper title: ${improvementTitle}`);
            }
            if (!regressionTitle?.startsWith('P0 Regressions')) {
                console.warn(`Unexpected P0 Regressions wrapper title: ${regressionTitle}`);
            }
            
            // Set IDs for easier access
            P0ImprovementWrapperDiv.id = 'P0ImprovementsWrapper';
            P0RegressionWrapperDiv.id = 'P0RegressionsWrapper';
            
            // Update progress - step 4: Starting data extraction
            this.updateProgress(50, 'Extracting data');
            
            // Extract data from both wrappers using the proven method
            await Promise.all([
                this.grabWrapperDataWithProgress(P0ImprovementWrapperDiv, this.improvementArray, 'improvements', 50, 75),
                this.grabWrapperDataWithProgress(P0RegressionWrapperDiv, this.regressionArray, 'regressions', 75, 95)
            ]);
            
            // Update progress - step 5: Finalizing
            this.updateProgress(100, 'Complete');
            
            console.log(`✅ Extraction complete. Found ${this.improvementArray.length} improvements and ${this.regressionArray.length} regressions.`);
            
            // Return success result
            return {
                success: true,
                improvements: this.improvementArray,
                regressions: this.regressionArray,
                message: `Found ${this.improvementArray.length} improvements and ${this.regressionArray.length} regressions`
            };
            
        } catch (error) {
            console.error('❌ Extraction failed:', error);
            
            // Return failure result instead of throwing
            return {
                success: false,
                improvements: [],
                regressions: [],
                message: error.message,
                error: error
            };
        }
    }

    // Helper functions based on your proven code
    getPageIndicatorFromWrapper(wrapperId) {
        return document.querySelector(`#${wrapperId} > div:nth-child(2) > div:nth-child(3) > p`);
    }

    parsePageIndicator(pageIndicator) {
        if (!pageIndicator) return { currentPage: 1, totalPage: 1 };
        let m = [...pageIndicator.textContent.matchAll(/([0-9]+) \/ ([0-9]+)/g)];
        if (m.length === 0) return { currentPage: 1, totalPage: 1 };
        return { currentPage: Number(m[0][1]), totalPage: Number(m[0][2]) };
    }

    isWrapperBusy(wrapper) {
        return document.querySelector(`#${wrapper.id} > div:nth-child(1) > div.ms-Spinner`) != null;
    }

    getPageButtons(wrapper) {
        let buttons = document.querySelectorAll(`#${wrapper.id} > div:nth-child(2) > div:nth-child(3) > button`);
        return { buttonPrev: buttons[0], buttonNext: buttons[1] };
    }

    async navigateToPage(targetPage, wrapper, callback) {
        const waitAndSee = () => window.setTimeout(async () => { this.navigateToPage(targetPage, wrapper, callback) }, 100);
        if (this.isWrapperBusy(wrapper)) {
            waitAndSee();
            return;
        }
        const pageInfo = this.parsePageIndicator(this.getPageIndicatorFromWrapper(wrapper.id));
        if (pageInfo.currentPage == targetPage) {
            window.setTimeout(callback, 0);
            return;
        }
        const pageButtons = this.getPageButtons(wrapper);
        console.assert((1 <= targetPage) && (targetPage <= pageInfo.totalPage), `Unexpected target page ${targetPage} in total ${pageInfo.totalPage} pages`);
        if (pageInfo.currentPage > targetPage) {
            pageButtons.buttonPrev.click();
        } else {
            pageButtons.buttonNext.click();
        }
        waitAndSee();
    }

    getListPageCells(wrapper) {
        return document.querySelectorAll(`#${wrapper.id} div.ms-List-page div.ms-List-cell`);
    }

    parseMetricName(str) {
        let matches = str.match(/([A-Za-z][^/]+)/g);
        if (!matches || matches.length < 3) {
            return { benchmark: str, story: '', metric: '' };
        }
        let [benchmark, story, metric] = matches;
        return { benchmark, story, metric };
    }

    parseValue(str) {
        let match = [...str.matchAll(/([0-9.]+)(?: ([a-zA-Z]+))?/g)][0];
        if (!match) return { value: 0, unit: '' };
        return { value: Number(match[1]), unit: match[2] || '' };
    }

    parseListCell(cell) {
        const originalId = cell.id;
        cell.id = 'currentCell';
        const rowCells = document.querySelectorAll(`#currentCell div.ms-DetailsRow-cell`);
        cell.id = originalId;
        
        if (rowCells.length < 5) {
            console.warn('Not enough row cells found:', rowCells.length);
            return null;
        }
        
        const texts = [...rowCells].map(div => div.textContent);
        const parsedMetricName = this.parseMetricName(texts[0]);
        const group = texts[1];
        const percentChange = Number(texts[2]);
        const baselineValue = this.parseValue(texts[3]);
        const comparisonValue = this.parseValue(texts[4]);
        
        if (baselineValue.unit !== comparisonValue.unit) {
            console.warn(`Unmatched unit: ${baselineValue.unit} vs. ${comparisonValue.unit}`);
        }
        
        return {
            ...parsedMetricName,
            group,
            percentChange,
            baselineValue: baselineValue.value,
            comparisonValue: comparisonValue.value,
            unit: comparisonValue.unit
        };
    }

    listPageHandlerBuilder(wrapper, targetArray) {
        return () => {
            [...this.getListPageCells(wrapper)].forEach(cell => {
                const parsed = this.parseListCell(cell);
                if (parsed) {
                    targetArray.push(parsed);
                }
            });
        };
    }

    async listPageIterator(wrapper, listPageHandler, targetPage, totalPage, finishCallback) {
        this.navigateToPage(targetPage, wrapper, async () => {
            listPageHandler();
            if (targetPage < totalPage) {
                window.setTimeout(() => this.listPageIterator(wrapper, listPageHandler, targetPage + 1, totalPage, finishCallback), 100);
            } else {
                window.setTimeout(finishCallback, 0);
            }
        });
    }

    async grabWrapperDataWithProgress(wrapper, targetArray, name, startProgress, endProgress) {
        console.log(`📊 Starting extraction for ${name}...`);
        
        try {
            const pageIndicator = this.getPageIndicatorFromWrapper(wrapper.id);
            if (!pageIndicator) {
                console.warn(`No page indicator found for ${name}, extracting current page only`);
                this.updateProgress(Math.round((startProgress + endProgress) / 2), `Processing ${name}`);
                const handler = this.listPageHandlerBuilder(wrapper, targetArray);
                handler();
                this.updateProgress(endProgress, `Completed ${name}`);
                return;
            }
            
            const pageInfo = this.parsePageIndicator(pageIndicator);
            console.log(`📄 ${name}: Processing ${pageInfo.totalPage} pages`);
            
            return new Promise((resolve) => {
                this.listPageIteratorWithProgress(
                    wrapper,
                    this.listPageHandlerBuilder(wrapper, targetArray),
                    1,
                    pageInfo.totalPage,
                    startProgress,
                    endProgress,
                    name,
                    () => {
                        console.log(`✅ ${name}: Extracted ${targetArray.length} items from ${pageInfo.totalPage} pages`);
                        this.updateProgress(endProgress, `Completed ${name}`);
                        resolve();
                    }
                );
            });
            
        } catch (error) {
            console.error(`❌ Error extracting ${name}:`, error);
        }
    }

    listPageIteratorWithProgress(wrapper, listPageHandler, targetPage, totalPage, startProgress, endProgress, name, finishCallback) {
        // Calculate progress based on current page
        const pageProgress = startProgress + ((targetPage - 1) / totalPage) * (endProgress - startProgress);
        this.updateProgress(Math.round(pageProgress), `Processing ${name} (${targetPage}/${totalPage})`);
        
        this.navigateToPage(targetPage, wrapper, () => {
            listPageHandler();
            if (targetPage < totalPage) {
                setTimeout(() => 
                    this.listPageIteratorWithProgress(wrapper, listPageHandler, targetPage + 1, totalPage, startProgress, endProgress, name, finishCallback), 
                    100
                );
            } else {
                setTimeout(finishCallback, 0);
            }
        });
    }

    async grabWrapperData(wrapper, targetArray, name) {
        console.log(`📊 Starting extraction for ${name}...`);
        
        try {
            const pageIndicator = this.getPageIndicatorFromWrapper(wrapper.id);
            if (!pageIndicator) {
                console.warn(`No page indicator found for ${name}, extracting current page only`);
                const handler = this.listPageHandlerBuilder(wrapper, targetArray);
                handler();
                return;
            }
            
            const pageInfo = this.parsePageIndicator(pageIndicator);
            console.log(`📄 ${name}: Processing ${pageInfo.totalPage} pages`);
            
            return new Promise((resolve) => {
                this.listPageIterator(
                    wrapper,
                    this.listPageHandlerBuilder(wrapper, targetArray),
                    1,
                    pageInfo.totalPage,
                    () => {
                        console.log(`✅ ${name}: Extracted ${targetArray.length} items from ${pageInfo.totalPage} pages`);
                        resolve();
                    }
                );
            });
            
        } catch (error) {
            console.error(`❌ Error extracting ${name}:`, error);
        }
    }

    async grabWrapperData(wrapper, targetArray, name) {
        if (!wrapper) {
            console.log(`No wrapper found for ${name}, skipping...`);
            return;
        }

        const pageIndicator = this.getPageIndicatorFromWrapper(wrapper.id);
        if (!pageIndicator) {
            // Try to find pagination elements more broadly
            const paginationElements = wrapper.querySelectorAll('p');
            let foundPageIndicator = null;
            
            for (const p of paginationElements) {
                if (p.textContent && p.textContent.match(/\d+\s*\/\s*\d+/)) {
                    foundPageIndicator = p;
                    break;
                }
            }
            
            if (!foundPageIndicator) {
                // If no pagination found, try to extract data from current page only
                console.log(`No page indicator found for ${name}, extracting current page only...`);
                const cells = this.getListPageCells(wrapper);
                if (cells && cells.length > 0) {
                    cells.forEach(cell => {
                        try {
                            targetArray.push(this.parseListCell(cell));
                        } catch (error) {
                            console.warn(`Error parsing cell in ${name}:`, error);
                        }
                    });
                }
                return;
            } else {
                console.log(`Found alternative page indicator for ${name}`);
            }
        }

        const totalPages = pageIndicator ? this.parsePageIndicator(pageIndicator).totalPage : 1;
        
        return new Promise((resolve) => {
            this.listPageIterator(
                wrapper,
                this.listPageHandlerBuilder(wrapper, targetArray),
                1,
                totalPages,
                resolve
            );
        });
    }

    getPageIndicatorFromWrapper(wrapperId) {
        if (!wrapperId) return null;
        
        // Try the original selector first
        let indicator = document.querySelector(`#${wrapperId} > div:nth-child(2) > div:nth-child(3) > p`);
        
        if (!indicator) {
            // Try alternative selectors
            const alternatives = [
                `#${wrapperId} p`, // Any p tag within the wrapper
                `#${wrapperId} [role="status"]`, // Look for status elements
                `#${wrapperId} div[class*="page"]`, // Look for elements with "page" in class name
            ];
            
            for (const selector of alternatives) {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                    if (el.textContent && el.textContent.match(/\d+\s*\/\s*\d+/)) {
                        indicator = el;
                        break;
                    }
                }
                if (indicator) break;
            }
        }
        
        return indicator;
    }

    parsePageIndicator(pageIndicator) {
        if (!pageIndicator || !pageIndicator.textContent) {
            return { currentPage: 1, totalPage: 1 };
        }
        
        const matches = [...pageIndicator.textContent.matchAll(/(\d+)\s*\/\s*(\d+)/g)];
        if (matches.length === 0) {
            console.warn('Could not parse page indicator:', pageIndicator.textContent);
            return { currentPage: 1, totalPage: 1 };
        }
        
        return {
            currentPage: Number(matches[0][1]), 
            totalPage: Number(matches[0][2])
        };
    }

    isWrapperBusy(wrapper) {
        return document.querySelector(`#${wrapper.id} > div:nth-child(1) > div.ms-Spinner`) != null;
    }

    getPageButtons(wrapper) {
        const buttons = document.querySelectorAll(`#${wrapper.id} > div:nth-child(2) > div:nth-child(3) > button`);
        return {buttonPrev: buttons[0], buttonNext: buttons[1]};
    }

    async navigateToPage(targetPage, wrapper, callback) {
        const waitAndSee = () => setTimeout(() => this.navigateToPage(targetPage, wrapper, callback), 100);
        
        if (this.isWrapperBusy(wrapper)) {
            waitAndSee();
            return;
        }

        const pageInfo = this.parsePageIndicator(this.getPageIndicatorFromWrapper(wrapper.id));
        if (pageInfo.currentPage === targetPage) {
            setTimeout(callback, 0);
            return;
        }

        const pageButtons = this.getPageButtons(wrapper);
        if (pageInfo.currentPage > targetPage) {
            pageButtons.buttonPrev.click();
        } else {
            pageButtons.buttonNext.click();
        }
        waitAndSee();
    }

    getListPageCells(wrapper) {
        if (!wrapper) return [];
        
        // Try the original selector first
        let cells = document.querySelectorAll(`#${wrapper.id} div.ms-List-page div.ms-List-cell`);
        
        if (cells.length === 0) {
            // Try alternative selectors
            const alternatives = [
                `#${wrapper.id} .ms-List-cell`, // Any list cell in the wrapper
                `#${wrapper.id} [role="row"]`, // Look for row elements
                `#${wrapper.id} div[class*="row"]`, // Look for elements with "row" in class name
                `#${wrapper.id} div[class*="cell"]`, // Look for elements with "cell" in class name
            ];
            
            for (const selector of alternatives) {
                cells = document.querySelectorAll(selector);
                if (cells.length > 0) {
                    console.log(`Found ${cells.length} cells using alternative selector: ${selector}`);
                    break;
                }
            }
        }
        
        return cells;
    }

    parseMetricName(str) {
        const matches = str.match(/([A-Za-z][^/]+)/g);
        if (matches && matches.length >= 3) {
            return {benchmark: matches[0], story: matches[1], metric: matches[2]};
        }
        return {benchmark: str, story: '', metric: ''};
    }

    parseValue(str) {
        if (!str || typeof str !== 'string') {
            return {value: 0, unit: ''};
        }
        
        const matches = [...str.matchAll(/([0-9.,]+)\s*([a-zA-Z%]*)/g)];
        if (matches.length > 0) {
            const value = Number(matches[0][1].replace(/,/g, '')) || 0;
            const unit = matches[0][2] || '';
            return {value, unit};
        }
        return {value: 0, unit: ''};
    }

    parseListCell(cell) {
        if (!cell) return null;
        
        cell.id = 'currentCell';
        
        // Try to find row cells with different possible selectors
        let rowCells = document.querySelectorAll('#currentCell div.ms-DetailsRow-cell');
        
        if (rowCells.length === 0) {
            // Try alternative selectors
            const alternatives = [
                '#currentCell [role="gridcell"]',
                '#currentCell div[class*="cell"]',
                '#currentCell td',
                '#currentCell > div > div', // Generic nested divs
            ];
            
            for (const selector of alternatives) {
                rowCells = document.querySelectorAll(selector);
                if (rowCells.length > 0) {
                    break;
                }
            }
        }
        
        cell.id = '';
        
        if (rowCells.length < 5) {
            console.warn(`Found only ${rowCells.length} cells, expected at least 5`);
            return null;
        }
        
        try {
            const texts = [...rowCells].map(div => div.textContent?.trim() || '');
            const parsedMetricName = this.parseMetricName(texts[0]);
            const group = texts[1];
            const percentChange = Number(texts[2]) || 0;
            const baselineValue = this.parseValue(texts[3]);
            const comparisonValue = this.parseValue(texts[4]);
            
            return {
                ...parsedMetricName,
                group,
                percentChange,
                baselineValue: baselineValue.value,
                comparisonValue: comparisonValue.value,
                unit: comparisonValue.unit || baselineValue.unit || ''
            };
        } catch (error) {
            console.warn('Error parsing list cell:', error);
            return null;
        }
    }

    listPageHandlerBuilder(wrapper, targetArray) {
        return () => {
            const cells = this.getListPageCells(wrapper);
            console.log(`Processing ${cells.length} cells from ${wrapper.id}`);
            
            cells.forEach(cell => {
                try {
                    const parsed = this.parseListCell(cell);
                    if (parsed) {
                        targetArray.push(parsed);
                    }
                } catch (error) {
                    console.warn('Error processing cell:', error);
                }
            });
        };
    }

    listPageIterator(wrapper, listPageHandler, targetPage, totalPage, finishCallback) {
        this.navigateToPage(targetPage, wrapper, () => {
            listPageHandler();
            if (targetPage < totalPage) {
                setTimeout(() => this.listPageIterator(wrapper, listPageHandler, targetPage + 1, totalPage, finishCallback), 100);
            } else {
                setTimeout(finishCallback, 0);
            }
        });
    }

    displayResults() {
        // Prepare data
        this.allData = [
            ...this.improvementArray.map(item => ({...item, type: 'improvement'})),
            ...this.regressionArray.map(item => ({...item, type: 'regression'}))
        ];
        
        this.updateTabContent();
        this.updateStats();
    }

    updateStats() {
        const statsDiv = document.getElementById('perf-stats');
        const improvements = this.improvementArray.length;
        const regressions = this.regressionArray.length;
        
        // Keep the stats display consistent regardless of active tab
        // This prevents the header from shifting when switching tabs
        statsDiv.innerHTML = `
            <span class="stat-item improvements">${improvements} improvements</span>
            <span class="stat-divider">•</span>
            <span class="stat-item regressions">${regressions} regressions</span>
            <span class="stat-divider">•</span>
            <span class="stat-item">Total: ${improvements + regressions} items</span>
        `;
    }

    renderTable(data, type) {
        const tableId = `table-${type}`;
        
        let html = `
            <div class="perf-table-container">
                <table class="perf-table" id="${tableId}">
                    <thead>
                        <tr>
                            <th class="table-header" data-column="benchmark" data-type="${type}">
                                Benchmark <span class="sort-indicator" id="sort-${type}-benchmark"></span>
                            </th>
                            <th class="table-header" data-column="story" data-type="${type}">
                                Story <span class="sort-indicator" id="sort-${type}-story"></span>
                            </th>
                            <th class="table-header" data-column="metric" data-type="${type}">
                                Metric <span class="sort-indicator" id="sort-${type}-metric"></span>
                            </th>
                            <th class="table-header" data-column="group" data-type="${type}">
                                Group <span class="sort-indicator" id="sort-${type}-group"></span>
                            </th>
                            <th class="table-header" data-column="percentChange" data-type="${type}">
                                Percent Change <span class="sort-indicator" id="sort-${type}-percentChange">▼</span>
                            </th>
                            <th class="table-header" data-column="baselineValue" data-type="${type}">
                                Baseline <span class="sort-indicator" id="sort-${type}-baselineValue"></span>
                            </th>
                            <th class="table-header" data-column="comparisonValue" data-type="${type}">
                                Comparison <span class="sort-indicator" id="sort-${type}-comparisonValue"></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="${tableId}-body">
        `;

        // Sort data by percentChange descending by default (bigger values on top)
        const sortedData = [...data].sort((a, b) => {
            // For both improvements and regressions, show bigger absolute values first
            return Math.abs(b.percentChange) - Math.abs(a.percentChange);
        });

        sortedData.forEach(item => {
            html += `
                <tr class="table-row ${type}">
                    <td class="text-cell" title="${item.benchmark}">${item.benchmark}</td>
                    <td class="text-cell" title="${item.story}">${item.story}</td>
                    <td class="text-cell" title="${item.metric}">${item.metric}</td>
                    <td class="text-cell" title="${item.group}">${item.group}</td>
                    <td class="change-cell">
                        <span class="change-value ${type}">${item.percentChange > 0 ? '+' : ''}${item.percentChange}%</span>
                    </td>
                    <td class="value-cell">${this.formatValue(item.baselineValue, item.unit)}</td>
                    <td class="value-cell">${this.formatValue(item.comparisonValue, item.unit)}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    sortTable(type, field) {
        const data = type === 'improvement' ? this.improvementArray : this.regressionArray;
        const tableBodyId = `table-${type}-body`;
        const tableBody = document.getElementById(tableBodyId);
        
        if (!tableBody || !data.length) return;
        
        // Check current sort state
        const currentSort = this[`${type}Sort`] || { field: 'percentChange', direction: 'desc' };
        
        let direction = 'asc';
        if (currentSort.field === field) {
            direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else if (field === 'percentChange') {
            direction = 'desc'; // Default for percentChange
        }
        
        // Store sort state
        this[`${type}Sort`] = { field, direction };
        
        // Sort data
        const sortedData = [...data].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (direction === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
        
        // Update table body
        tableBody.innerHTML = '';
        sortedData.forEach(item => {
            const row = document.createElement('tr');
            row.className = `table-row ${type}`;
            row.innerHTML = `
                <td class="text-cell" title="${item.benchmark}">${item.benchmark}</td>
                <td class="text-cell" title="${item.story}">${item.story}</td>
                <td class="text-cell" title="${item.metric}">${item.metric}</td>
                <td class="text-cell" title="${item.group}">${item.group}</td>
                <td class="change-cell">
                    <span class="change-value ${type}">${item.percentChange > 0 ? '+' : ''}${item.percentChange}%</span>
                </td>
                <td class="value-cell">${this.formatValue(item.baselineValue, item.unit)}</td>
                <td class="value-cell">${this.formatValue(item.comparisonValue, item.unit)}</td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update sort indicators
        this.updateSortIndicators(type, field, direction);
    }

    updateSortIndicators(type, field, direction) {
        // Clear all indicators for this table
        document.querySelectorAll(`[id^="sort-${type}-"]`).forEach(indicator => {
            indicator.textContent = '';
        });
        
        // Set the current indicator
        const indicator = document.getElementById(`sort-${type}-${field}`);
        if (indicator) {
            indicator.textContent = direction === 'asc' ? '▲' : '▼';
        }
    }

    formatValue(value, unit) {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(2)}M ${unit}`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(2)}K ${unit}`;
        } else {
            return `${value.toFixed(2)} ${unit}`;
        }
    }

    renderMetricItem(item, index, type) {
        return `
            <div class="perf-metric-item ${type}">
                <div class="perf-metric-header">
                    <span class="perf-metric-number">${index}.</span>
                    <span class="perf-metric-name">${item.benchmark} / ${item.story} / ${item.metric}</span>
                </div>
                <div class="perf-metric-details">
                    <div class="perf-metric-row">
                        <span class="perf-label">Group:</span>
                        <span class="perf-value">${item.group}</span>
                    </div>
                    <div class="perf-metric-row">
                        <span class="perf-label">Change:</span>
                        <span class="perf-value perf-change ${type}">${item.percentChange}%</span>
                    </div>
                    <div class="perf-metric-row">
                        <span class="perf-label">Baseline:</span>
                        <span class="perf-value">${item.baselineValue} ${item.unit}</span>
                    </div>
                    <div class="perf-metric-row">
                        <span class="perf-label">Comparison:</span>
                        <span class="perf-value">${item.comparisonValue} ${item.unit}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async exportToExcel() {
        // Check if XLSX library is available
        if (typeof XLSX === 'undefined') {
            console.error('❌ XLSX library not loaded');
            alert('Excel export library is not available. Please reload the page and try again.');
            return;
        }

        if (!this.dataCache || (!this.regressionArray.length && !this.improvementArray.length)) {
            alert('No data available to export. Please analyze performance data first.');
            return;
        }

        console.log('📊 Starting Excel export with XLSX library');

        try {
            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Prepare regression data
            const regressionData = this.regressionArray.map(item => ({
                'Benchmark': item.benchmark,
                'Story': item.story,
                'Metric': item.metric,
                'Group': item.group,
                'Percent Change': item.percentChange + '%',
                'Baseline Value': item.baselineValue,
                'Comparison Value': item.comparisonValue,
                'Unit': item.unit,
                'Type': 'Regression'
            }));

            // Prepare improvement data
            const improvementData = this.improvementArray.map(item => ({
                'Benchmark': item.benchmark,
                'Story': item.story,
                'Metric': item.metric,
                'Group': item.group,
                'Percent Change': item.percentChange + '%',
                'Baseline Value': item.baselineValue,
                'Comparison Value': item.comparisonValue,
                'Unit': item.unit,
                'Type': 'Improvement'
            }));

            // Create worksheets
            if (regressionData.length > 0) {
                const regressionSheet = XLSX.utils.json_to_sheet(regressionData);
                
                // Set column widths for better readability
                regressionSheet['!cols'] = [
                    { width: 25 }, // Benchmark
                    { width: 20 }, // Story
                    { width: 20 }, // Metric
                    { width: 15 }, // Group
                    { width: 15 }, // Percent Change
                    { width: 15 }, // Baseline Value
                    { width: 15 }, // Comparison Value
                    { width: 10 }, // Unit
                    { width: 12 }  // Type
                ];
                
                // Freeze the first row (header)
                regressionSheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' };
                
                // Make header row bold - ensure style object exists first
                const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'];
                headerCells.forEach(cellRef => {
                    if (regressionSheet[cellRef]) {
                        // Initialize style object if it doesn't exist
                        if (!regressionSheet[cellRef].s) {
                            regressionSheet[cellRef].s = {};
                        }
                        if (!regressionSheet[cellRef].s.font) {
                            regressionSheet[cellRef].s.font = {};
                        }
                        regressionSheet[cellRef].s.font.bold = true;
                        
                        console.log(`✅ Applied bold formatting to regression header cell ${cellRef}`);
                    }
                });
                
                XLSX.utils.book_append_sheet(workbook, regressionSheet, 'P0 Regressions');
                console.log('📊 Added regressions sheet with formatting');
            }

            if (improvementData.length > 0) {
                const improvementSheet = XLSX.utils.json_to_sheet(improvementData);
                
                // Set column widths for better readability
                improvementSheet['!cols'] = [
                    { width: 25 }, // Benchmark
                    { width: 20 }, // Story
                    { width: 20 }, // Metric
                    { width: 15 }, // Group
                    { width: 15 }, // Percent Change
                    { width: 15 }, // Baseline Value
                    { width: 15 }, // Comparison Value
                    { width: 10 }, // Unit
                    { width: 12 }  // Type
                ];
                
                // Freeze the first row (header)
                improvementSheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' };
                
                // Make header row bold - ensure style object exists first
                const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'];
                headerCells.forEach(cellRef => {
                    if (improvementSheet[cellRef]) {
                        // Initialize style object if it doesn't exist
                        if (!improvementSheet[cellRef].s) {
                            improvementSheet[cellRef].s = {};
                        }
                        if (!improvementSheet[cellRef].s.font) {
                            improvementSheet[cellRef].s.font = {};
                        }
                        improvementSheet[cellRef].s.font.bold = true;
                        
                        console.log(`✅ Applied bold formatting to improvement header cell ${cellRef}`);
                    }
                });
                
                XLSX.utils.book_append_sheet(workbook, improvementSheet, 'P0 Improvements');
                console.log('📊 Added improvements sheet with formatting');
            }

            // Create summary sheet
            const summaryData = [
                { 'Category': 'P0 Regressions', 'Count': this.regressionArray.length },
                { 'Category': 'P0 Improvements', 'Count': this.improvementArray.length },
                { 'Category': 'Total Items', 'Count': this.regressionArray.length + this.improvementArray.length },
                { 'Category': 'Export Date', 'Count': new Date().toLocaleString() },
                { 'Category': 'Source URL', 'Count': window.location.href }
            ];
            
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            summarySheet['!cols'] = [{ width: 20 }, { width: 50 }];
            
            // Freeze the first row (header) and make it bold
            summarySheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' };
            const summaryHeaderCells = ['A1', 'B1'];
            summaryHeaderCells.forEach(cellRef => {
                if (summarySheet[cellRef]) {
                    // Initialize style object if it doesn't exist
                    if (!summarySheet[cellRef].s) {
                        summarySheet[cellRef].s = {};
                    }
                    if (!summarySheet[cellRef].s.font) {
                        summarySheet[cellRef].s.font = {};
                    }
                    summarySheet[cellRef].s.font.bold = true;
                    
                    console.log(`✅ Applied bold formatting to summary header cell ${cellRef}`);
                }
            });
            
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filename = `Pantheon_Performance_Analysis_${timestamp}.xlsx`;

            // Use chrome.downloads API for better file saving experience
            if (chrome && chrome.downloads) {
                // Convert workbook to array buffer
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                
                // Create object URL
                const url = URL.createObjectURL(blob);
                
                // Use Chrome downloads API to show save dialog
                chrome.downloads.download({
                    url: url,
                    filename: filename,
                    saveAs: true // This will show the save dialog
                }, (downloadId) => {
                    if (chrome.runtime.lastError) {
                        console.error('Download error:', chrome.runtime.lastError);
                        // Fallback to direct download
                        this.fallbackDownload(workbook, filename);
                    } else {
                        console.log('📁 Excel file download started:', filename);
                        // Clean up the object URL after a short delay
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }
                });
            } else {
                // Fallback for browsers without chrome.downloads API
                this.fallbackDownload(workbook, filename);
            }

        } catch (error) {
            console.error('❌ Error exporting to Excel:', error);
            alert('Failed to export Excel file. Please try again.');
        }
    }

    fallbackDownload(workbook, filename) {
        // Fallback download method
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        console.log('📁 Excel file downloaded:', filename);
    }

    showError(message) {
        const dataDiv = document.getElementById('perf-data');
        dataDiv.innerHTML = `
            <div class="perf-error">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the performance analyzer when DOM is ready
function initializePerfAnalyzer() {
    console.log('🚀 Initializing Pantheon Toolkit...');
    
    try {
        const perfAnalyzer = new PerformanceAnalyzer();
        
        // Make it globally available with error handling
        if (typeof window !== 'undefined') {
            window.perfAnalyzer = perfAnalyzer;
            console.log('✅ perfAnalyzer initialized and made globally available');
        } else {
            console.error('❌ Window object not available');
        }

        // Also add it to the global scope as a backup
        if (typeof globalThis !== 'undefined') {
            globalThis.perfAnalyzer = perfAnalyzer;
        }
        
        // Verify it's accessible
        if (window.perfAnalyzer) {
            console.log('✅ perfAnalyzer is accessible via window.perfAnalyzer');
            console.log('🔧 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.perfAnalyzer)));
        }
        
    } catch (error) {
        console.error('❌ Error initializing perfAnalyzer:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePerfAnalyzer);
} else {
    // DOM is already ready
    initializePerfAnalyzer();
}
// Popup Window Class
class PopupWindow {
    constructor(contentType, onClose) {
        this.contentType = contentType;
        this.onClose = onClose;
        this.position = this.getInitialPosition();
        this.isDragging = false;
        this.dragStartPosition = { x: 0, y: 0 };
        this.initialMousePosition = { x: 0, y: 0 };
        this.windowElement = null;
        this.animationFrame = null;
        this.currentTransform = { x: 0, y: 0 };
        
        console.log('Creating popup for:', contentType);
        this.render();
        this.setupEventListeners();
    }
    
    getInitialPosition() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const windowWidth = 800;
        const windowHeight = 600;
        
        return {
            x: Math.max(0, (viewportWidth - windowWidth) / 2),
            y: Math.max(0, (viewportHeight - windowHeight) / 2)
        };
    }
    
    getWindowConfig() {
        const configs = {
            'gilberto': {
                title: 'Gilberto Ramiro',
                url: 'https://gilbertoramiro.com'
            },
            'wholesomesound': {
                title: 'Wholesomesound',
                url: 'https://wholesomesound.com'
            },
            'folder': {
                title: 'HQ',
                url: 'https://wholesomesounds.com'
            },
            'purpose': {
                title: 'Purpose',
                url: '/vision/purpose'
            },
            'den': {
                title: 'Den',
                url: '/vision/den'
            }
        };
        
        return configs[this.contentType] || { title: 'Window', url: '/' };
    }
    
    render() {
        const config = this.getWindowConfig();
        
        // Create the popup window element
        this.windowElement = document.createElement('div');
        this.windowElement.className = 'popup-container';
        
        this.windowElement.innerHTML = `
            <div 
                class="popup-window" 
                style="
                    position: fixed;
                    left: ${this.position.x}px;
                    top: ${this.position.y}px;
                    width: 800px;
                    height: 600px;
                    background: white;
                    border: 4px solid #000;
                    box-shadow: 8px 8px 0px #000;
                    z-index: 1000;
                    font-family: monospace;
                    font-weight: bold;
                    will-change: transform;
                    transform: translate3d(0, 0, 0);
                "
            >
                <div 
                    class="window-title-bar" 
                    style="
                        height: 40px;
                        background: #000;
                        color: white;
                        border-bottom: 3px solid #000;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0 15px;
                        cursor: move;
                        font-weight: bold;
                        user-select: none;
                        font-size: 14px;
                        text-transform: uppercase;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                    "
                >
                    <span>${config.title}</span>
                    <button 
                        class="close-button"
                        style="
                            background: #ff0000;
                            color: white;
                            border: 2px solid #000;
                            width: 30px;
                            height: 30px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 18px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        "
                    >×</button>
                </div>
                <div class="window-content" style="height: calc(100% - 40px); overflow: hidden;">
                    <iframe 
                        src="${config.url}" 
                        style="width: 100%; height: 100%; border: none; pointer-events: auto;"
                        frameborder="0"
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(this.windowElement);
        console.log('Popup rendered and added to DOM');
    }
    
    setupEventListeners() {
        const titleBar = this.windowElement.querySelector('.window-title-bar');
        const closeButton = this.windowElement.querySelector('.close-button');
        const popupWindow = this.windowElement.querySelector('.popup-window');
        const iframe = this.windowElement.querySelector('iframe');
        
        // Close button functionality
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Close button clicked');
            this.close();
        });
        
        // Dragging functionality
        titleBar.addEventListener('mousedown', (e) => {
            this.startDragging(e);
        });
    }
    
    startDragging(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.isDragging = true;
        this.dragStartPosition = { x: this.position.x, y: this.position.y };
        this.initialMousePosition = { x: e.clientX, y: e.clientY };
        this.currentTransform = { x: 0, y: 0 };
        
        const popupWindow = this.windowElement.querySelector('.popup-window');
        const iframe = this.windowElement.querySelector('iframe');
        
        // Disable iframe pointer events during drag to prevent interference
        iframe.style.pointerEvents = 'none';
        
        // Add dragging class for potential CSS transitions
        popupWindow.classList.add('dragging');
        
        console.log('Started dragging');
        
        // Bind event handlers
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
        
        // Use passive: false for better performance and preventDefault capability
        document.addEventListener('mousemove', this.boundMouseMove, { passive: false });
        document.addEventListener('mouseup', this.boundMouseUp, { passive: false });
        
        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        // Use requestAnimationFrame for smooth animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.animationFrame = requestAnimationFrame(() => {
            this.updatePosition(e.clientX, e.clientY);
        });
    }
    
    updatePosition(clientX, clientY) {
        const deltaX = clientX - this.initialMousePosition.x;
        const deltaY = clientY - this.initialMousePosition.y;
        
        this.currentTransform.x = deltaX;
        this.currentTransform.y = deltaY;
        
        const popupWindow = this.windowElement.querySelector('.popup-window');
        
        // Use transform instead of changing left/top for better performance
        popupWindow.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        // Cancel any pending animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        const deltaX = e.clientX - this.initialMousePosition.x;
        const deltaY = e.clientY - this.initialMousePosition.y;
        
        // Update final position
        this.position = {
            x: this.dragStartPosition.x + deltaX,
            y: this.dragStartPosition.y + deltaY
        };
        
        const popupWindow = this.windowElement.querySelector('.popup-window');
        const iframe = this.windowElement.querySelector('iframe');
        
        // Reset transform and update position
        popupWindow.style.transform = 'translate3d(0, 0, 0)';
        popupWindow.style.left = `${this.position.x}px`;
        popupWindow.style.top = `${this.position.y}px`;
        
        // Re-enable iframe pointer events
        iframe.style.pointerEvents = 'auto';
        
        // Remove dragging class
        popupWindow.classList.remove('dragging');
        
        this.isDragging = false;
        
        // Clean up event listeners
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
        
        // Restore text selection
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        
        console.log('Stopped dragging');
    }
    
    close() {
        console.log('Closing popup');
        
        // Clean up any pending animation frames
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Clean up event listeners if still dragging
        if (this.isDragging) {
            document.removeEventListener('mousemove', this.boundMouseMove);
            document.removeEventListener('mouseup', this.boundMouseUp);
            
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
        }
        
        if (this.windowElement && document.body.contains(this.windowElement)) {
            document.body.removeChild(this.windowElement);
        }
        if (this.onClose) {
            this.onClose();
        }
    }
}

// Function to detect mobile devices
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Function to get URL for mobile redirect
function getMobileUrl(popupType) {
    const configs = {
        'gilberto': 'https://gilbertoramiro.com',
        'wholesomesound': 'https://wholesomesound.com',
        'folder': 'https://wholesomesounds.com',
        'purpose': '/vision/purpose',
        'den': '/vision/den'
    };
    
    return configs[popupType] || '/';
}

// Initialize popup functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up popup functionality');
    
    const isMobile = isMobileDevice();
    console.log('Is mobile device:', isMobile);
    
    let currentPopup = null;
    
    // Add click event listeners to all links with data-popup-type
    const popupLinks = document.querySelectorAll('[data-popup-type]');
    console.log('Found popup links:', popupLinks.length);
    
    popupLinks.forEach((link, index) => {
        console.log(`Setting up link ${index}:`, link.getAttribute('data-popup-type'));
        
        link.addEventListener('click', (e) => {
            const popupType = link.getAttribute('data-popup-type');
            
            if (isMobile) {
                // On mobile: redirect to the URL in a new tab
                console.log('Mobile device detected, redirecting to:', popupType);
                const url = getMobileUrl(popupType);
                window.open(url, '_blank');
                return; // Don't prevent default, let it open normally
            }
            
            // On desktop: show popup
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Desktop device, showing popup for:', popupType);
            
            // Close existing popup if any
            if (currentPopup) {
                currentPopup.close();
            }
            
            currentPopup = new PopupWindow(popupType, () => {
                currentPopup = null;
                console.log('Popup closed via callback');
            });
        });
    });
    
    // Close popup when clicking outside (desktop only)
    document.addEventListener('click', (e) => {
        if (!isMobile && currentPopup && 
            !e.target.closest('.popup-window') && 
            !e.target.closest('[data-popup-type]')) {
            console.log('Clicked outside, closing popup');
            currentPopup.close();
        }
    });
    
    // Handle window resize to detect mobile/desktop changes
    window.addEventListener('resize', () => {
        const newIsMobile = isMobileDevice();
        if (newIsMobile !== isMobile && currentPopup) {
            // If device type changed and popup is open, close it
            currentPopup.close();
        }
    });
});

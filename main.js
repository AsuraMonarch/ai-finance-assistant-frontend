// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showError('Network error occurred. Please check your connection.');
});

const API_URL = "https://ai-finance-backend-secure.onrender.com";
const token = localStorage.getItem("token");

// Loading state management
function showLoading(elementId, message = "Loading...") {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="loading">${message}</div>`;
        element.style.opacity = "0.7";
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.opacity = "1";
    }
}

function showError(message, duration = 5000) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div style="background: #ff4444; color: white; padding: 10px; border-radius: 5px; margin: 10px; text-align: center;">
            ${message}
            <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: white; cursor: pointer;">×</button>
        </div>
    `;
    document.body.insertBefore(errorDiv, document.body.firstChild);

    // Auto remove after duration
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, duration);
}

function showSuccess(message, duration = 3000) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
        <div style="background: #44ff44; color: black; padding: 10px; border-radius: 5px; margin: 10px; text-align: center;">
            ${message}
            <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: black; cursor: pointer;">×</button>
        </div>
    `;
    document.body.insertBefore(successDiv, document.body.firstChild);

    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, duration);
}

// Enhanced API call with error handling
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(API_URL + endpoint, { ...defaultOptions, ...options });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Network error' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        throw error;
    }
}

// Initial greeting message
function greetUser() {
appendBotMessage("Hi. I am your AI Finance Assistant. How can I help you today?");
}

// Quick reply buttons
function renderQuickReplies() {
const container = document.getElementById("quick-replies");
const suggestions = ["How is my budget?", "Show my spending", "Set a goal"];

container.innerHTML = "";
suggestions.forEach(text => {
const btn = document.createElement("button");
btn.textContent = text;
btn.addEventListener("click", () => handleUserInput(text));
container.appendChild(btn);
});
}

// Handle user input
function handleUserInput(message) {
appendUserMessage(message);
showTypingIndicator();
sendMessageToBot(message);
}

// Append messages
function appendUserMessage(text) {
appendMessage(text, "user-message");
}

function appendBotMessage(text) {
appendMessage(text, "bot-message");
}

function appendMessage(text, className) {
const chatBox = document.getElementById("chat-box");
const msg = document.createElement("div");
msg.className = className;
msg.textContent = text;
chatBox.appendChild(msg);
chatBox.scrollTop = chatBox.scrollHeight;
}

// Typing indicator
function showTypingIndicator() {
const chatBox = document.getElementById("chat-box");
const typing = document.createElement("div");
typing.id = "typing-indicator";
typing.className = "typing";
typing.textContent = "AI Assistant is typing...";
chatBox.appendChild(typing);
chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
const typing = document.getElementById("typing-indicator");
if (typing) typing.remove();
}

// Send message to backend
async function sendMessageToBot(message) {
if (!token) {
hideTypingIndicator();
appendBotMessage("Please login first.");
return;
}

try {
const response = await fetch(API_URL + "/chat", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": "Bearer " + token
},
body: JSON.stringify({ message })
});

const data = await response.json();

setTimeout(() => {
  hideTypingIndicator();

  if (response.status === 401) {
    appendBotMessage("Session expired. Please login again.");
    return;
  }

  appendBotMessage(data.reply || "Sorry. No response from assistant.");
}, 600);

} catch (error) {
hideTypingIndicator();
appendBotMessage("Unable to connect. Please try again later.");
console.error(error);
}
}
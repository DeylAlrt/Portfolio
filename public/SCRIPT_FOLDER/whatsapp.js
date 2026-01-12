// Initialize EmailJS - Wait for library to load first
document.addEventListener('DOMContentLoaded', function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("vvg-sBt7pyZ2SOfHk");
    } else {
        console.warn('EmailJS library not loaded. Email functionality disabled.');
    }
});

// Functions and variables for WhatsApp-like chat modal
const contactIcon = document.getElementById('contact-icon');
const overlay = document.getElementById('whatsapp-overlay');
const closeBtn = document.getElementById('close-modal-btn');
const chatListContainer = document.getElementById('chat-list');
const chatWindow = document.getElementById('chat-window');
const chatMain = document.getElementById('chat-main');
const headerPfp = document.getElementById('chat-header-pfp');
const headerName = document.getElementById('chat-header-name');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-message-btn');
let currentChatId = null;


// Chats
const chatData = {
    dale: {
        id: 'dale',
        name: 'Dale G. Alerta (You)',
        pfp: 'https://ik.imagekit.io/mpojoducq/Main%20Page%20Img?updatedAt=1752223341165',
        snippet: 'Hey there! I\'m Dale Alerta...',
        messages: [
            {
                type: 'received',
                text: "Hey there! I'm Dale Alerta.\n\nFeel free to reach out to me for collaborations, projects, or opportunities.\n\n📧 Email: alertadale@gmail.com\n📱 Phone: +971 52 149 0149\n🧑‍💼 LinkedIn: Dale Alerta\n💬 Instagram: @deyl.alrt\n🌐 Facebook: Dale Alerta\n\nI'd love to hear from you!",
                time: '1:00 PM'
            }
        ]
    },
    'lara': {
        id: 'lara',
        name: 'Lara S. Mendoza',
        pfp: 'https://img.icons8.com/color/96/000000/user-female-circle--v1.png',
        snippet: 'Oh, perfect. I\'ll review it in a bit. Thanks!',
        messages: [
            { type: 'sent', text: 'Hey, did you finish the new UI layout for the dashboard?', time: '3:36 PM' },
            { type: 'received', text: 'Almost! I just need to fix the spacing on the sidebar and update a few icons.', time: '3:58 PM' },
            { type: 'sent', text: 'Nice. Let me know once it\'s done so I can hook up the backend data.', time: '4:10 PM' },
            { type: 'received', text: 'Will do! By the way, did you check the latest commit on GitHub? I pushed some updates last night', time: '4:16 PM' },
            { type: 'sent', text: 'Oh, perfect. I\'ll review it in a bit. Thanks!', time: '4:29 PM' }
        ]
    },
    'jayson': {
        id: 'jayson',
        name: 'WhatsApp',
        pfp: 'https://img.icons8.com/?size=100&id=uZWiLUyryScN&format=png&color=000000',
        snippet: 'Messages and calls are end-to-end encrypted...',
        messages: [
            { type: 'received', text: 'Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them', time: 'Last Month' },
            { type: 'received', text: 'Remember to back up your chats to Google Drive to avoid losing messages or media.', time: 'Last Week' },
            { type: 'received', text: 'WhatsApp has been updated to improve performance and security. Make sure you\'re using the latest version.', time: 'Yesterday' },
            { type: 'received', text: 'For added security, turn on two-step verification in Settings > Account.', time: '3:20 AM' },
            { type: 'received', text: 'Your WhatsApp account is being registered on a new device. If you didn\'t do this, please verify your number immediately.', time: '5:13 AM' }
        ]
    }
};


// Utility functions
const formatTime = date => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
};


// Rendering functions
const renderMessages = messages => {
    chatWindow.innerHTML = '';
    messages.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${msg.type}`;

        const text = document.createElement('div');
        text.style.whiteSpace = 'pre-line';
        text.textContent = msg.text;

        const time = document.createElement('span');
        time.className = 'chat-timestamp';
        time.textContent = msg.time;

        bubble.appendChild(text);
        bubble.appendChild(time);
        chatWindow.appendChild(bubble);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
};


// Chat switching
const switchChat = chatId => {
    const data = chatData[chatId];
    if (!data) return;

    currentChatId = chatId;

    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    document.getElementById(`chat-${chatId}`).classList.add('active');

    headerPfp.src = data.pfp;
    headerName.textContent = data.name;

    renderMessages(data.messages);

    if (window.innerWidth <= 600) {
        chatMain.classList.add('active-mobile');
        if (!document.getElementById('mobile-back-btn')) {
            const backBtn = document.createElement('button');
            backBtn.id = 'mobile-back-btn';
            backBtn.innerHTML = '&#8592;';
            backBtn.style.cssText = 'background:none; border:none; color:white; font-size:1.8em; margin-right:10px; cursor:pointer;';
            backBtn.onclick = () => chatMain.classList.remove('active-mobile');
            document.querySelector('.chat-header').prepend(backBtn);
        }
    } else {
        const backBtn = document.getElementById('mobile-back-btn');
        if (backBtn) backBtn.remove();
    }

    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
};

// Render chat list
const renderChatList = () => {
    chatListContainer.innerHTML = '';
    Object.values(chatData).forEach(data => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.id = `chat-${data.id}`;
        item.innerHTML = `
            <img class="chat-pfp" src="${data.pfp}" alt="PFP">
            <div class="chat-info">
                <div class="chat-name">${data.name}</div>
                <div class="chat-snippet">${data.snippet}</div>
            </div>
        `;
        item.addEventListener('click', () => switchChat(data.id));
        chatListContainer.appendChild(item);
    });
};

// Function to send email via EmailJS
const sendEmailNotification = (messageText) => {
    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
        console.warn('ERROR! EmailJS not loaded.');
        return;
    }

    const templateParams = {
        from_name: 'User',
        message: messageText,
        to_name: 'Dale',
        reply_to: 'noreply@portfolio.com'
    };

    emailjs.send('service_ff6chqi', 'template_z60jwjd', templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
        }, function(error) {
            console.error('Failed to send email:', error);
        });
};

// Sending message
const sendMessage = () => {
    const text = messageInput.value.trim();
    if (text === '' || !currentChatId) return;

    const now = new Date();
    const newMessage = {
        type: 'sent',
        text: text,
        time: formatTime(now)
    };

    chatData[currentChatId].messages.push(newMessage);

    if (chatData[currentChatId].name.includes('(You)')) {
        chatData[currentChatId].snippet = `You: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`;
        document.getElementById(`chat-${currentChatId}`).querySelector('.chat-snippet').textContent = chatData[currentChatId].snippet;
    }

    renderMessages(chatData[currentChatId].messages);

    // Send email notification
    sendEmailNotification(text);

    messageInput.value = '';

    setTimeout(() => mockReply(currentChatId, text), 1500);
};

// Pre-made reply
function mockReply(chatId, sentText) {
    const data = chatData[chatId];
    const replyText = "Got your message! I'll get back to you soon.";
    const now = new Date();
    const mockMessage = {
        type: 'received',
        text: replyText,
        time: formatTime(now)
    };

    data.messages.push(mockMessage);
    data.snippet = replyText.substring(0, 20) + '...';
    document.getElementById(`chat-${chatId}`).querySelector('.chat-snippet').textContent = data.snippet;

    if (currentChatId === chatId) {
        renderMessages(data.messages);
    }
}

function openWhatsAppModal() {

    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '20000';
    void overlay.offsetWidth;
    overlay.classList.add('active');
    renderChatList();
    switchChat('dale');
    const appModal = document.getElementById('app-modal');
    const projectsModal = document.getElementById('projects-modal');
    if (appModal) appModal.style.display = 'none';
    if (projectsModal) projectsModal.style.display = 'none';
    // add taskbar button if helper available
    if (typeof window.addTaskbarButton === 'function') window.addTaskbarButton('📞 Contact','taskbar-btn-contact','whatsapp-overlay');
}

function closeWhatsAppModal() {
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

contactIcon.addEventListener('dblclick', openWhatsAppModal);
closeBtn.addEventListener('click', closeWhatsAppModal);
overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
        closeWhatsAppModal();
    }
});
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
        e.preventDefault();
    }
});

chatMain.addEventListener('click', function(e) {
    e.stopPropagation();
});

function updatePlaceholderOnResize() {
    if (window.innerWidth <= 600 && currentChatId === null) {
         headerName.textContent = 'WhatsApp';
    } else if (currentChatId === null) {
        headerName.textContent = 'Select a chat to begin';
    }
}
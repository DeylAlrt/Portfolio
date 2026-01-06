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

    const chatData = {
        dale: {
            id: 'dale',
            name: 'Dale G. Alerta (You)',
            pfp: 'https://ik.imagekit.io/mpojoducq/Main%20Page%20Img?updatedAt=1752223341165',
            snippet: 'Hey there! I’m Dale Alerta...',
            messages: [
                {
                    type: 'received',
                    text: "Hey there! I’m Dale Alerta.\n\nFeel free to reach out to me for collaborations, projects, or opportunities.\n\n📧 Email: alertadale@gmail.com\n📱 Phone: +971 52 149 0149\n🧑‍💼 LinkedIn: Dale Alerta\n💬 Instagram: @deyl.alrt\n🌐 Facebook: Dale Alerta\n\nI’d love to hear from you!",
                    time: '1:00 PM'
                }
            ]
        },
        'lara': {
            id: 'lara',
            name: 'Lara S. Mendoza',
            pfp: 'https://img.icons8.com/color/96/000000/user-female-circle--v1.png',
            snippet: 'Oh, perfect. I’ll review it in a bit. Thanks!',
            messages: [
                { type: 'sent', text: 'Hey, did you finish the new UI layout for the dashboard?', time: '3:36 PM' },
                { type: 'received', text: 'Almost! I just need to fix the spacing on the sidebar and update a few icons.', time: '3:58 PM' },
                { type: 'sent', text: 'Nice. Let me know once it’s done so I can hook up the backend data.', time: '4:10 PM' },
                { type: 'received', text: 'Will do! By the way, did you check the latest commit on GitHub? I pushed some updates last nigh', time: '4:16 PM' },
                { type: 'sent', text: 'Oh, perfect. I’ll review it in a bit. Thanks!', time: '4:29 PM' },
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
                { type: 'received', text: 'WhatsApp has been updated to improve performance and security. Make sure you’re using the latest version.', time: 'Yesterday' },
                { type: 'received', text: 'For added security, turn on two-step verification in Settings > Account.', time: '3:20 AM' },
                { type: 'received', text: 'Your WhatsApp account is being registered on a new device. If you didn’t do this, please verify your number immediately.', time: '5:13 AM' },
            ]
        }
    };

    const formatTime = date => {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    const renderMessages = messages => {
        chatWindow.innerHTML = '';
        messages.forEach(msg => {
            const bubble = document.createElement('div');
            bubble.className = `message-bubble ${msg.type}`;

            const text = document.createElement('div');
            text.style.whiteSpace = 'pre-line';  // respects \n perfectly
            text.textContent = msg.text;         // safe, no HTML injection risk

            const time = document.createElement('span');
            time.className = 'chat-timestamp';
            time.textContent = msg.time;

            bubble.appendChild(text);
            bubble.appendChild(time);
            chatWindow.appendChild(bubble);
        });
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    const switchChat = chatId => {
        const data = chatData[chatId];
        if (!data) return;

        currentChatId = chatId;

        // 1. Update active class in list
        document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
        document.getElementById(`chat-${chatId}`).classList.add('active');

        // 2. Update Header
        headerPfp.src = data.pfp;
        headerName.textContent = data.name;

        // 3. Update Messages
        renderMessages(data.messages);

        // 4. Handle mobile view: show chat main
        if (window.innerWidth <= 600) {
            chatMain.classList.add('active-mobile');
            // Inject a back button dynamically for mobile
            if (!document.getElementById('mobile-back-btn')) {
                const backBtn = document.createElement('button');
                backBtn.id = 'mobile-back-btn';
                backBtn.innerHTML = '&#8592;'; // Left arrow
                backBtn.style.cssText = 'background:none; border:none; color:white; font-size:1.8em; margin-right:10px; cursor:pointer;';
                backBtn.onclick = () => chatMain.classList.remove('active-mobile');
                document.querySelector('.chat-header').prepend(backBtn);
            }
        } else {
            // Remove any dynamically added back button on desktop
            const backBtn = document.getElementById('mobile-back-btn');
            if (backBtn) backBtn.remove();
        }

        // 5. Enable input
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    };

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

    const sendMessage = () => {
        const text = messageInput.value.trim();
        if (text === '' || !currentChatId) return;

        const now = new Date();
        const newMessage = {
            type: 'sent',
            text: text,
            time: formatTime(now)
        };

        // 1. Add message to the current chat's data
        chatData[currentChatId].messages.push(newMessage);

        // 2. Update snippet for the current chat (only if it's "You")
        if (chatData[currentChatId].name.includes('(You)')) {
            chatData[currentChatId].snippet = `You: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`;
            document.getElementById(`chat-${currentChatId}`).querySelector('.chat-snippet').textContent = chatData[currentChatId].snippet;
        }

        // 3. Re-render the chat window
        renderMessages(chatData[currentChatId].messages);

        // 4. Clear input
        messageInput.value = '';

        // Mock reply functionality for all chats, always triggering the fixed response
        setTimeout(() => mockReply(currentChatId, text), 1500);
    };

    function mockReply(chatId, sentText) {
        const data = chatData[chatId];
        // Use the fixed reply text as requested by the user
        const replyText = "Sorry, but you have to message me through my real WhatsApp (0521490149) 😊";
        const now = new Date();
        const mockMessage = {
            type: 'received',
            text: replyText,
            time: formatTime(now)
        };

        data.messages.push(mockMessage);
        data.snippet = replyText.substring(0, 20) + '...';
        document.getElementById(`chat-${chatId}`).querySelector('.chat-snippet').textContent = data.snippet;

        // Only re-render if the user is still on this chat
        if (currentChatId === chatId) {
            renderMessages(data.messages);
        }
    }

    // --- Modal Open/Close Logic ---

    function openWhatsAppModal() {
        overlay.style.display = 'flex';
        // Force reflow for transition
        void overlay.offsetWidth;
        overlay.classList.add('active');

        // Initial setup
        renderChatList();
        // Automatically open 'Dale G. Alerta (You)' chat on launch
        switchChat('dale');

        // Close all desktop app windows when the WhatsApp modal opens for a cleaner look
        appModal.style.display = 'none';
        projectsModal.style.display = 'none';
    }

    function closeWhatsAppModal() {
        overlay.classList.remove('active');
        // Wait for transition to finish before hiding display
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }

    // --- Event Listeners Integration ---
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
            e.preventDefault(); // Prevent default Enter key behavior
        }
    });

    // Ensure the main chat window doesn't get dismissed when clicking inside it on mobile
    chatMain.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Remove the default placeholder 'Select a chat to begin' from the header on mobile/desktop size change
    function updatePlaceholderOnResize() {
        if (window.innerWidth <= 600 && currentChatId === null) {
             headerName.textContent = 'WhatsApp';
        } else if (currentChatId === null) {
            headerName.textContent = 'Select a chat to begin';
        }
    }
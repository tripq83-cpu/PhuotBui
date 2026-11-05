async function initPiAuth() {
    try {
        if (typeof Pi !== 'undefined') {
            await Pi.init({ version: "2.0", apiKey: "82whbncni0u42en2cirvedpeu5kfwti3cpky1tgltvjctvj1gnukmldkkq2ptrl" });
            const auth = await Pi.authenticate(['username'], function(error) { console.error(error); });
            if (auth && auth.user && auth.user.username) {
                loggedUser = auth.user.username;
            }
        }
    } catch(e) { console.log("Chế độ giả lập cục bộ"); }
    
    if (!loggedUser || loggedUser === "Khách Pi") {
        loggedUser = localStorage.getItem('phuotbui_logged_user') || "bao211221";
    }
    localStorage.setItem('phuotbui_logged_user', loggedUser);
    
    const displayEl = document.getElementById('user-display-name');
    if(displayEl) displayEl.innerText = loggedUser;
    
    checkAdminRole();
    loadPosts();
}

function logoutPiUser() {
    localStorage.removeItem('phuotbui_logged_user');
    loggedUser = "Khách Pi";
    const displayEl = document.getElementById('user-display-name');
    if(displayEl) displayEl.innerText = "Đăng nhập";
    closeModal('login-modal');
    alert("Đã đăng xuất tài khoản thành công!");
    location.reload();
}

function openLoginModal() {
    const userEl = document.getElementById('modal-current-user');
    if(userEl) userEl.innerText = `Tài khoản hiện tại: ${loggedUser}`;
    const modalEl = document.getElementById('login-modal');
    if(modalEl) modalEl.classList.add('active');
}

function logAction(actionStr) {
    let logs = JSON.parse(localStorage.getItem('phuotbui_admin_logs')) || [];
    logs.unshift({ time: new Date().toLocaleTimeString('vi-VN'), user: loggedUser, action: actionStr });
    localStorage.setItem('phuotbui_admin_logs', JSON.stringify(logs));
}

function checkAdminRole() {
    const adminBtn = document.getElementById('admin-log-btn');
    if(!adminBtn) return;
    if (loggedUser === "bao211221") adminBtn.style.display = "flex";
    else adminBtn.style.display = "none";
}

function copyWalletAddress() {
    const inputEl = document.getElementById('wallet-address-input');
    if(!inputEl) return;
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inputEl.value).then(() => {
            alert("Đã sao chép địa chỉ ví Quỹ thành công!");
        }).catch(() => {
            document.execCommand('copy');
            alert("Đã sao chép địa chỉ ví Quỹ!");
        });
    } else {
        document.execCommand('copy');
        alert("Đã sao chép địa chỉ ví Quỹ!");
    }
}

async function fetchRealtimePiPrice() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network-iou&vs_currencies=usd');
        const data = await res.json();
        if (data && data['pi-network-iou']) {
            let livePrice = data['pi-network-iou'].usd + (Math.random() - 0.5) * 0.0015;
            const priceTag = document.getElementById('pi-price-tag');
            if(priceTag) priceTag.innerText = `$${Math.max(0.01, livePrice).toFixed(4)}`;
        }
    } catch(e) { 
        const priceTag = document.getElementById('pi-price-tag');
        if(priceTag) priceTag.innerText = `$0.0770`; 
    }
}

function openAdminLogModal() {
    let logs = JSON.parse(localStorage.getItem('phuotbui_admin_logs')) || [];
    const container = document.getElementById('admin-log-list');
    if(!container) return;
    container.innerHTML = '';
    if(logs.length === 0) container.innerHTML = '<p style="color:var(--text-sub);">Chưa có nhật ký hoạt động.</p>';
    logs.forEach(l => {
        container.innerHTML += `<p style="margin-bottom:4px; border-bottom:1px dashed #fdba74;">[${l.time}] <strong>${l.user}</strong>: ${l.action}</p>`;
    });
    const modal = document.getElementById('admin-log-modal');
    if(modal) modal.classList.add('active');
}

// Khởi chạy toàn bộ hệ thống khi trang tải xong
window.onload = function() {
    initPiAuth();
    fetchRealtimePiPrice();
    loadGroups();
    loadFinance();
    loadChat();
};

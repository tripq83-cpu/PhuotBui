let lastTabId = "feed";
let activeTabId = "feed";
let countdownSec = 60;

function switchTab(id, el) {
    if (activeTabId !== id) { lastTabId = activeTabId; activeTabId = id; }
    document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    const target = document.getElementById('tab-' + id);
    if(target) target.classList.add('active');
    if(el) {
        el.classList.add('active');
        const badge = el.querySelector('.badge');
        if(badge) badge.style.display = 'none';
    } else {
        const navMap = { feed: 0, schedule: 1, groups: 2, finance: 3, fund: 4, post: 5, chat: 6 };
        const navItems = document.querySelectorAll('.nav-item');
        if(navItems[navMap[id]]) navItems[navMap[id]].classList.add('active');
    }
}

function goBackTab() { 
    switchTab(lastTabId); 
}

function closeModal(id) { 
    document.getElementById(id).classList.remove('active'); 
}

function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
}

// Đồng hồ hệ thống & đếm ngược giá Pi
setInterval(() => {
    const now = new Date();
    const el = document.getElementById('live-clock');
    if(el) el.innerText = now.toLocaleTimeString('vi-VN', { hour12: false });
    
    countdownSec--;
    const secTag = document.getElementById('pi-sec');
    if(secTag) secTag.innerText = `${countdownSec}s`;
    if(countdownSec <= 0) { 
        if(typeof fetchRealtimePiPrice === 'function') fetchRealtimePiPrice(); 
        countdownSec = 60; 
    }
}, 1000);

function openWorldClockModal() {
    document.getElementById('world-clock-modal').classList.add('active');
    updateWorldClocks();
}

function updateWorldClocks() {
    const now = new Date();
    const vn = document.getElementById('time-vn');
    const us = document.getElementById('time-us');
    const jp = document.getElementById('time-jp');
    const uk = document.getElementById('time-uk');
    const au = document.getElementById('time-au');

    if(vn) vn.innerText = now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    if(us) us.innerText = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
    if(jp) jp.innerText = now.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' });
    if(uk) uk.innerText = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' });
    if(au) au.innerText = now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney' });
}
setInterval(updateWorldClocks, 1000);

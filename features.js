// --- MODULE TÍNH NĂNG HOÀN CHỈNH CHO PHƯỢT BỤI ---

let loggedUser = "bao211221";
let onlineUsers = ["bao211221", "Tuấn Pioneer", "Giang My", "Hoàng Nam", "Lan Anh", "Phượt Thủ Sài Gòn", "Hùng Sa Pa"];
let selectedPostMedia = []; 
let tempChatMediaData = { type: "", data: "" };

let defaultPosts = [{
    id: 1, author: "bao211221", location: "Đà Nẵng", timestamp: Date.now() - 300000,
    content: "<strong>Khởi hành cung đường mới</strong><br>Cung đường ven biển hôm nay thời tiết rất đẹp!",
    images: [],
    videos: [], likes: 5, likedUsers: [], comments: ["Chào admin chuyến đi suôn sẻ nhé!"]
}];

function handleMultiplePostMedia(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        let imgCount = selectedPostMedia.filter(m => m.type === 'image').length;
        let vidCount = selectedPostMedia.filter(m => m.type === 'video').length;

        if (file.type.includes('image')) {
            if (imgCount >= 2) { alert("Chỉ được chọn tối đa 2 ảnh!"); return; }
        } else if (file.type.includes('video')) {
            if (vidCount >= 1) { alert("Chỉ được chọn tối đa 1 video!"); return; }
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            selectedPostMedia.push({ 
                name: file.name, 
                type: file.type.includes('video') ? 'video' : 'image', 
                data: e.target.result 
            });
            renderPostMediaPreview();
        };
        reader.readAsDataURL(file);
    });
}

function removePostMediaItem(index) {
    selectedPostMedia.splice(index, 1);
    renderPostMediaPreview();
}

function renderPostMediaPreview() {
    const box = document.getElementById('post-preview-list');
    if(!box) return;
    box.innerHTML = '';
    selectedPostMedia.forEach((m, idx) => {
        box.innerHTML += `
            <div class="media-preview-item" style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:4px 8px; margin-bottom:4px; border-radius:4px; font-size:0.75rem;">
                <span><i class="fa-solid ${m.type==='video'?'fa-video':'fa-image'}"></i> ${m.name}</span>
                <button type="button" onclick="removePostMediaItem(${idx})" style="background:#ef4444; color:white; border:none; padding:2px 6px; border-radius:3px; cursor:pointer;">Xóa</button>
            </div>`;
    });
}

function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts'));
    if (!posts || posts.length === 0) { 
        posts = defaultPosts; 
        localStorage.setItem('phuotbui_posts', JSON.stringify(posts)); 
    }
    
    const container = document.getElementById('posts-feed-container');
    if(!container) return;
    container.innerHTML = '';
    
    posts.forEach((p, idx) => {
        let cHtml = '';
        if(p.comments && p.comments.length > 0) {
            p.comments.forEach(c => { cHtml += `<div class="comment-item" style="font-size:0.78rem; padding:2px 0;">• ${c}</div>`; });
        } else { 
            cHtml = `<div class="comment-item" style="color:var(--text-sub); font-size:0.78rem;">Chưa có bình luận.</div>`; 
        }
        
        let mediaHtml = '<div class="post-media-grid" style="display:flex; gap:4px; flex-wrap:wrap; margin-top:6px;">';
        if(p.images) p.images.forEach(img => { mediaHtml += `<img src="${img}" style="max-width:100%; max-height:180px; border-radius:6px; object-fit:cover;">`; });
        if(p.videos) p.videos.forEach(vid => { mediaHtml += `<video src="${vid}" controls playsinline webkit-playsinline style="max-width:100%; max-height:180px; border-radius:6px; background:#000;"></video>`; });
        mediaHtml += '</div>';

        let deleteBtn = "";
        if (loggedUser === "bao211221" || p.author === loggedUser) {
            deleteBtn = `<button onclick="deletePost(${idx})" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; font-size:0.75rem;"><i class="fa-solid fa-trash"></i> Xóa bài</button>`;
        }

        let hasLiked = p.likedUsers && p.likedUsers.includes(loggedUser);
        let heartIconClass = hasLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
        let heartStyle = hasLiked ? "color: #ef4444;" : "";

        container.innerHTML += `
            <div class="card" style="background:white; border-radius:8px; padding:10px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div class="post-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <div class="post-header-left" style="display:flex; align-items:center; gap:8px;">
                        <div class="avatar" style="width:32px; height:32px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:0.85rem;">${p.author.charAt(0).toUpperCase()}</div>
                        <div><strong>${p.author}</strong><p style="font-size:0.68rem; color:var(--text-sub);">${p.timestamp ? timeAgo(p.timestamp) : "Vừa đăng"} • ${p.location}</p></div>
                    </div>
                    ${deleteBtn}
                </div>
                <p style="font-size:0.85rem; line-height:1.4;">${p.content}</p>${mediaHtml}
                <div class="post-actions" style="display:flex; gap:15px; margin-top:8px; padding-top:6px; border-top:1px solid #f1f5f9; font-size:0.8rem; color:var(--text-sub);">
                    <span onclick="likePost(${idx})" style="cursor:pointer; ${heartStyle}"><i class="${heartIconClass}"></i> ${p.likes || 0} Thích</span>
                    <span><i class="fa-regular fa-comment"></i> ${p.comments ? p.comments.length : 0} Bình luận</span>
                    <span><i class="fa-solid fa-share"></i> Chia sẻ</span>
                </div>
                <div class="comments-section" style="margin-top:8px; background:#f8fafc; padding:6px; border-radius:6px;">
                    <div class="comment-list">${cHtml}</div>
                    <div class="comment-box-input" style="display:flex; gap:6px; margin-top:6px;">
                        <input type="text" id="cmt-${idx}" placeholder="Viết bình luận..." style="flex:1; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:0.78rem;">
                        <button class="btn-primary" onclick="addComment(${idx})" style="background:var(--primary); color:white; border:none; padding:4px 10px; border-radius:4px; font-size:0.78rem; cursor:pointer;">Gửi</button>
                    </div>
                </div>
            </div>`;
    });
}

function submitPost() {
    const titleEl = document.getElementById('post-title');
    const locEl = document.getElementById('post-location');
    const contentEl = document.getElementById('post-content');
    
    const title = titleEl ? titleEl.value.trim() : "";
    const loc = locEl ? locEl.value.trim() : "Việt Nam";
    const content = contentEl ? contentEl.value.trim() : "";
    
    if(!title || !content) { 
        alert("Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết!"); 
        return; 
    }
    
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    let imgs = selectedPostMedia.filter(m => m.type === 'image').map(m => m.data);
    let vids = selectedPostMedia.filter(m => m.type === 'video').map(m => m.data);

    posts.unshift({ 
        id: Date.now(), 
        author: loggedUser, 
        location: loc, 
        timestamp: Date.now(), 
        content: `<strong>${title}</strong><br>${content}`, 
        images: imgs, 
        videos: vids, 
        likes: 0, 
        likedUsers: [],
        comments: [] 
    });
    
    localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
    if(typeof logAction === 'function') logAction(`Đã đăng bài viết mới: "${title}"`);
    
    if(titleEl) titleEl.value = ''; 
    if(locEl) locEl.value = ''; 
    if(contentEl) contentEl.value = '';
    selectedPostMedia = []; 
    renderPostMediaPreview();
    
    loadPosts();
    switchTab('feed');
    alert("Đăng bài thành công! Đã chuyển về bảng tin.");
}

    
    localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
    if(typeof logAction === 'function') logAction(`Đã đăng bài viết mới: "${title}"`);
    
    if(titleEl) titleEl.value = ''; 
    if(locEl) locEl.value = ''; 
    if(contentEl) contentEl.value = '';
    selectedPostMedia = []; 
    renderPostMediaPreview();
    
    loadPosts();
    switchTab('feed');
    alert("Đăng bài thành công! Đã chuyển về bảng tin.");
}

function deletePost(idx) {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    let target = posts[idx];
    
    if (target) {
        if (loggedUser === "bao211221" || target.author === loggedUser) {
            if(confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
                posts.splice(idx, 1);
                localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
                if(typeof logAction === 'function') logAction(`Đã xóa bài viết index ${idx}`);
                loadPosts();
                alert("Đã xóa bài viết thành công!");
            }
        } else {
            alert("Chỉ có chủ sở hữu app hoặc tác giả bài viết mới có quyền xóa!");
        }
    } else {
        alert("Không tìm thấy bài viết để xóa!");
    }
}

function likePost(idx) {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    if(!posts[idx].likedUsers) posts[idx].likedUsers = [];
    
    let userIdx = posts[idx].likedUsers.indexOf(loggedUser);
    if(userIdx === -1) {
        posts[idx].likedUsers.push(loggedUser);
        posts[idx].likes = (posts[idx].likes || 0) + 1;
    } else {
        posts[idx].likedUsers.splice(userIdx, 1);
        posts[idx].likes = Math.max(0, (posts[idx].likes || 1) - 1);
    }
    
    localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
    loadPosts();
}

function addComment(idx) {
    const inputEl = document.getElementById(`cmt-${idx}`);
    if(!inputEl) return;
    const val = inputEl.value.trim();
    if(!val) return;
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    if(!posts[idx].comments) posts[idx].comments = [];
    posts[idx].comments.push(`${loggedUser}: ${val}`);
    localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
    loadPosts();
}
    function openOnlineUsersModal() {
    const modal = document.getElementById('online-users-modal');
    const container = document.getElementById('online-users-list');
    if(!container || !modal) return;
    container.innerHTML = '';
    onlineUsers.forEach(u => {
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed #e2e8f0; font-size:0.8rem;">
                <span><i class="fa-solid fa-user-check" style="color:#059669;"></i> ${u}</span>
                <div>
                    <button onclick="directChatWith('${u}')" style="background:var(--primary); color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.7rem; cursor:pointer;">Nhắn riêng</button>
                    <button onclick="inviteToGroup('${u}')" style="background:#059669; color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.7rem; cursor:pointer;">Thêm nhóm</button>
                </div>
            </div>`;
    });
    modal.classList.add('active');
}

function directChatWith(user) {
    closeModal('online-users-modal');
    switchTab('chat');
    const select = document.getElementById('chat-recipient');
    if(select && !Array.from(select.options).some(o => o.value === user)) {
        select.innerHTML += `<option value="${user}">Nhắn riêng: ${user}</option>`;
    }
    if(select) select.value = user;
}

function previewChatMedia(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        tempChatMediaData.data = e.target.result;
        tempChatMediaData.type = file.type.includes('video') ? 'video' : 'image';
        const previewContainer = document.getElementById('chat-preview-container');
        if(previewContainer) previewContainer.innerText = `Đã chọn: ${file.name}`;
    };
    reader.readAsDataURL(file);
}

function sendChatMessage() {
    const msgInput = document.getElementById('chat-msg');
    const recipientSelect = document.getElementById('chat-recipient');
    const m = msgInput ? msgInput.value.trim() : "";
    const recipient = recipientSelect ? recipientSelect.value : "ALL";
    if(!m && !tempChatMediaData.data) return;

    let chatHistory = JSON.parse(localStorage.getItem('phuotbui_chat')) || [];
    chatHistory.push({ 
        user: loggedUser, 
        recipient: recipient,
        msg: m, 
        image: tempChatMediaData.type === 'image' ? tempChatMediaData.data : "",
        video: tempChatMediaData.type === 'video' ? tempChatMediaData.data : ""
    });
    localStorage.setItem('phuotbui_chat', JSON.stringify(chatHistory));
    
    if(msgInput) msgInput.value = ''; 
    const previewContainer = document.getElementById('chat-preview-container');
    if(previewContainer) previewContainer.innerText = '';
    tempChatMediaData = { type: "", data: "" };
    loadChat();
}

function loadChat() {
    let chatHistory = JSON.parse(localStorage.getItem('phuotbui_chat')) || [
        { user: "Hệ thống", recipient: "ALL", msg: "Chào mừng phượt thủ đến với Phượt Bụi!", image: "", video: "" }
    ];
    const box = document.getElementById('chat-box');
    if(!box) return;
    box.innerHTML = '';
    chatHistory.forEach(c => {
        let mediaHtml = '';
        if(c.video) mediaHtml = `<br><video src="${c.video}" controls playsinline webkit-playsinline style="max-width:100%; max-height:150px; border-radius:4px; margin-top:4px; background:#000;"></video>`;
        else if(c.image) mediaHtml = `<br><img src="${c.image}" style="max-width:100%; max-height:150px; border-radius:4px; margin-top:4px;">`;
        
        let tagPriv = c.recipient !== "ALL" ? `<span style="color: #9333ea; font-size: 0.68rem;">[Riêng tư tới ${c.recipient}]</span>` : "";
        box.innerHTML += `<p style="margin-top:6px; border-bottom:1px dashed #e2e8f0; padding-bottom:4px; font-size:0.8rem;"><strong>${c.user}</strong> ${tagPriv}: ${c.msg} ${mediaHtml}</p>`;
    });
    box.scrollTop = box.scrollHeight;
}

function createGroup() {
    const nameEl = document.getElementById('group-name');
    const descEl = document.getElementById('group-desc');
    const name = nameEl ? nameEl.value.trim() : "";
    const desc = descEl ? descEl.value.trim() : "";
    if(!name) { alert("Nhập tên nhóm!"); return; }
    let groups = JSON.parse(localStorage.getItem('phuotbui_groups')) || [];
    groups.unshift({ name, leader: loggedUser, desc, members: [loggedUser] });
    localStorage.setItem('phuotbui_groups', JSON.stringify(groups));
    if(typeof logAction === 'function') logAction(`Đã tạo nhóm phượt mới: "${name}"`);
    alert("Đã tạo nhóm thành công!");
    if(nameEl) nameEl.value = ''; 
    if(descEl) descEl.value = '';
    loadGroups();
}

function deleteGroup(gIndex) {
    let groups = JSON.parse(localStorage.getItem('phuotbui_groups')) || [];
    let targetGroup = groups[gIndex];
    if (targetGroup && (targetGroup.leader === loggedUser || loggedUser === "bao211221")) {
        if (confirm(`Bạn có chắc chắn muốn xóa nhóm "${targetGroup.name}" không?`)) {
            groups.splice(gIndex, 1);
            localStorage.setItem('phuotbui_groups', JSON.stringify(groups));
            if(typeof logAction === 'function') logAction(`Đã xóa nhóm: "${targetGroup.name}"`);
            loadGroups();
            alert("Đã xóa nhóm thành công!");
        }
    } else {
        alert("Chỉ có Trưởng nhóm mới có quyền xóa nhóm này!");
    }
}

function loadGroups() {
    let groups = JSON.parse(localStorage.getItem('phuotbui_groups')) || [
        { name: "Phượt Thủ Miền Trung", leader: "bao211221", desc: "Chuyên đèo Hải Vân, Tây Nguyên.", members: ["bao211221", "Tuấn Pioneer", "Giang My"] }
    ];
    localStorage.setItem('phuotbui_groups', JSON.stringify(groups));
    const container = document.getElementById('groups-list-container');
    if(!container) return;
    container.innerHTML = '';
    groups.forEach((g, idx) => {
        let memsHtml = g.members ? g.members.map(m => `<span style="cursor:pointer; color:var(--primary); text-decoration:underline; margin-right:6px;" onclick="directChatWith('${m}')">${m}</span>`).join(", ") : g.leader;
        let deleteGroupBtn = (g.leader === loggedUser || loggedUser === "bao211221") ? `<button class="btn-secondary" style="background:#ef4444; color:white; font-size:0.75rem; padding:4px; margin-top:6px; border:none; border-radius:4px; cursor:pointer;" onclick="deleteGroup(${idx})"><i class="fa-solid fa-trash"></i> Xóa nhóm này</button>` : "";

        container.innerHTML += `
            <div class="card" style="background:white; border-radius:8px; padding:10px; margin-bottom:8px; border-left: 4px solid var(--primary); box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <strong><i class="fa-solid fa-users-rectangle"></i> ${g.name}</strong>
                <p style="font-size:0.75rem; color: var(--primary);">Trưởng nhóm: ${g.leader}</p>
                <p style="font-size:0.8rem; color: var(--text-sub); margin-top:4px;">${g.desc}</p>
                <p style="font-size:0.75rem; margin-top:6px;"><strong>Thành viên (${g.members ? g.members.length : 1}):</strong> ${memsHtml}</p>
                ${deleteGroupBtn}
            </div>`;
    });
}

function addFinanceItem() {
    const itemEl = document.getElementById('fin-item');
    const amountEl = document.getElementById('fin-amount');
    const userEl = document.getElementById('fin-user');
    const typeEl = document.getElementById('fin-type');
    
    const item = itemEl ? itemEl.value : "";
    const amount = amountEl ? parseFloat(amountEl.value) : NaN;
    const user = (userEl && userEl.value) ? userEl.value : loggedUser;
    const type = typeEl ? typeEl.value : "Thu";
    
    if(!item || isNaN(amount)) { alert("Vui lòng nhập đầy đủ nội dung và số Pi!"); return; }

    let finList = JSON.parse(localStorage.getItem('phuotbui_finance_pi')) || [];
    finList.push({ item, amount, user, type });
    localStorage.setItem('phuotbui_finance_pi', JSON.stringify(finList));
    if(typeof logAction === 'function') logAction(`Đã thêm sổ thu chi: ${type} ${amount} Pi cho ${item}`);
    if(itemEl) itemEl.value = ''; if(amountEl) amountEl.value = ''; if(userEl) userEl.value = '';
    loadFinance();
}

function deleteFinance(idx) {
    let finList = JSON.parse(localStorage.getItem('phuotbui_finance_pi')) || [];
    finList.splice(idx, 1);
    localStorage.setItem('phuotbui_finance_pi', JSON.stringify(finList));
    loadFinance();
}

function loadFinance() {
    let finList = JSON.parse(localStorage.getItem('phuotbui_finance_pi')) || [
        { item: "Ủng hộ quỹ chung", amount: 10, user: "bao211221", type: "Thu" },
        { item: "Mua đồ ăn cắm trại", amount: 2.5, user: "Tuấn Pioneer", type: "Chi" }
    ];
    localStorage.setItem('phuotbui_finance_pi', JSON.stringify(finList));
    const tbody = document.getElementById('finance-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    let totalPi = 0;
    finList.forEach((f, idx) => {
        if(f.type === 'Thu') totalPi += f.amount;
        else totalPi -= f.amount;

        tbody.innerHTML += `
            <tr style="border-bottom:1px solid #f1f5f9; font-size:0.8rem;">
                <td style="padding:6px;">${f.item}</td>
                <td style="padding:6px;"><strong>${f.user}</strong></td>
                <td style="padding:6px; color:${f.type==='Thu'?'#16a34a':'#dc2626'}; font-weight:bold;">${f.type}</td>
                <td style="padding:6px;"><strong>${f.amount}</strong> Pi</td>
                <td style="padding:6px;"><button onclick="deleteFinance(${idx})" style="background:none; border:none; color:red; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
    });
    const summaryTag = document.getElementById('finance-summary');
    if(summaryTag) summaryTag.innerText = `Tổng quỹ hiện tại: ${totalPi.toFixed(2)} Pi`;
}

function addTripSchedule() {
    const tEl = document.getElementById('trip-title');
    const dEl = document.getElementById('trip-date');
    const nEl = document.getElementById('trip-notes');
    const t = tEl ? tEl.value : "";
    const d = dEl ? dEl.value : "";
    const n = nEl ? nEl.value : "";
    if(!t || !d) { alert("Nhập tên và ngày khởi hành!"); return; }
    const listContainer = document.getElementById('trip-list-container');
    if(listContainer) {
        listContainer.innerHTML = `<div class="card" style="background:white; border-radius:8px; padding:10px; margin-bottom:8px; border-left:4px solid var(--primary); box-shadow:0 1px 3px rgba(0,0,0,0.1);"><strong>${t}</strong><p style="font-size:0.75rem; color:var(--primary);">Khởi hành: ${d}</p><p style="font-size:0.8rem; margin-top:4px;">${n || "Không có ghi chú."}</p></div>` + listContainer.innerHTML;
    }
    alert("Đã thêm lịch trình!");
}

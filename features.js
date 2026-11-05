let loggedUser = "Khách Pi";
let onlineUsers = ["bao211221", "Tuấn Pioneer", "Giang My", "Hoàng Nam", "Lan Anh", "Phượt Thủ Sài Gòn", "Hùng Sa Pa"];
let selectedPostMedia = []; 
let tempChatMediaData = { type: "", data: "" };

let defaultPosts = [{
    id: 1, author: "Tuấn Pioneer", location: "Sa Pa", timestamp: Date.now() - 300000,
    content: "Cung đường Ô Quy Hồ hôm nay mây vờn rất đẹp! Đã thanh toán Pi thử nghiệm.",
    images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500"],
    videos: [], likes: 152, likedUsers: [], comments: ["Cảnh đẹp quá anh ơi!"]
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
            selectedPostMedia.push({ name: file.name, type: file.type.includes('video') ? 'video' : 'image', data: e.target.result });
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
            <div class="media-preview-item">
                <span><i class="fa-solid ${m.type==='video'?'fa-video':'fa-image'}"></i> ${m.name}</span>
                <button onclick="removePostMediaItem(${idx})">Xóa</button>
            </div>`;
    });
}

function previewChatMedia(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        tempChatMediaData.data = e.target.result;
        tempChatMediaData.type = file.type.includes('video') ? 'video' : 'image';
        document.getElementById('chat-preview-container').innerText = `Đã chọn: ${file.name}`;
    };
    reader.readAsDataURL(file);
}

function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts'));
    if (!posts) { 
        posts = defaultPosts; 
        localStorage.setItem('phuotbui_posts', JSON.stringify(posts)); 
    }
    
    // TỰ ĐỘNG LỌC BỎ / XÓA HẲN CÁC BÀI VIẾT CỦA "Tuấn" THEO YÊU CẦU
    posts = posts.filter(p => !p.author.toLowerCase().includes("tuấn"));
    localStorage.setItem('phuotbui_posts', JSON.stringify(posts));

    const container = document.getElementById('posts-feed-container');
    if(!container) return;
    container.innerHTML = '';
    
    posts.forEach((p, idx) => {
        let cHtml = '';
        if(p.comments && p.comments.length > 0) {
            p.comments.forEach(c => { cHtml += `<div class="comment-item">• ${c}</div>`; });
        } else { cHtml = `<div class="comment-item" style="color:var(--text-sub);">Chưa có bình luận.</div>`; }
        
        let mediaHtml = '<div class="post-media-grid">';
        if(p.images) p.images.forEach(img => { mediaHtml += `<img src="${img}" class="post-img">`; });
        if(p.videos) p.videos.forEach(vid => { mediaHtml += `<video src="${vid}" controls playsinline webkit-playsinline class="post-video"></video>`; });
        mediaHtml += '</div>';

        // KIỂM TRA QUYỀN XÓA CHUẨN XÁC
        let deleteBtn = "";
        if (loggedUser === "bao211221" || p.author === loggedUser) {
            deleteBtn = `<button onclick="deletePost(${idx})" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; font-size:0.75rem;"><i class="fa-solid fa-trash"></i> Xóa bài</button>`;
        }

        let hasLiked = p.likedUsers && p.likedUsers.includes(loggedUser);
        let heartIconClass = hasLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
        let heartStyle = hasLiked ? "color: #ef4444;" : "";

        container.innerHTML += `
            <div class="card">
                <div class="post-header">
                    <div class="post-header-left">
                        <div class="avatar">${p.author.charAt(0).toUpperCase()}</div>
                        <div><strong>${p.author}</strong><p style="font-size:0.68rem; color:var(--text-sub);">${p.timestamp ? timeAgo(p.timestamp) : "Vừa đăng"} • ${p.location}</p></div>
                    </div>
                    ${deleteBtn}
                </div>
                <p style="font-size:0.85rem;">${p.content}</p>${mediaHtml}
                <div class="post-actions">
                    <span onclick="likePost(${idx})" style="cursor:pointer; ${heartStyle}"><i class="${heartIconClass}"></i> ${p.likes || 0} Thích</span>
                    <span><i class="fa-regular fa-comment"></i> ${p.comments ? p.comments.length : 0} Bình luận</span>
                    <span><i class="fa-solid fa-share"></i> Chia sẻ</span>
                </div>
                <div class="comments-section">
                    <div class="comment-list">${cHtml}</div>
                    <div class="comment-box-input">
                        <input type="text" id="cmt-${idx}" placeholder="Viết bình luận...">
                        <button class="btn-primary" onclick="addComment(${idx})">Gửi</button>
                    </div>
                </div>
            </div>`;
    });
}

function submitPost() {
    const title = document.getElementById('post-title').value.trim();
    const loc = document.getElementById('post-location').value.trim() || "Việt Nam";
    const content = document.getElementById('post-content').value.trim();
    
    if(!title || !content) { 
        alert("Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết!"); 
        return; 
    }
    
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    let imgs = selectedPostMedia.filter(m => m.type === 'image').map(m => m.data);
    let vids = selectedPostMedia.filter(m => m.type === 'video').map(m => m.data);

    posts.unshift({ 
        id: Date.now(), 
        author: loggedUser || "Phượt Thủ", 
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
    
    document.getElementById('post-title').value = ''; 
    document.getElementById('post-location').value = ''; 
    document.getElementById('post-content').value = '';
    selectedPostMedia = []; 
    renderPostMediaPreview();
    
    loadPosts();
    switchTab('feed');
    alert("Đăng bài thành công! Đã chuyển về bảng tin.");
}

function deletePost(postId) {
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
    const val = document.getElementById(`cmt-${idx}`).value.trim();
    if(!val) return;
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    if(!posts[idx].comments) posts[idx].comments = [];
    posts[idx].comments.push(`${loggedUser || "Thành viên"}: ${val}`);
    localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
    loadPosts();
}

function openOnlineUsersModal() {
    const modal = document.getElementById('online-users-modal');
    const container = document.getElementById('online-users-list');
    container.innerHTML = '';
    onlineUsers.forEach(u => {
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed #e2e8f0; font-size:0.8rem;">
                <span><i class="fa-solid fa-user-check" style="color:#059669;"></i> ${u}</span>
                <div>
                    <button onclick="directChatWith('${u}')" style="background:var(--primary); color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.7rem;">Nhắn riêng</button>
                    <button onclick="inviteToGroup('${u}')" style="background:#059669; color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.7rem;">Thêm nhóm</button>
                </div>
            </div>`;
    });
    modal.classList.add('active');
}

function directChatWith(user) {
    closeModal('online-users-modal');
    switchTab('chat');
    const select = document.getElementById('chat-recipient');
    if(!Array.from(select.options).some(o => o.value === user)) {
        select.innerHTML += `<option value="${user}">Nhắn riêng: ${user}</option>`;
    }
    select.value = user;
}

function addMemberToGroup(gIndex) {
    let groups = JSON.parse(localStorage.getItem('phuotbui_groups')) || [];
    let targetGroup = groups[gIndex];
    
    let optionsStr = onlineUsers.map((u, i) => `${i+1}. ${u}`).join("\n");
    let choice = prompt(`Chọn thành viên online muốn thêm vào nhóm "${targetGroup.name}" (Nhập số):\n${optionsStr}`);
    if(!choice) return;

    let addName = choice;
    let numIdx = parseInt(choice) - 1;
    if(!isNaN(numIdx) && onlineUsers[numIdx]) {
        addName = onlineUsers[numIdx];
    }

    if(!targetGroup.members) targetGroup.members = [];
    if(!targetGroup.members.includes(addName)) {
        targetGroup.members.push(addName);
        localStorage.setItem('phuotbui_groups', JSON.stringify(groups));
        if(typeof logAction === 'function') logAction(`Đã thêm thành viên "${addName}" vào nhóm ${targetGroup.name}`);
        loadGroups();
        alert(`Đã kết nạp ${addName} vào nhóm thành công!`);
    } else {
        alert("Thành viên này đã có trong nhóm rồi!");
    }
}

function inviteToGroup(user) {
    let groups = JSON.parse(localStorage.getItem('phuotbui_groups')) || [];
    if(groups.length === 0) { alert("Chưa có nhóm nào! Hãy tạo nhóm trước."); return; }
    let gNames = groups.map((g, i) => `${i+1}. ${g.name}`).join("\n");
    let choice = prompt(`Chọn nhóm muốn thêm ${user} vào (Nhập số):\n${gNames}`);
    let idx = parseInt(choice) - 1;
    if(!isNaN(idx) && groups[idx]) {
        if(!groups[idx].members) groups[idx].members = [];
        if(!groups[idx].members.includes(user)) {
            groups[idx].members.push(user);
            localStorage.setItem('phuotbui_groups', JSON.stringify(groups));
            if(typeof logAction === 'function') logAction(`Đã thêm ${user} vào nhóm ${groups[idx].name}`);
            alert(`Đã thêm ${user} vào nhóm thành công!`);
            loadGroups();
        } else {
            alert("Thành viên này đã có trong nhóm!");
        }
    }
}

function createGroup() {
    const name = document.getElementById('group-name').value.trim();
    const desc = document.getElementById('group-desc').value.trim();
    if(!name) { alert("Nhập tên nhóm!"); return; }
    let groups = JSON.parse(localStorage.getItem('phuotbui_groups')) || [];
    let leader = loggedUser || "bao211221";
    groups.unshift({ name, leader: leader, desc, members: [leader] });
    localStorage.setItem('phuotbui_groups', JSON.stringify(groups));
    if(typeof logAction === 'function') logAction(`Đã tạo nhóm phượt mới: "${name}"`);
    alert("Đã tạo nhóm thành công!");
    document.getElementById('group-name').value = ''; document.getElementById('group-desc').value = '';
    loadGroups();
}

function deleteGroup(gIndex) {
    let groups = JSON.parse(localStorage.getItem('phuotbui_groups')) || [];
    let targetGroup = groups[gIndex];
    if (targetGroup.leader === loggedUser || loggedUser === "bao211221") {
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
    const container = document.getElementById('groups-list-container');
    if(!container) return;
    container.innerHTML = '';
    groups.forEach((g, idx) => {
        let memsHtml = "";
        if (g.members) {
            memsHtml = g.members.map(m => `<span style="cursor:pointer; color:var(--primary); text-decoration:underline; margin-right:6px;" onclick="directChatWith('${m}')" title="Bấm để nhắn tin riêng">${m}</span>`).join(", ");
        } else {
            memsHtml = g.leader;
        }

        let deleteGroupBtn = "";
        if (g.leader === loggedUser || loggedUser === "bao211221") {
            deleteGroupBtn = `<button class="btn-secondary" style="background:#ef4444; color:white; font-size:0.75rem; padding:4px; margin-top:6px;" onclick="deleteGroup(${idx})"><i class="fa-solid fa-trash"></i> Xóa nhóm này</button>`;
        }

        container.innerHTML += `
            <div class="card" style="border-left: 4px solid var(--primary);">
                <strong><i class="fa-solid fa-users-rectangle"></i> ${g.name}</strong>
                <p style="font-size:0.75rem; color: var(--primary);">Trưởng nhóm: ${g.leader}</p>
                <p style="font-size:0.8rem; color: var(--text-sub); margin-top:4px;">${g.desc}</p>
                <p style="font-size:0.75rem; margin-top:6px;"><strong>Thành viên (${g.members ? g.members.length : 1}):</strong> ${memsHtml}</p>
                <div style="display:flex; gap:6px;">
                    <button class="btn-secondary" style="font-size:0.75rem; padding:4px; margin-top:6px; flex:1;" onclick="addMemberToGroup(${idx})"><i class="fa-solid fa-user-plus"></i> Thêm thành viên</button>
                    ${deleteGroupBtn}
                </div>
            </div>`;
    });
}

function addFinanceItem() {
    const item = document.getElementById('fin-item').value;
    const amount = parseFloat(document.getElementById('fin-amount').value);
    const user = document.getElementById('fin-user').value || loggedUser;
    const type = document.getElementById('fin-type').value;
    if(!item || isNaN(amount)) { alert("Vui lòng nhập đầy đủ nội dung và số Pi!"); return; }

    let finList = JSON.parse(localStorage.getItem('phuotbui_finance_pi')) || [];
    finList.push({ item, amount, user, type });
    localStorage.setItem('phuotbui_finance_pi', JSON.stringify(finList));
    if(typeof logAction === 'function') logAction(`Đã thêm sổ thu chi: ${type} ${amount} Pi cho ${item}`);
    document.getElementById('fin-item').value = ''; document.getElementById('fin-amount').value = ''; document.getElementById('fin-user').value = '';
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
            <tr>
                <td>${f.item}</td>
                <td><strong>${f.user}</strong></td>
                <td style="color:${f.type==='Thu'?'#16a34a':'#dc2626'}; font-weight:bold;">${f.type}</td>
                <td><strong>${f.amount}</strong> Pi</td>
                <td><button onclick="deleteFinance(${idx})" style="background:none; border:none; color:red; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
    });
    const summaryTag = document.getElementById('finance-summary');
    if(summaryTag) summaryTag.innerText = `Tổng quỹ hiện tại: ${totalPi.toFixed(2)} Pi`;
}

function sendChatMessage() {
    const m = document.getElementById('chat-msg').value.trim();
    const recipient = document.getElementById('chat-recipient').value;
    if(!m && !tempChatMediaData.data) return;

    let chatHistory = JSON.parse(localStorage.getItem('phuotbui_chat')) || [];
    chatHistory.push({ 
        user: loggedUser || "Tôi", 
        recipient: recipient,
        msg: m, 
        image: tempChatMediaData.type === 'image' ? tempChatMediaData.data : "",
        video: tempChatMediaData.type === 'video' ? tempChatMediaData.data : ""
    });
    localStorage.setItem('phuotbui_chat', JSON.stringify(chatHistory));
    
    document.getElementById('chat-msg').value = ''; 
    document.getElementById('chat-preview-container').innerText = '';
    tempChatMediaData = { type: "", data: "" };
    loadChat();
}

function loadChat() {
    let chatHistory = JSON.parse(localStorage.getItem('phuotbui_chat')) || [
        { user: "Hệ thống", recipient: "ALL", msg: "Chào mừng phượt thủ!", image: "", video: "" }
    ];
    const box = document.getElementById('chat-box');
    if(!box) return;
    box.innerHTML = '';
    chatHistory.forEach(c => {
        let mediaHtml = '';
        if(c.video) mediaHtml = `<br><video src="${c.video}" controls playsinline webkit-playsinline style="max-width:100%; max-height:150px; border-radius:4px; margin-top:4px; background:#000;"></video>`;
        else if(c.image) mediaHtml = `<br><img src="${c.image}" style="max-width:100%; max-height:150px; border-radius:4px; margin-top:4px;">`;
        
        let tagPriv = c.recipient !== "ALL" ? `<span style="color: #9333ea; font-size: 0.68rem;">[Riêng tư tới ${c.recipient}]</span>` : "";
        box.innerHTML += `<p style="margin-top:6px; border-bottom:1px dashed #e2e8f0; padding-bottom:4px;"><strong>${c.user}</strong> ${tagPriv}: ${c.msg} ${mediaHtml}</p>`;
    });
    box.scrollTop = box.scrollHeight;
}

function addTripSchedule() {
    const t = document.getElementById('trip-title').value, d = document.getElementById('trip-date').value, n = document.getElementById('trip-notes').value;
    if(!t || !d) { alert("Nhập tên và ngày khởi hành!"); return; }
    const listContainer = document.getElementById('trip-list-container');
    if(listContainer) {
        listContainer.innerHTML = `<div class="card" style="border-left:4px solid var(--primary);"><strong>${t}</strong><p style="font-size:0.75rem; color:var(--primary);">Khởi hành: ${d}</p><p style="font-size:0.8rem;">${n || "Không có ghi chú."}</p></div>` + listContainer.innerHTML;
    }
    alert("Đã thêm lịch trình!");
                                     }

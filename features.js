let loggedUser = "bao211221";

window.onload = function() {
    loadPosts();
};

function switchTab(tabName) {
    const formCard = document.getElementById('post-form-card');
    if(formCard) formCard.style.display = 'none';

    document.querySelectorAll('.app-tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    const target = document.getElementById('tab-' + tabName);
    if(target) {
        target.style.display = 'block';
    }

    ['tintuc', 'lichtrinh', 'nhom', 'thuchi', 'quypi', 'chat'].forEach(t => {
        let navEl = document.getElementById('nav-' + t);
        if(navEl) {
            navEl.style.color = (t === tabName) ? '#6b21a8' : '#64748b';
            navEl.style.fontWeight = (t === tabName) ? 'bold' : 'normal';
        }
    });
}

function togglePostForm() {
    switchTab('tintuc');
    const formCard = document.getElementById('post-form-card');
    if(formCard) {
        formCard.style.display = formCard.style.display === 'none' ? 'block' : 'none';
        if(formCard.style.display === 'block') {
            formCard.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts'));
    
    if (!posts || posts.length === 0) {
        posts = [
            {
                id: "post_1",
                author: "Tuấn Pioneer",
                avatarLetter: "T",
                avatarBg: "#4f46e5",
                location: "Sa Pa",
                timeText: "Vừa đăng",
                title: "",
                content: "Cung đường Ô Quy Hồ hôm nay mây vờn rất đẹp! Đã thanh toán Pi thử nghiệm.",
                likes: 152,
                comments: [
                    { user: "Cảnh đẹp quá anh ơi!", text: "" },
                    { user: "bao211221", text: "Haha" }
                ]
            }
        ];
        localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
    }
    
    const container = document.getElementById('posts-feed-container');
    if (!container) return;
    container.innerHTML = '';
    
    posts.forEach((p) => {
        if (!p.id) p.id = 'post_' + Date.now() + Math.floor(Math.random() * 1000);
        
        let deleteBtn = (loggedUser === "bao211221" || p.author === loggedUser || p.author === "Tuấn Pioneer") ? 
            `<button type="button" onclick="deletePost('${p.id}')" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; font-size:0.8rem; display:inline-flex; align-items:center; gap:4px; float:right;"><i class="fa-solid fa-trash"></i> Xóa bài</button>` : "";

        let avatarBg = p.avatarBg || '#6b21a8';
        let avatarLetter = p.avatarLetter || p.author.charAt(0).toUpperCase();

        let commentsHtml = '';
        if (p.comments && p.comments.length > 0) {
            p.comments.forEach(c => {
                commentsHtml += `<div style="font-size:0.85rem; margin-top:4px; background:#f8fafc; padding:6px; border-radius:4px;">• <strong>${c.user}</strong> ${c.text ? ': ' + c.text : ''}</div>`;
            });
        }
        
        container.innerHTML += `
            <div style="background:white; padding:12px; border-radius:8px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <div style="display:flex; gap:8px; align-items:center;">
                        <div style="width:36px; height:36px; background:${avatarBg}; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1rem;">${avatarLetter}</div>
                        <div>
                            <div style="font-size:1rem; font-weight:bold; color:#0f172a;">${p.author}</div>
                            <div style="font-size:0.75rem; color:#64748b;">${p.timeText || 'Vừa đăng'} • ${p.location || 'Việt Nam'}</div>
                        </div>
                    </div>
                    ${deleteBtn}
                </div>

                ${p.title ? `<div style="font-size:0.95rem; font-weight:bold; margin-bottom:4px;">${p.title}</div>` : ''}
                <div style="font-size:0.9rem; color:#334155; margin-bottom:10px; line-height:1.4;">${p.content}</div>

                <div style="display:flex; gap:16px; font-size:0.85rem; font-weight:500; color:#475569; border-top:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9; padding:8px 0; margin-bottom:8px;">
                    <span onclick="likePost('${p.id}')" style="cursor:pointer;"><i class="fa-regular fa-heart" style="color:#ef4444;"></i> ${p.likes || 0} Thích</span>
                    <span style="cursor:pointer;"><i class="fa-regular fa-comment"></i> ${(p.comments ? p.comments.length : 0)} Bình luận</span>
                    <span style="cursor:pointer;"><i class="fa-solid fa-share"></i> Chia sẻ</span>
                </div>

                <div style="margin-top:6px;">
                    ${commentsHtml}
                    <div style="margin-top:8px; display:flex; gap:6px;">
                        <input type="text" id="comment-input-${p.id}" placeholder="Viết bình luận..." style="font-size:0.85rem; padding:6px 8px; border:1px solid #cbd5e1; border-radius:4px; flex:1; box-sizing:border-box;">
                        <button type="button" onclick="addComment('${p.id}')" style="font-size:0.85rem; padding:6px 12px; background:#6b21a8; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Gửi</button>
                    </div>
                </div>
            </div>`;
    });
}

function submitPost() {
    const title = document.getElementById('post-title')?.value.trim() || "";
    const loc = document.getElementById('post-location')?.value.trim() || "Việt Nam";
    const content = document.getElementById('post-content')?.value.trim() || "";
    
    if(!content) { alert("Vui lòng nhập nội dung bài viết!"); return; }
    
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    posts.unshift({
        id: 'post_' + Date.now(),
        author: loggedUser,
        avatarLetter: "B",
        avatarBg: "#6b21a8",
        location: loc,
        timeText: "Vừa đăng",
        title: title,
        content: content,
        likes: 0,
        comments: []
    });
    
    localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
    if(document.getElementById('post-title')) document.getElementById('post-title').value = '';
    if(document.getElementById('post-location')) document.getElementById('post-location').value = '';
    if(document.getElementById('post-content')) document.getElementById('post-content').value = '';
    
    document.getElementById('post-form-card').style.display = 'none';
    loadPosts();
}

function deletePost(postId) {
    if (confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
        let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
        posts = posts.filter(p => String(p.id) !== String(postId));
        localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
        loadPosts();
    }
}

function likePost(postId) {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    let post = posts.find(p => String(p.id) === String(postId));
    if(post) {
        post.likes = (post.likes || 0) + 1;
        localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
        loadPosts();
    }
}

function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    if(!input || !input.value.trim()) return;
    
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    let post = posts.find(p => String(p.id) === String(postId));
    if(post) {
        if(!post.comments) post.comments = [];
        post.comments.push({ user: loggedUser, text: input.value.trim() });
        localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
        loadPosts();
    }
}

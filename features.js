let loggedUser = "bao211221";

// ĐỒNG HỒ REAL-TIME CHỐNG TREO
setInterval(() => {
    const clockEl = document.getElementById('live-clock');
    if(clockEl) {
        const now = new Date();
        clockEl.innerText = now.toTimeString().split(' ')[0];
    }
}, 1000);

window.onload = function() {
    loadPosts();
};

// NẠP DANH SÁCH BÀI ĐĂNG GIAO DIỆN CHUẨN BAN ĐẦU
function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts'));
    
    if (!posts || posts.length === 0) {
        posts = [
            {
                id: "post_1",
                author: "Phượt Thủ",
                location: "Nóc ông.. Trà My",
                timeText: "Vừa đăng",
                title: "Đi bụi",
                content: "Đi 2 ngày 1 đêm, trời lạnh",
                likes: 5,
                comments: [
                    { user: "Thành viên", text: "Okok" },
                    { user: "bao211221", text: "Okok" }
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
        
        // NÚT XÓA BÀI ĐƯỢC ÉP KIỂU NÚT THỰC SỰ - KHÔNG CHO BÔI ĐEN TEXT
        let deleteBtn = (loggedUser === "bao211221" || p.author === loggedUser || p.author === "Phượt Thủ") ? 
            `<button type="button" onclick="deletePost('${p.id}')" style="background:#fee2e2; color:#ef4444; border:1px solid #fca5a5; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:0.75rem; cursor:pointer; user-select:none; -webkit-user-select:none; display:inline-flex; align-items:center; gap:4px; margin-top:4px;">
                <i class="fa-solid fa-trash"></i> Xóa bài
            </button>` : "";

        let commentsHtml = '';
        if (p.comments && p.comments.length > 0) {
            p.comments.forEach(c => {
                commentsHtml += `<div style="font-size:0.85rem; margin-top:2px;">• <strong>${c.user}:</strong> ${c.text}</div>`;
            });
        }
        
        container.innerHTML += `
            <div style="background:white; padding:10px 0; border-bottom:1px solid #e2e8f0; margin-bottom:15px;">
                <div style="font-size:1.1rem; font-weight:bold; color:#0f172a;">${p.author}</div>
                <div style="font-size:0.75rem; color:#64748b; margin-bottom:6px;">${p.timeText || 'Vừa xong'} • ${p.location || 'Việt Nam'}</div>
                
                ${deleteBtn}

                <div style="font-size:1rem; font-weight:bold; margin-top:6px;">${p.title || ''}</div>
                <div style="font-size:0.9rem; color:#334155; margin-bottom:8px;">${p.content}</div>

                <!-- TƯƠNG TÁC BAN ĐẦU -->
                <div style="display:flex; gap:12px; font-size:0.85rem; font-weight:500; color:#1e293b; margin-bottom:6px;">
                    <span onclick="likePost('${p.id}')" style="cursor:pointer; user-select:none;"><i class="fa-regular fa-heart"></i> ${p.likes || 0} Thích</span>
                    <span style="cursor:pointer; user-select:none;"><i class="fa-regular fa-comment"></i> ${(p.comments ? p.comments.length : 0)} Bình luận</span>
                    <span style="cursor:pointer; user-select:none;"><i class="fa-solid fa-share"></i> Chia sẻ</span>
                </div>

                <!-- BÌNH LUẬN BAN ĐẦU -->
                <div style="margin-left:5px;">
                    ${commentsHtml}
                    <div style="margin-top:6px; display:flex; gap:4px;">
                        <input type="text" id="comment-input-${p.id}" placeholder="Viết bình luận..." style="font-size:0.8rem; padding:4px; border:1px solid #ccc; border-radius:3px; flex:1;">
                        <button type="button" onclick="addComment('${p.id}')" style="font-size:0.8rem; padding:4px 8px; background:#f1f5f9; border:1px solid #ccc; border-radius:3px; cursor:pointer;">Gửi</button>
                    </div>
                </div>
            </div>`;
    });
}

// THÊM BÀI ĐĂNG MỚI
function submitPost() {
    const title = document.getElementById('post-title')?.value.trim() || "";
    const loc = document.getElementById('post-location')?.value.trim() || "Việt Nam";
    const content = document.getElementById('post-content')?.value.trim() || "";
    
    if(!content) { alert("Vui lòng nhập nội dung!"); return; }
    
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    posts.unshift({
        id: 'post_' + Date.now(),
        author: loggedUser,
        location: loc,
        timeText: "Vừa xong",
        title: title,
        content: content,
        likes: 0,
        comments: []
    });
    
    localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
    if(document.getElementById('post-title')) document.getElementById('post-title').value = '';
    if(document.getElementById('post-location')) document.getElementById('post-location').value = '';
    if(document.getElementById('post-content')) document.getElementById('post-content').value = '';
    
    loadPosts();
}

// XÓA BÀI CHUẨN ĐÚNG NÚT BẤM
function deletePost(postId) {
    if (confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
        let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
        posts = posts.filter(p => String(p.id) !== String(postId));
        localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
        loadPosts();
    }
}

// THÍCH BÀI
function likePost(postId) {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    let post = posts.find(p => String(p.id) === String(postId));
    if(post) {
        post.likes = (post.likes || 0) + 1;
        localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
        loadPosts();
    }
}

// BÌNH LUẬN
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

// --- QUẢN LÝ BÀI VÀ XÓA BÀI CHUẨN ---
let loggedUser = "bao211221";

window.onload = function() {
    loadPosts();
};

function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [{
        id: 1, author: "bao211221", location: "Đà Nẵng", timestamp: Date.now(),
        content: "<strong>Chào mừng đến với Phượt Bụi</strong><br>Hệ thống khởi động lại hoàn toàn sạch sẽ!"
    }];
    
    const container = document.getElementById('posts-feed-container');
    if(!container) return;
    container.innerHTML = '';
    
    posts.forEach((p, idx) => {
        let deleteBtn = (loggedUser === "bao211221" || p.author === loggedUser) ? 
            `<button onclick="deletePost(${idx})" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; font-size:0.75rem;"><i class="fa-solid fa-trash"></i> Xóa bài</button>` : "";
        
        container.innerHTML += `
            <div style="background:white; border-radius:8px; padding:10px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <div><strong>${p.author}</strong><p style="margin:0; font-size:0.68rem; color:#64748b;">${p.location}</p></div>
                    ${deleteBtn}
                </div>
                <p style="font-size:0.85rem; margin:0;">${p.content}</p>
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
        alert("Vui lòng nhập đầy đủ tiêu đề và nội dung!"); 
        return; 
    }
    
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    posts.unshift({
        id: Date.now(), 
        author: loggedUser, 
        location: loc, 
        timestamp: Date.now(),
        content: `<strong>${title}</strong><br>${content}`
    });
    
    localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
    
    if(titleEl) titleEl.value = '';
    if(locEl) locEl.value = '';
    if(contentEl) contentEl.value = '';
    
    loadPosts();
    alert("Đăng bài thành công!");
}

function deletePost(idx) {
    let posts = JSON.parse(localStorage.getItem('phuotbui_posts')) || [];
    if (posts[idx]) {
        if (confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
            posts.splice(idx, 1);
            localStorage.setItem('phuotbui_posts', JSON.stringify(posts));
            loadPosts();
            alert("Đã xóa bài viết thành công!");
        }
    }
}

function toggleCommunityDropdown() {
    const dropdown = document.getElementById('communityDropdown');
    const isOpen = dropdown.classList.toggle('open');
    if (isOpen) {
        document.getElementById('communitySearch').focus();
    }
}

// Close when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('communityDropdown');
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

function selectCommunity(radio, name) {
    document.getElementById('communityTriggerLabel').textContent = name;
    document.getElementById('communityTriggerLabel').classList.add('selected');
    document.getElementById('communityDropdown').classList.remove('open');
}

function filterCommunities() {
    const filter = document.getElementById('communitySearch').value.toLowerCase();
    const items = document.getElementById('communityList').getElementsByClassName('community-radio-item');
    for (let i = 0; i < items.length; i++) {
        const text = items[i].querySelector('span').textContent.toLowerCase();
        items[i].style.display = text.includes(filter) ? '' : 'none';
    }
}

function toggleMedia(type) {
    const mapSection = document.getElementById('mapSection');
    const pictureSection = document.getElementById('pictureSection');
    
    mapSection.style.display = (type === 'map') ? 'block' : 'none';
    pictureSection.style.display = (type === 'picture') ? 'block' : 'none';
    
    // Clear inputs if hidden (optional but recommended)
    if (type !== 'map') mapSection.querySelector('input').value = '';
}

function toggleImageSource(source) {
    const local = document.getElementById('localUploadInput');
    const url = document.getElementById('urlUploadInput');
    
    local.style.display = (source === 'local') ? 'block' : 'none';
    url.style.display = (source === 'url') ? 'block' : 'none';
}

document.getElementById('postForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true; // Prevent double clicks

    const editId = this.getAttribute('data-edit-id');
    const mediaType = document.querySelector('input[name="mediaType"]:checked').value;
    
    let finalImageUrl = document.querySelector('input[name="imageUrl"]').value;
    const localFile = document.querySelector('input[name="imageFile"]')?.files[0];

    try {
        uploadBtn.disabled = true;
        // If user chose 'picture' AND selected a 'local' file, upload to owres.org first
        if (mediaType === 'picture' && localFile) {
            console.log("Uploading image to asset server...");
            finalImageUrl = await uploadImageToServer(localFile);
        }

        // Prepare payload for your RoeStack DB
        const payload = {
            title: document.querySelector('input[name="title"]').value.trim(),
            content: document.querySelector('textarea[name="content"]').value.trim(),
            category: document.querySelector('select[name="category"]').value,
            communityId: document.querySelector('input[name="communityId"]:checked')?.value,
            mapUrl: mediaType === 'map' ? document.querySelector('input[name="mapUrl"]').value.trim() : null,
            imageUrl: mediaType === 'picture' ? finalImageUrl : null
        };

        const url = editId ? `/edit-post/${editId}` : "/post";
        
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (result.postId) {
            window.location.href = "/post/" + result.postId;
        } else {
            alert("Error saving post: " + result.error);
            uploadBtn.disabled = false;
        }

    } catch (err) {
        console.error("Workflow failed:", err);
        alert("Action failed: " + err);
        uploadBtn.disabled = false;
        
    }
});
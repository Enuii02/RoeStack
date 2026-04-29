function toggleMenu(button) {
    const menu = button.nextElementSibling;
    menu.classList.toggle("show");
}

document.addEventListener("click", function (e) {
  document.querySelectorAll(".dropdown-menu.show").forEach(menu => {
    if (!menu.parentElement.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
});

// Open the file picker when the profile image is clicked
function triggerFileInput() {
    document.getElementById('avatarInput').click();
}

// Handle the file selection
function handleFileSelect(input) {
    if (input.files && input.files.length > 0) {
        resetAndUpload(input.files[0]);
    }
}
// Upload Logic 
function uploadFiles(file) {
    const userId = document.querySelector('.profile-photo').dataset.id;
    const endpoint = `https://owres.org/roestack/user/${userId}`;
    const progressBar = document.getElementById('progressBar');
    
    const formData = new FormData();
    formData.append('images[]', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);

    // Progress
    xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;

        const percent = (event.loaded / event.total) * 100;
        progressBar.style.width = percent + '%';
        progressBar.innerText = Math.round(percent) + '%';
    };

    xhr.onload = () => {
        const overlay = document.getElementById('loadingOverlay');
        console.log("Status:", xhr.status);
        console.log("Response:", xhr.responseText);

        try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
                window.location.reload();
            } else {
                alert(response.message || 'Upload failed');
                overlay.classList.remove('active');
            }
        } catch (e) {
            console.error('Invalid JSON response or server error');
            overlay.classList.remove('active');
        }
    };

    xhr.onerror = () => {
        alert('Upload error occurred');
    };

    xhr.send(formData);
}

async function resetAndUpload(file) {

    const overlay = document.getElementById('loadingOverlay');

    const userId = document.querySelector('.profile-photo').dataset.id;
    const path = `user/${userId}`; // Matches the PHP regex (?P<path>)
    const endpoint = `https://owres.org/roestack/${path}`;

    try {

        overlay.classList.add('active');

        // Delete all existing images at this path
        console.log("Cleaning up old images...");
        const deleteResponse = await fetch(endpoint, {
            method: 'DELETE'
        });

        if (!deleteResponse.ok) {
            console.warn("Delete failed or folder already empty.");
        }

        // 2. Now start the upload as usual
        console.log("Starting fresh upload...");
        uploadFiles(file, endpoint); 

    } catch (error) {
        console.error("Error in reset/upload flow:", error);
        overlay.classList.remove('active');
    }
}

// A general version of the upload logic that returns the URL
function uploadImageToServer(file) {
    return new Promise((resolve, reject) => {
        // Generic 'posts' path or unique ID for the folder
        const tempPath = `posts/${Date.now()}`; 
        const endpoint = `https://owres.org/roestack/${tempPath}`;
        const progressBar = document.getElementById('progressBar');
        
        const formData = new FormData();
        formData.append('images[]', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const percent = (event.loaded / event.total) * 100;
            progressBar.style.width = percent + '%';
            progressBar.innerText = Math.round(percent) + '%';
        };

        xhr.onload = () => {
            try {
                const response = JSON.parse(xhr.responseText);
                
                // Check the 'success' boolean
                // Drill down into 'data.saved' instead of 'images'
                if (response.success && response.data && response.data.saved.length > 0) {
                    
                    // The server response shows the path starts with a '/', 
                    // so we remove it or ensure the URL doesn't have double slashes
                    const relativePath = response.data.saved[0].path.replace(/^\//, ''); 
                    const absoluteUrl = `https://owres.org/roestack/${relativePath}`;
                    
                    console.log("Success! Image URL:", absoluteUrl);
                    resolve(absoluteUrl);
                } else {
                    // If success is false, or data is missing
                    reject(response.message || 'Upload failed');
                }
            } catch (e) {
                console.error("Parsing error:", e);
                reject('Invalid JSON response from asset server');
            }
        };

        xhr.onerror = () => reject('Upload network error');
        xhr.send(formData);
    });
}
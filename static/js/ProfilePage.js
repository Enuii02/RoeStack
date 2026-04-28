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

const endpoint = `https://owres.org/roestack/user/1`; // TEST URL

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const progressBar = document.getElementById('progressBar');
const results = document.getElementById('uploadResults');

uploadBtn.addEventListener('click', uploadFiles);

function uploadFiles() {
    const files = fileInput.files;
    if (!files.length) return;

    const formData = new FormData();

    for (const file of files) {
        formData.append('images[]', file);
    }

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
        console.log("Status:", xhr.status);
        console.log("Response:", xhr.responseText);

        try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
                renderResults(response.data.saved);
            } else {
                alert(response.message || 'Upload failed');
            }
        } catch (e) {
            console.error('Invalid JSON response or server error');
        }
    };

    xhr.onerror = () => {
        alert('Upload error occurred');
    };

    xhr.send(formData);

}

function renderResults(files) {
    results.innerHTML = '';

    for (const file of files) {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${file.original_name}</strong><br>
            <code>${file.path}</code>
        `;
        results.appendChild(li);
    }
}

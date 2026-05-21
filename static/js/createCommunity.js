document.addEventListener('DOMContentLoaded', () => {
    const communityForm = document.getElementById('communityForm');
    
    if (!communityForm) return;

    communityForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const editId = communityForm.getAttribute('data-edit-id');
        const isEditing = editId !== "";

        // Collect data
        const payload = {
            name: communityForm.querySelector('input[name="name"]').value.trim(),
            description: communityForm.querySelector('textarea[name="description"]').value.trim()
        };

        // Disable button to prevent double-submission
        submitBtn.disabled = true;
        submitBtn.innerText = "Processing...";

        try {
            const url = isEditing ? `/edit-community/${editId}` : "/community";
            
            const response = await fetch(url, {
                method: "POST", // Using POST for both as per your router setup
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && (result.communityId || result.success)) {
                // Redirect to the new or updated community page
                console.log(result)
                const id = result.communityId.id || editId;
                window.location.href = `/community/${id}`;
            } else if (result.demo) {
                showDemoBanner(result.error);
                submitBtn.disabled = false;
                submitBtn.innerText = isEditing ? "Update Community" : "Launch Community";
            } else {
                alert("Error: " + (result.error || "Failed to save community"));
                submitBtn.disabled = false;
                submitBtn.innerText = isEditing ? "Update Community" : "Launch Community";
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("A network error occurred.");
            submitBtn.disabled = false;
        }
    });
});
document.addEventListener("click", async (e) => {
    // ================= DELETE POST =================
    const deleteBtn = e.target.closest(".delete-post");
    
    if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();

        // Get ID from a data attribute: data-post-id
        const postId = deleteBtn.dataset.postId;

        // Alert for confirmation
        if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;

        try {
            // Send the DELETE request
            const res = await fetch(`/post/${postId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.demo) {
                    showDemoBanner(errorData.error);
                } else {
                    alert("Delete failed: " + (errorData.error || "Unknown error"));
                }
                return;
            }

            // Success handling
            // Since the post is gone, we redirect to the home page
            window.location.href = "/";

        } catch (err) {
            console.error("Delete request failed:", err);
            alert("An error occurred while trying to delete the post.");
        }
    }
});
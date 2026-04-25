


// Get all .follow-btn in page
document.querySelectorAll('.follow-btn').forEach(followButton => {

    // Get community id from dataset in followButton (defined in single-community.pug)
    const communityId = followButton.dataset.id;
    const userId = followButton.dataset.userId;
    const followerCount = document.querySelector('.follower-count');

    var isLoading = false;
    
    async function followUnfollow() {
        // If the script is already loading, skip this step
        if (isLoading) return;

        // Declare that loading has started
        isLoading = true;

        // Disable buttons
        followButton.disabled = true;

        try {
            const res = await fetch('/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, communityId })
            });

            const data = await res.json();
            followerCount.textContent = data.followingAmount;

        } catch (err) {
            console.error(err);
        } finally {
            isLoading = false;
            followButton.disabled = false;
        }
    }

    followButton.addEventListener('click', async () => {
        const isFollowing = !followButton.classList.contains('inverse');

        if (isFollowing) {
            followButton.classList.add('inverse');
            followButton.textContent = "Unfollow"
            await followUnfollow();
        } else {
            followButton.classList.remove('inverse');
            followButton.textContent = "Follow"
            await followUnfollow();
        }
    });

});
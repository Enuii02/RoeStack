
// Get all .interactions in page
document.querySelectorAll('.interactions').forEach(container => {

  // Fetch upvote button
  const upvoteButton = container.querySelector('.upvote');
  // Fetch downvote button
  const downvoteButton = container.querySelector('.downvote');
  // Fetch vote count text
  const voteCount = container.querySelector('.vote-count span');
  // Get post id from dataset in upvoteButton (defined in post.pug)
  const postId = upvoteButton.dataset.id;
  const typeId = upvoteButton.dataset.typeId;

  // Check if this current js script is loading data
  let isLoading = false;

  async function vote(positive) {
    // If the script is already loading, skip this step
    if (isLoading) return;

    // Declare that loading has started
    isLoading = true;

    // Disable buttons
    upvoteButton.disabled = true;
    downvoteButton.disabled = true;

    console.log(postId, positive)
    try {
      const res = await fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, typeId, positive })
      });

      const data = await res.json();

      voteCount.innerText = data.votes;

    } catch (err) {
      console.error(err);
    }

    // Re-enable buttons
    isLoading = false;
    upvoteButton.disabled = false;
    downvoteButton.disabled = false;
  }

  upvoteButton.addEventListener('click', async () => {
    const isActive = upvoteButton.classList.contains('active');

    if (isActive) {
      upvoteButton.classList.remove('active');
      await vote(null);
    } else {
      upvoteButton.classList.add('active');
      downvoteButton.classList.remove('active');
      await vote(1);
    }
  });

  downvoteButton.addEventListener('click', async () => {
    const isActive = downvoteButton.classList.contains('active');

    if (isActive) {
      downvoteButton.classList.remove('active');
      await vote(null);
    } else {
      downvoteButton.classList.add('active');
      upvoteButton.classList.remove('active');
      await vote(0);
    }
  });

});
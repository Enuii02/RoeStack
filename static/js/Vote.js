document.querySelectorAll('.interactions').forEach(container => {

  const upBtn = container.querySelector('.upvote');
  const downBtn = container.querySelector('.downvote');
  const voteCount = container.querySelector('.vote-count span');

  const postId = upBtn.dataset.id;

  let isLoading = false;

  async function vote(positive) {
    if (isLoading) return;

    isLoading = true;

    // Disable buttons
    upBtn.disabled = true;
    downBtn.disabled = true;

    try {
      const res = await fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, positive })
      });

      const data = await res.json();

      voteCount.innerText = data.votes;

    } catch (err) {
      console.error(err);
    }

    // Re-enable buttons
    isLoading = false;
    upBtn.disabled = false;
    downBtn.disabled = false;
  }

  upBtn.addEventListener('click', async () => {
    const isActive = upBtn.classList.contains('active');

    if (isActive) {
      upBtn.classList.remove('active');
      await vote(null);
    } else {
      upBtn.classList.add('active');
      downBtn.classList.remove('active');
      await vote(1);
    }
  });

  downBtn.addEventListener('click', async () => {
    const isActive = downBtn.classList.contains('active');

    if (isActive) {
      downBtn.classList.remove('active');
      await vote(null);
    } else {
      downBtn.classList.add('active');
      upBtn.classList.remove('active');
      await vote(0);
    }
  });

});
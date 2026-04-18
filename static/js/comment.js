const input = document.querySelector(".main-answer");
const form = document.querySelector(".form-answer");
const button = document.querySelector(".answer-btn");

input.addEventListener("focus", () => {
  form.classList.add("active");
});

input.addEventListener("blur", () => {
  if (!input.value.trim()) {
    form.classList.remove("active");
  }
});

input.addEventListener("input", () => {
  if (input.value.trim().length > 0) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
});

button.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  const postId = window.location.pathname.split("/").pop();

  const res = await fetch("/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: text,
      postId: postId,
      parentId: null,
    }),
  });

  const newComment = await res.json();

  addCommentToDOM(newComment);

  input.value = "";
  button.disabled = true;
});

function createCommentHTML(comment) {
  const isDeleted = comment.is_deleted;
  return `
    <div class="comment-thread">
      <div class="comment-body">
        
        <div class="comment-left">
          <img class="avatar" src="/images/none-avatar.svg" alt="User Avatar">
        </div>

        <div class="comment-right">

          <div class="comment-info">
            <a class="name" href="/user/${comment.user.id}">
              ${comment.user.name}
            </a>
            <span class="dot">•</span>
            <span class="time">just now</span>

            <button class="icon-btn" onclick="toggleMenu(this)">
              <img class="options" src="/images/icons/three-vertical-dots.svg">
            </button>

            <ul class="dropdown-menu">
              <li>
                <a href="#" style="color:red;">Report comment</a>
              </li>
            </ul>
          </div>

          <div class="role">${comment.user.role}</div>

          <p class="comment-text">
            ${isDeleted ? comment.content : comment.content}
          </p>

          <div class="comment-footer">
            <div class="interactions">
              <button class="upvote">
                <img class="vote-icon" src="/images/icons/up-vote.svg">
              </button>

              <span class="vote-count">${comment.votes || 0}</span>

              <button class="downvote">
                <img class="vote-icon" src="/images/icons/down-vote.svg">
              </button>
            </div>

            <a class="answers" href="#" data-comment-id="${comment.id}">
              <img class="answer-icon" src="/images/icons/chat-left.svg">
              <p class="reply">Reply</p>
            </a>
          </div>

        </div>
      </div>
    </div>
  `;
}

function addCommentToDOM(comment) {
  const container = document.querySelector(".answers-section");
  container.insertAdjacentHTML("afterbegin", createCommentHTML(comment));
}
document.addEventListener("click", function (e) {
  const replyBtn = e.target.closest("[data-comment-id]");
  if (replyBtn) {
    e.preventDefault();

    const commentId = replyBtn.dataset.commentId;
    const commentThread = replyBtn.closest(".comment-thread");

    // Delete only empty reply-forms on the page
    document.querySelectorAll(".reply-form").forEach((form) => {
      const input = form.querySelector(".reply-input");
      if (!input.value.trim()) {
        form.remove();
      }
    });

    const form = document.createElement("div");
    form.classList.add("reply-form");

    form.innerHTML = `
      <input type="text" class="reply-input" placeholder="Write a reply...">
      <button class="reply-btn" disabled>Reply</button>
    `;

    commentThread.appendChild(form);

    const input = form.querySelector(".reply-input");
    const button = form.querySelector(".reply-btn");

    // Focus on input
    input.focus();

    input.addEventListener("input", () => {
      button.disabled = !input.value.trim();
    });

    // submit
    button.addEventListener("click", async () => {
      const content = input.value.trim();
      if (!content) return;

      const postId = window.location.pathname.split("/").pop();
      const res = await fetch("/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          postId: postId,
          parentId: commentId,
        }),
      });

      const reply = await res.json();

      addReplyToDOM(commentThread, reply);

      form.remove();
    });
  } else {
    // Close reply-form outside if it is empty
    const replyForm = document.querySelector(".reply-form");
    if (
      replyForm &&
      !replyForm.contains(e.target) &&
      !e.target.classList.contains("reply")
    ) {
      const input = replyForm.querySelector(".reply-input");
      if (!input.value.trim()) {
        replyForm.remove();
      }
    }
  }
});
function addReplyToDOM(commentThread, reply) {
  let repliesContainer = commentThread.querySelector(".replies");

  if (!repliesContainer) {
    repliesContainer = document.createElement("div");
    repliesContainer.classList.add("replies");
    commentThread.appendChild(repliesContainer);
  }

  commentThread.classList.add("has-replies");

  repliesContainer.insertAdjacentHTML("beforeend", createCommentHTML(reply));
}
document.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest(".delete-comment");

  if (!deleteBtn) return;

  e.preventDefault();

  const commentId = deleteBtn.dataset.commentId;

  if (!confirm("Are you sure you want to delete this comment?")) return;

  const res = await fetch(`/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    console.error("Delete failed");
    return;
  }

  const data = await res.json();

  const commentThread = deleteBtn.closest(".comment-thread");
  const textEl = commentThread.querySelector(".comment-text");

  textEl.textContent = data.text;

  // remove footer (votes and reply) on deleted comments
  const footer = commentThread.querySelector(".comment-footer");
  if (footer) footer.remove();
});

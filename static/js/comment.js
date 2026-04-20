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
  const isDeleted = comment.isDeleted;

  const canDelete =
    comment.user.id === window.CURRENT_USER_ID || window.IS_MOD === 1;

  return `
    <div class="comment-thread ${isDeleted ? "deleted" : ""}">
      <div class="comment-body">
        
        <div class="comment-left">
          <img class="avatar" src="/images/none-avatar.svg">
        </div>

        <div class="comment-right">

          <div class="comment-info">
            <a class="name" href="/user/${comment.user.id}">
              ${comment.user.name}
            </a>

            <span class="dot">•</span>
            <span class="time">${comment.elapsedTime}</span>

            ${
              !isDeleted
                ? `
            <button class="icon-btn" onclick="toggleMenu(this)">
              <img class="options" src="/images/icons/three-vertical-dots.svg">
            </button>

            <ul class="dropdown-menu">
              ${
                canDelete
                  ? `
                <li>
                  <a href="#" class="delete-comment" data-comment-id="${comment.id}" style="color:red;">
                    Delete comment
                  </a>
                </li>
                `
                  : `
                <li>
                  <a href="#" style="color:red;">Report comment</a>
                </li>
                `
              }
            </ul>
            `
                : ""
            }
          </div>

          <div class="role">${comment.user.role}</div>

          <p class="comment-text">
            ${isDeleted ? "Answer has been deleted..." : comment.content}
          </p>

          ${
            !isDeleted
              ? `
          <div class="comment-footer">
            <div class="interactions">
              <button class="upvote">
                <img class="vote-icon" src="/images/icons/up-vote.svg">
              </button>
              <span class="vote-count">${comment.amountVotes}</span>
              <button class="downvote">
                <img class="vote-icon" src="/images/icons/down-vote.svg">
              </button>
            </div>
            <a class="answers" href="#" data-comment-id="${comment.id}">
              <img class="answer-icon" src="/images/icons/chat-left.svg">
              <p class="reply">Reply</p>
            </a>
          </div>
          `
              : ""
          }

        </div>
      </div>
    </div>
  `;
}

function addCommentToDOM(comment) {
  const container = document.querySelector(".answers-section");
  container.insertAdjacentHTML("afterbegin", createCommentHTML(comment));
}

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
function renderComments(comments, container) {
  comments.forEach((comment) => {
    const html = createCommentHTML(comment);
    container.insertAdjacentHTML("beforeend", html);

    const added = container.lastElementChild;

    if (comment.replies && comment.replies.length > 0) {
      let repliesContainer = added.querySelector(".replies");

      if (!repliesContainer) {
        repliesContainer = document.createElement("div");
        repliesContainer.classList.add("replies");
        added.appendChild(repliesContainer);
      }

      renderComments(comment.replies, repliesContainer);
    }
  });
}
document.addEventListener("click", async (e) => {
  // ================= DELETE =================
  const deleteBtn = e.target.closest(".delete-comment");
  if (deleteBtn) {
    e.preventDefault();
    e.stopPropagation();

    const commentId = deleteBtn.dataset.commentId;

    if (!confirm("Delete this comment?")) return;

    const res = await fetch(`/comments/${commentId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error("Delete failed");
      return;
    }

    const data = await res.json();

    const commentThread = deleteBtn.closest(".comment-thread");

    commentThread.classList.add("deleted");

    const textEl = commentThread.querySelector(".comment-text");
    textEl.textContent = data.text;

    const footer = commentThread.querySelector(".comment-footer");
    if (footer) footer.remove();

    const menu = deleteBtn.closest(".dropdown-menu");
    if (menu) menu.style.display = "none";

    return;
  }

  // ================= REPLY =================
  const replyBtn = e.target.closest(".answers");
  if (replyBtn) {
    e.preventDefault();

    const commentId = replyBtn.dataset.commentId;
    const commentThread = replyBtn.closest(".comment-thread");

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

    input.focus();

    input.addEventListener("input", () => {
      button.disabled = !input.value.trim();
    });

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
          postId,
          parentId: commentId,
        }),
      });

      const reply = await res.json();

      addReplyToDOM(commentThread, reply);
      form.remove();
    });

    return;
  }

  // ================= CLOSE EMPTY FORM =================
  const replyForm = document.querySelector(".reply-form");
  if (replyForm && !replyForm.contains(e.target)) {
    const input = replyForm.querySelector(".reply-input");
    if (!input.value.trim()) {
      replyForm.remove();
    }
  }
  // ================= SORT MENU =================
  const sortOption = e.target.closest("[data-sort]");
  if (!sortOption) return;

  e.preventDefault();

  const sort = sortOption.dataset.sort;
  const postId = window.location.pathname.split("/").pop();

  const sortLabel = document.querySelector(".sort-btn p");
  sortLabel.textContent = sortOption.textContent;

  const res = await fetch(`/comments/${postId}?sort=${sort}`);
  const comments = await res.json();

  const container = document.querySelector(".answers-section");
  container.innerHTML = "";

  renderComments(comments, container);
});

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

  const res = await fetch("/api/comments", {
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

function addCommentToDOM(comment) {
  const container = document.querySelector(".answers-section");

  const html = `
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

          <p class="comment-text">${comment.content}</p>

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

            <a class="reply" href="#">Reply</a>
          </div>

        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("afterbegin", html);
}

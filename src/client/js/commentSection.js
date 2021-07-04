const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const comments = document.getElementById("comments");
const deleteBtn = comments.querySelectorAll("i");

const handleDelete = async ( event ) => {
  const comment = event.target.parentNode.parentNode;
  const uid = comment.firstChild.lastChild.innerText;
  const vid = videoContainer.dataset.id;
  const cid = comment.dataset.id;
  const { status } = await fetch(`/api/users/${uid}/videos/${vid}/comments/${cid}`, {
    method: "DELETE"
  });
  if( status === 200 )
    comments.removeChild(comment);
}

const addComment = (text, id, userId, user_id) => {
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const idSpan = document.createElement("span");
  idSpan.className = "video__comment__user";
  const a = document.createElement("a");
  a.href = `/users/${user_id}`;
  a.innerText = userId;
  const textSpan = document.createElement("span");
  textSpan.className = "video__comment__text";
  textSpan.innerText = ` ${text}`;
  const btnSpan = document.createElement("span");
  btnSpan.className = "video__comment__btn";
  const i = document.createElement("i");
  i.className = "fas fa-backspace";
  
  idSpan.appendChild(a);
  newComment.appendChild(idSpan);
  newComment.appendChild(textSpan);
  btnSpan.appendChild(i);
  newComment.appendChild(btnSpan);
  comments.prepend(newComment);

  i.addEventListener("click", handleDelete);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const { id } = videoContainer.dataset;

  if (text === "")
    return;

  const response = await fetch(`/api/videos/${id}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text })
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId, userId, user_id } = await response.json();
    addComment(text, newCommentId, userId, user_id);
    handleDeleteComment();
  }
};

const handleDeleteComment = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "DELETE",
  });
};


if (form) {
  form.addEventListener("submit", handleSubmit);
  deleteBtn.forEach( btn => btn.addEventListener("click", handleDelete) );
}
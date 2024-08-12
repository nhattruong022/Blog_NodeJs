// const { response } = require("express");

document.addEventListener('DOMContentLoaded', function () {
  const allButtons = document.querySelectorAll('.searchBtn');
  const searchBar = document.querySelector('.searchBar');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');

  allButtons.forEach(button => {
    button.addEventListener('click', function () {
      searchBar.style.visibility = 'visible';
      searchBar.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
      searchInput.focus();
    });
  });

  searchClose.addEventListener('click', function () {
    searchBar.style.visibility = 'hidden';
    searchBar.classList.remove('open');
    allButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
  });

  searchClose.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      searchBar.style.visibility = 'hidden';
      searchBar.classList.remove('open');
      allButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    }
  });
});




//Thả tym bài viết
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.post').forEach(post => {
    const postId = post.getAttribute('data-post-id');
    const likeHeart = post.querySelector('.like-heart');
    const likeCount = post.querySelector('.like-count');

    likeHeart.addEventListener('click', async () => {
      try {
        const response = await fetch(`/post/${postId}/like`, { method: 'PATCH' });
        const data = await response.json();

        if (response.ok) {
          likeHeart.classList.remove('fa-regular', 'fa-heart');
          likeHeart.classList.add('fa-solid', 'fa-heart');
          likeCount.textContent = data.likes; // Update the like count from the response
        } else {
          console.error('Failed to update likes:', data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });
});




//Cập nhập số lượng cmt
document.querySelector('#commentForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const postId = this.dataset.postId;


  if (content === '') {
    alert('Content is required');
    return;
  }

  const response = await fetch(`/detail/${postId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });

  if (response.ok) {
    // Cập nhật số lượng bình luận
    const commentCountElement = document.querySelector('#cmt-count');
    const currentCount = parseInt(commentCountElement.textContent, 10);
    commentCountElement.textContent = currentCount + 1;

    // Xử lý các hành động khác như làm sạch form hoặc thêm bình luận mới vào danh sách
    document.querySelector('#commentContent').value = ''; // Xóa nội dung bình luận
  } else {
    console.error('Failed to add comment');
  }
});



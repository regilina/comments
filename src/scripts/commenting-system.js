import { UserComment } from "./user-comment.js";
import { CustomSelect } from "./custom-select.js";
export class CommentsApp {
    comments;
    favorites;
    form;
    input;
    commentList;
    commentsAmount;
    showFavoritesOnly = false;
    charCounter;
    formError;
    submitButton;
    sortBtnIcon;
    sortIcon;
    ratedComments;
    sortIconStatus;
    constructor() {
        this.comments = this.loadComments();
        this.favorites = this.loadFavorites();
        this.form = document.querySelector(".form");
        this.input = document.querySelector(".form__input");
        this.commentList = document.querySelector(".comment-list");
        this.commentsAmount = document.querySelector(".comments-panel__comments-amount");
        this.charCounter = document.querySelector(".form__char-counter");
        this.formError = document.querySelector(".form__error");
        this.submitButton = this.form.querySelector("button[type='submit']");
        this.sortBtnIcon = document.querySelector(".comments-panel__sort-btn-icon");
        this.sortIcon = document.querySelector(".comments-panel__sort-icon");
        this.ratedComments = new Set(JSON.parse(localStorage.getItem("ratedComments") || "[]"));
        this.sortIconStatus = "down";
        this.initialize();
    }
    initialize() {
        this.form.addEventListener("submit", this.handleFormSubmit.bind(this));
        this.comments.forEach((comment) => this.renderComment(comment));
        this.input.addEventListener("input", this.toggleSubmitButton.bind(this));
        const favoritesButton = document.querySelector(".comments-panel__favorites-btn");
        favoritesButton.addEventListener("click", () => this.toggleFavoritesView());
        this.input.addEventListener("input", () => this.updateCounter());
        this.input.addEventListener("keyup", function () {
            if (this.scrollTop > 0) {
                this.style.height = this.scrollHeight + "px";
            }
        });
        this.sortBtnIcon.addEventListener("click", () => this.changeOrder());
        this.sortIcon.style.transform = "rotate(0deg)";
        if (this.comments.length === 0) {
            this.comments = this.generateMockComments();
            this.saveComments();
        }
        this.sortComments();
        // После сортировки рендерим комментарии
        this.renderComments();
        this.updateCommentsAmount();
    }
    generateMockComments() {
        const mockComments = [
            new UserComment("Donec vel dolor quis orci convallis semper. Nam sollicitudin rutrum malesuada. Pellentesque hendrerit ultricies odio, eu ultricies tellus.", "Dírio Silva"),
            new UserComment("Praesent laoreet elit felis, id accumsan ex sodales a. Pellentesque at efficitur libero.", "Bernard Walters"),
            new UserComment("Fusce placerat, metus eu interdum viverra, dui elit pulvinar tortor, sed ultricies libero nulla quis nulla.", "آرتين یاسمی"),
            new UserComment("Quisque felis orci, semper suscipit tincidunt eu, aliquet sit amet risus.", "Thomas Perrin"),
        ];
        mockComments[0].rating = 6;
        mockComments[2].rating = 2;
        mockComments[3].rating = -4;
        mockComments[0].replies = [
            new UserComment("I totally agree with your point about sollicitudin rutrum malesuada!", "Alice Brown"),
            new UserComment("Interesting perspective, but I have some doubts about ultricies odio.", "Carlos Gutierrez"),
        ];
        mockComments[2].replies = [
            new UserComment("Could you elaborate on interdum viverra? It's fascinating!", "Emily Johnson"),
        ];
        mockComments[3].replies = [
            new UserComment("Semper suscipit tincidunt is such an underrated concept!", "Olivier Martin"),
            new UserComment("I think aliquet sit amet risus deserves more attention in the context of modern UX design.", "Sophia Lee"),
        ];
        return mockComments;
    }
    sortComments() {
        const selectText = document.querySelector(".custom-select__text")?.textContent;
        if (this.sortIconStatus === "down") {
            if (selectText === "По дате" || selectText === "По актуальности") {
                this.sortCommentsByDate("desc");
            }
            else if (selectText === "По количеству ответов") {
                this.sortCommentsByReplys("desc");
            }
            else if (selectText === "По количеству оценок") {
                this.sortCommentsByRating("desc");
            }
        }
        else {
            if (selectText === "По дате" || selectText === "По актуальности") {
                this.sortCommentsByDate("asc");
            }
            else if (selectText === "По количеству ответов") {
                this.sortCommentsByReplys("asc");
            }
            else if (selectText === "По количеству оценок") {
                this.sortCommentsByRating("asc");
            }
        }
    }
    changeOrder() {
        // Изменяем состояние иконки
        this.sortIcon.style.transform = this.sortIcon.style.transform === "rotate(0deg)" ? "rotate(180deg)" : "rotate(0deg)";
        this.sortIconStatus = this.sortIcon.style.transform === "rotate(0deg)" ? "down" : "up";
        this.sortComments();
        // После сортировки рендерим комментарии
        this.renderComments();
    }
    updateCounter() {
        const maxChars = 1000;
        const charCount = this.input.value.length;
        this.charCounter.textContent = `${charCount}/${maxChars}`;
        const errorMobile = document.querySelector(".form__error_mobile");
        if (charCount > maxChars) {
            if (window.innerWidth >= 320 && window.innerWidth < 1440) {
                errorMobile.style.display = "block";
            }
            else {
                this.formError.style.opacity = "1";
            }
            this.charCounter.style.color = "rgb(255, 0, 0)";
            this.charCounter.style.opacity = "1";
        }
        else {
            if (window.innerWidth >= 320 && window.innerWidth < 1440) {
                errorMobile.style.display = "none";
            }
            else {
                this.formError.style.opacity = "0";
            }
            this.charCounter.style.color = "rgba(0, 0, 0, 0.4)";
        }
    }
    toggleFavoritesView() {
        this.showFavoritesOnly = !this.showFavoritesOnly;
        this.renderComments(); // Перерисовываем комментарии
    }
    toggleFavorite(commentId) {
        if (this.favorites.has(commentId)) {
            this.favorites.delete(commentId);
        }
        else {
            this.favorites.add(commentId);
        }
        this.saveFavorites();
        this.updateFavoriteButton(commentId);
    }
    renderComments() {
        this.commentList.innerHTML = ""; // Очистка списка перед рендерингом
        // Фильтрация комментариев и ответов
        const commentsToRender = this.showFavoritesOnly ? this.filterFavorites(this.comments) : this.comments;
        commentsToRender.forEach((comment) => this.renderComment(comment));
    }
    // Метод для фильтрации избранных комментариев и их ответов
    filterFavorites(comments) {
        return comments
            .filter((comment) => this.isFavoriteComment(comment))
            .map((comment) => ({
            ...comment,
            replies: comment.replies ? comment.replies.filter((reply) => this.favorites.has(reply.id)) : [],
        }));
    }
    // Проверка, является ли комментарий или его ответы избранными
    isFavoriteComment(comment) {
        return this.favorites.has(comment.id) || (comment.replies ?? []).some((reply) => this.favorites.has(reply.id));
    }
    updateFavoriteButton(commentId) {
        const commentElement = document.getElementById(commentId);
        if (!commentElement)
            return;
        const favoriteButton = commentElement.querySelector(".panel__btn_favorite");
        const favoriteIcon = favoriteButton.querySelector(".favorite-icon");
        const favoriteIconActive = favoriteButton.querySelector(".favorite-icon-active");
        const favoriteButtonText = favoriteButton.querySelector(".favorite-text");
        // Если комментарий в избранном
        if (this.favorites.has(commentId)) {
            // Скрыть неактивную иконку и показать активную
            favoriteIcon.style.display = "none";
            favoriteIconActive.style.display = "block";
            // Изменить текст кнопки
            favoriteButtonText.textContent = "В избранном";
        }
        else {
            // Скрыть активную иконку и показать неактивную
            favoriteIcon.style.display = "block";
            favoriteIconActive.style.display = "none";
            // Изменить текст кнопки
            favoriteButtonText.textContent = "В избранноe";
        }
    }
    loadFavorites() {
        const favoritesData = localStorage.getItem("favorites");
        return favoritesData ? new Set(JSON.parse(favoritesData)) : new Set();
    }
    saveFavorites() {
        localStorage.setItem("favorites", JSON.stringify(Array.from(this.favorites)));
    }
    toggleSubmitButton() {
        if (this.input.value.trim().length > 0 && this.input.value.length <= 1000) {
            this.submitButton.style.background = "rgb(171, 216, 115)";
            this.submitButton.style.opacity = "1";
            this.submitButton.style.border = "none";
        }
        else {
            this.submitButton.style.background = "rgb(162, 162, 162)";
            this.submitButton.style.opacity = "0.4";
        }
    }
    updateCommentsAmount() {
        if (this.commentsAmount) {
            this.commentsAmount.textContent = "(" + this.comments.length + ")";
        }
    }
    async handleFormSubmit(event) {
        event.preventDefault();
        const text = this.input.value.trim();
        if (text === "" || text.length > 1000)
            return;
        const comment = new UserComment(text);
        await this.waitForAuthor(comment);
        this.comments.push(comment);
        this.renderComment(comment);
        this.saveComments();
        this.input.value = "";
        this.updateCommentsAmount();
        this.toggleSubmitButton();
        const newCommentElement = document.getElementById(comment.id);
        if (newCommentElement) {
            newCommentElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        this.input.style.height = "61px";
        this.updateCounter();
    }
    async waitForAuthor(comment) {
        // Ждём, пока имя автора будет обновлено
        while (comment.author === "unknown") {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Проверяем каждые 100 мс
        }
    }
    handleReplyClick(event, btn) {
        event.preventDefault();
        const commentElement = btn.closest(".comment");
        if (commentElement) {
            const replyToId = commentElement.id;
            this.addReplyForm(replyToId);
        }
        const replyInput = document.querySelector(".reply-form__input");
        replyInput.focus();
        replyInput.scrollIntoView({ behavior: "smooth", block: "center" });
        replyInput.addEventListener("input", this.toggleSubmitButton.bind(this));
    }
    addReplyForm(replyToId) {
        const comment = document.getElementById(replyToId);
        if (!comment)
            return;
        const replyForm = document.createElement("form");
        replyForm.className = "reply-form";
        replyForm.innerHTML = `<input class="reply-form__input" type="text" placeholder="Введите ответ...">
                <div class="reply-form__btns">
                <button class="reply-form__btn-cancel">Отмена</button>
                <button class="reply-form__btn-reply" type="submit">Ответить</button>
                </div>`;
        comment.parentNode?.insertBefore(replyForm, comment.nextSibling);
        replyForm.addEventListener("submit", (event) => this.handleReplyFormSubmit(event, replyToId));
        replyForm.scrollIntoView({ behavior: "smooth", block: "start" });
        const input = replyForm.querySelector(".reply-form__input");
        input.focus();
    }
    handleReplyFormSubmit(event, replyToId) {
        event.preventDefault();
        const form = event.currentTarget;
        const input = form.querySelector(".reply-form__input");
        const replyText = input.value.trim();
        form.remove();
        if (replyText === "" || replyText.length > 1000)
            return;
        this.addReply(replyToId, replyText);
    }
    async addReply(replyToId, text) {
        const comment = this.findCommentById(replyToId, this.comments);
        if (comment) {
            const reply = new UserComment(text);
            await this.waitForAuthor(reply);
            comment.replies?.push(reply);
            this.renderReply(replyToId, reply, comment.author);
            this.saveComments();
            const newReplyElement = document.getElementById(reply.id);
            if (newReplyElement) {
                newReplyElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }
    findCommentById(id, comments) {
        for (const comment of comments) {
            if (comment.id === id)
                return comment;
            if (comment.replies && comment.replies.length > 0) {
                const found = this.findCommentById(id, comment.replies);
                if (found)
                    return found;
            }
        }
        return undefined;
    }
    renderComment(comment) {
        const avatarUrl = `https://picsum.photos/seed/${comment.id}/`;
        const listItem = document.createElement("li");
        listItem.className = "comment-list__item";
        listItem.innerHTML = `<div class="comment comments__comment" id="${comment.id}">
         <img class="avatar comment__avatar" src="${avatarUrl}61" alt="Аватарка юзера" />
         <div>
           <div class="comment__info">
             <img class="avatar comment__avatar_mobile" src="${avatarUrl}50" alt="Аватарка юзера" />
             <span class="user comment__user">${comment.author}</span>
             <span class="date">${Utils.formatDate(comment.date)}</span>
           </div>
           <p class="text comment__text">${comment.text}</p>
           <div class="panel">
             <button class="panel__btn panel__btn_reply">
               <img src="./img/reply.svg" />
               Ответить
             </button>
             <button class="panel__btn panel__btn_favorite">
               <img class="favorite-icon" src="./img/favorite.svg" />
               <img class="favorite-icon-active" src="./img/favorite-active.svg" />
               <span class="favorite-text">В избранное</span>
               
             </button>
             <div class="panel__rating">
               <button class="panel__rating-btn_minus">
                 <img src="./img/minus.svg" />
               </button>
               <span class="rating">${comment.rating}</span>
               <button class="panel__rating-btn_plus">
                 <img src="./img/plus.svg" />
               </button>
             </div>
           </div>
         </div>
       </div>
       <ul class="comment-reply-list"></ul>`;
        const replyButton = listItem.querySelector(".panel__btn_reply");
        replyButton.addEventListener("click", (event) => this.handleReplyClick(event, replyButton));
        const minusButton = listItem.querySelector(".panel__rating-btn_minus");
        const plusButton = listItem.querySelector(".panel__rating-btn_plus");
        minusButton.addEventListener("click", (event) => this.handleRatingChange(event, comment.id, false));
        plusButton.addEventListener("click", (event) => this.handleRatingChange(event, comment.id, true));
        this.commentList.appendChild(listItem);
        comment.replies?.forEach((reply) => this.renderReply(comment.id, reply, comment.author));
        const favoriteButton = listItem.querySelector(".panel__btn_favorite");
        if (favoriteButton) {
            favoriteButton.addEventListener("click", () => this.toggleFavorite(comment.id));
            this.updateFavoriteButton(comment.id);
        }
        this.updateFavoriteButton(comment.id);
    }
    handleRatingChange(event, commentId, isIncrease) {
        event.preventDefault();
        // Проверяем, не оценивал ли пользователь этот комментарий
        if (this.ratedComments.has(commentId)) {
            return;
        }
        const comment = this.findCommentById(commentId, this.comments);
        if (comment) {
            comment.rating += isIncrease ? 1 : -1; // Изменяем рейтинг
            this.ratedComments.add(commentId); // Добавляем ID в список оцененных
            localStorage.setItem("ratedComments", JSON.stringify([...this.ratedComments]));
            this.saveComments(); // Сохраняем изменения
            this.updateCommentRating(commentId); // Обновляем рейтинг в DOM
        }
    }
    updateCommentRating(commentId) {
        const commentElement = document.getElementById(commentId);
        if (commentElement) {
            const ratingElement = commentElement.querySelector(".rating");
            const comment = this.findCommentById(commentId, this.comments);
            if (ratingElement && comment) {
                ratingElement.textContent = comment.rating.toString();
            }
        }
    }
    renderReply(replyToId, reply, author) {
        const avatarUrl = `https://picsum.photos/seed/${reply.id}/`;
        const commentElement = document.getElementById(replyToId);
        const replyList = commentElement.nextElementSibling;
        const replyListItem = document.createElement("li");
        replyListItem.className = "comment-reply-list__item";
        replyListItem.innerHTML = `<div class="comment comments__comment comment-reply" id="${reply.id}">
         <img class="avatar comment__avatar" src="${avatarUrl}61" alt="Аватарка юзера" />
         <div>
           <div class="comment-reply__info">
             <div class="comment__info">
               <img class="avatar comment__avatar_mobile" src="${avatarUrl}50" alt="Аватарка юзера" />
               <span class="user comment__user comment-reply__user">${reply.author}</span>
               <div class="comment-reply__reply-to">
                 <img src="./img/reply.svg" />
                 Ответ на: ${author}
               </div>
               <span class="date">${Utils.formatDate(reply.date)}</span>
             </div>
           </div>
           <p class="text comment__text">${reply.text}</p>
           <div class="panel">
             <button class="panel__btn panel__btn_favorite">
               <img class="favorite-icon" src="./img/favorite.svg" />
               <img class="favorite-icon-active" src="./img/favorite-active.svg" />
               <span class="favorite-text">В избранное</span>
             </button>
             <div class="panel__rating">
              <button class="panel__rating-btn_minus">
                <img src="./img/minus.svg" />
              </button>
              <span class="rating">${reply.rating}</span>
              <button class="panel__rating-btn_plus">
                <img src="./img/plus.svg" />
              </button>
            </div>
           </div>
         </div>
       </div>`;
        const minusButton = replyListItem.querySelector(".panel__rating-btn_minus");
        const plusButton = replyListItem.querySelector(".panel__rating-btn_plus");
        minusButton.addEventListener("click", (event) => this.handleRatingChange(event, reply.id, false));
        plusButton.addEventListener("click", (event) => this.handleRatingChange(event, reply.id, true));
        replyList.appendChild(replyListItem);
        const favoriteButton = replyListItem.querySelector(".panel__btn_favorite");
        if (favoriteButton) {
            favoriteButton.addEventListener("click", () => this.toggleFavorite(reply.id));
            this.updateFavoriteButton(reply.id); // Обновляем состояние для ответа
        }
    }
    saveComments() {
        localStorage.setItem("comments", JSON.stringify(this.comments));
    }
    loadComments() {
        const commentsData = localStorage.getItem("comments");
        if (commentsData) {
            const comments = JSON.parse(commentsData);
            // Преобразуем строки в объекты Date для каждого комментария
            comments.forEach((comment) => {
                comment.date = new Date(comment.date); // Преобразуем строку в объект Date
                if (comment.replies) {
                    comment.replies.forEach((reply) => {
                        reply.date = new Date(reply.date); // Преобразуем строку в объект Date для каждого ответа
                    });
                }
            });
            return comments;
        }
        return [];
    }
    sortCommentsByDate(order = "asc") {
        this.comments.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return order === "asc" ? dateA - dateB : dateB - dateA;
        });
    }
    sortCommentsByReplys(order = "asc") {
        this.comments.sort((a, b) => {
            const replysA = a.replies?.length;
            const replysB = b.replies?.length;
            return order === "asc" ? replysA - replysB : replysB - replysA;
        });
    }
    sortCommentsByRating(order = "asc") {
        this.comments.sort((a, b) => {
            const ratingA = a.rating;
            const ratungB = b.rating;
            return order === "asc" ? ratingA - ratungB : ratungB - ratingA;
        });
    }
}
class Utils {
    static formatDate(date) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}.${month} ${hours}:${minutes}`;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const commentsApp = new CommentsApp();
    new CustomSelect(".custom-select", ".custom-select__dropdown", commentsApp);
});

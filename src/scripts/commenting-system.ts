import { IComment } from "./i-comment.js"
import { UserComment } from "./user-comment.js"
import { CustomSelect } from "./custom-select.js"

export class CommentsApp {
  private comments: IComment[]
  private favorites: Set<string>
  private form: HTMLFormElement
  private input: HTMLTextAreaElement
  private commentList: HTMLUListElement
  private commentsAmount: HTMLSpanElement
  private showFavoritesOnly: boolean = false
  private charCounter: HTMLSpanElement
  private formError: HTMLSpanElement
  private submitButton: HTMLButtonElement
  private sortBtnIcon: HTMLButtonElement
  private sortIcon: HTMLImageElement
  private ratedComments: Set<string>
  public sortIconStatus: "up" | "down"

  constructor() {
    this.comments = this.loadComments()
    this.favorites = this.loadFavorites()
    this.form = document.querySelector(".form") as HTMLFormElement
    this.input = document.querySelector(".form__input") as HTMLTextAreaElement
    this.commentList = document.querySelector(".comment-list") as HTMLUListElement
    this.commentsAmount = document.querySelector(".comments-panel__comments-amount") as HTMLSpanElement
    this.charCounter = document.querySelector(".form__char-counter") as HTMLSpanElement
    this.formError = document.querySelector(".form__error") as HTMLSpanElement
    this.submitButton = this.form.querySelector("button[type='submit']") as HTMLButtonElement
    this.sortBtnIcon = document.querySelector(".comments-panel__sort-btn-icon") as HTMLButtonElement
    this.sortIcon = document.querySelector(".comments-panel__sort-icon") as HTMLImageElement
    this.ratedComments = new Set<string>(JSON.parse(localStorage.getItem("ratedComments") || "[]"))
    this.sortIconStatus = "down"

    this.initialize()
  }

  private initialize() {
    this.form.addEventListener("submit", this.handleFormSubmit.bind(this))

    this.comments.forEach((comment) => this.renderComment(comment))
    this.input.addEventListener("input", this.toggleSubmitButton.bind(this))

    const favoritesButton = document.querySelector(".comments-panel__favorites-btn") as HTMLButtonElement
    favoritesButton.addEventListener("click", () => this.toggleFavoritesView())
    this.input.addEventListener("input", () => this.updateCounter())
    this.input.addEventListener("keyup", function () {
      if (this.scrollTop > 0) {
        this.style.height = this.scrollHeight + "px"
      }
    })
    this.sortBtnIcon.addEventListener("click", () => this.changeOrder())
    this.sortIcon.style.transform = "rotate(0deg)"

    if (this.comments.length === 0) {
      this.comments = this.generateMockComments()
      this.saveComments()
    }

    this.sortComments()
    // После сортировки рендерим комментарии
    this.renderComments()
    this.updateCommentsAmount()
  }

  private generateMockComments(): IComment[] {
    const mockComments: IComment[] = [
      new UserComment(
        "Donec vel dolor quis orci convallis semper. Nam sollicitudin rutrum malesuada. Pellentesque hendrerit ultricies odio, eu ultricies tellus.",
        "Dírio Silva",
      ),

      new UserComment(
        "Praesent laoreet elit felis, id accumsan ex sodales a. Pellentesque at efficitur libero.",
        "Bernard Walters",
      ),
      new UserComment(
        "Fusce placerat, metus eu interdum viverra, dui elit pulvinar tortor, sed ultricies libero nulla quis nulla.",
        "آرتين یاسمی",
      ),
      new UserComment("Quisque felis orci, semper suscipit tincidunt eu, aliquet sit amet risus.", "Thomas Perrin"),
    ]

    mockComments[0].rating = 6
    mockComments[2].rating = 2
    mockComments[3].rating = -4

    mockComments[0].replies = [
      new UserComment("I totally agree with your point about sollicitudin rutrum malesuada!", "Alice Brown"),
      new UserComment("Interesting perspective, but I have some doubts about ultricies odio.", "Carlos Gutierrez"),
    ]

    mockComments[2].replies = [
      new UserComment("Could you elaborate on interdum viverra? It's fascinating!", "Emily Johnson"),
    ]

    mockComments[3].replies = [
      new UserComment("Semper suscipit tincidunt is such an underrated concept!", "Olivier Martin"),
      new UserComment(
        "I think aliquet sit amet risus deserves more attention in the context of modern UX design.",
        "Sophia Lee",
      ),
    ]

    return mockComments
  }

  public sortComments() {
    const selectText = document.querySelector(".custom-select__text")?.textContent
    if (this.sortIconStatus === "down") {
      if (selectText === "По дате" || selectText === "По актуальности") {
        this.sortCommentsByDate("desc")
      } else if (selectText === "По количеству ответов") {
        this.sortCommentsByReplys("desc")
      } else if (selectText === "По количеству оценок") {
        this.sortCommentsByRating("desc")
      }
    } else {
      if (selectText === "По дате" || selectText === "По актуальности") {
        this.sortCommentsByDate("asc")
      } else if (selectText === "По количеству ответов") {
        this.sortCommentsByReplys("asc")
      } else if (selectText === "По количеству оценок") {
        this.sortCommentsByRating("asc")
      }
    }
  }

  private changeOrder() {
    // Изменяем состояние иконки
    this.sortIcon.style.transform = this.sortIcon.style.transform === "rotate(0deg)" ? "rotate(180deg)" : "rotate(0deg)"
    this.sortIconStatus = this.sortIcon.style.transform === "rotate(0deg)" ? "down" : "up"

    this.sortComments()

    // После сортировки рендерим комментарии
    this.renderComments()
  }

  private updateCounter() {
    const maxChars: number = 1000
    const charCount: number = this.input.value.length
    this.charCounter.textContent = `${charCount}/${maxChars}`
    const errorMobile: HTMLSpanElement = document.querySelector(".form__error_mobile") as HTMLSpanElement
    if (charCount > maxChars) {
      if (window.innerWidth >= 320 && window.innerWidth < 1440) {
        errorMobile.style.display = "block"
      } else {
        this.formError.style.opacity = "1"
      }

      this.charCounter.style.color = "rgb(255, 0, 0)"
      this.charCounter.style.opacity = "1"
    } else {
      if (window.innerWidth >= 320 && window.innerWidth < 1440) {
        errorMobile.style.display = "none"
      } else {
        this.formError.style.opacity = "0"
      }
      this.charCounter.style.color = "rgba(0, 0, 0, 0.4)"
    }
  }

  private toggleFavoritesView() {
    this.showFavoritesOnly = !this.showFavoritesOnly
    this.renderComments() // Перерисовываем комментарии
  }

  private toggleFavorite(commentId: string) {
    if (this.favorites.has(commentId)) {
      this.favorites.delete(commentId)
    } else {
      this.favorites.add(commentId)
    }
    this.saveFavorites()
    this.updateFavoriteButton(commentId)
  }

  public renderComments() {
    this.commentList.innerHTML = "" // Очистка списка перед рендерингом

    // Фильтрация комментариев и ответов
    const commentsToRender = this.showFavoritesOnly ? this.filterFavorites(this.comments) : this.comments

    commentsToRender.forEach((comment) => this.renderComment(comment))
  }

  // Метод для фильтрации избранных комментариев и их ответов
  private filterFavorites(comments: IComment[]): IComment[] {
    return comments
      .filter((comment) => this.isFavoriteComment(comment))
      .map((comment) => ({
        ...comment,
        replies: comment.replies ? comment.replies.filter((reply) => this.favorites.has(reply.id)) : [],
      }))
  }

  // Проверка, является ли комментарий или его ответы избранными
  private isFavoriteComment(comment: IComment): boolean {
    return this.favorites.has(comment.id) || (comment.replies ?? []).some((reply) => this.favorites.has(reply.id))
  }

  private updateFavoriteButton(commentId: string) {
    const commentElement = document.getElementById(commentId) as HTMLElement
    if (!commentElement) return

    const favoriteButton = commentElement.querySelector(".panel__btn_favorite") as HTMLButtonElement
    const favoriteIcon = favoriteButton.querySelector(".favorite-icon") as HTMLImageElement
    const favoriteIconActive = favoriteButton.querySelector(".favorite-icon-active") as HTMLImageElement
    const favoriteButtonText = favoriteButton.querySelector(".favorite-text") as HTMLSpanElement

    // Если комментарий в избранном
    if (this.favorites.has(commentId)) {
      // Скрыть неактивную иконку и показать активную
      favoriteIcon.style.display = "none"
      favoriteIconActive.style.display = "block"

      // Изменить текст кнопки
      favoriteButtonText.textContent = "В избранном"
    } else {
      // Скрыть активную иконку и показать неактивную
      favoriteIcon.style.display = "block"
      favoriteIconActive.style.display = "none"

      // Изменить текст кнопки
      favoriteButtonText.textContent = "В избранноe"
    }
  }

  private loadFavorites(): Set<string> {
    const favoritesData = localStorage.getItem("favorites")
    return favoritesData ? new Set(JSON.parse(favoritesData)) : new Set()
  }

  private saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(Array.from(this.favorites)))
  }

  private toggleSubmitButton() {
    if (this.input.value.trim().length > 0 && this.input.value.length <= 1000) {
      this.submitButton.style.background = "rgb(171, 216, 115)"
      this.submitButton.style.opacity = "1"
      this.submitButton.style.border = "none"
    } else {
      this.submitButton.style.background = "rgb(162, 162, 162)"
      this.submitButton.style.opacity = "0.4"
    }
  }

  private updateCommentsAmount() {
    if (this.commentsAmount) {
      this.commentsAmount.textContent = "(" + this.comments.length + ")"
    }
  }

  private async handleFormSubmit(event: Event) {
    event.preventDefault()
    const text = this.input.value.trim()
    if (text === "" || text.length > 1000) return

    const comment = new UserComment(text)
    await this.waitForAuthor(comment)
    this.comments.push(comment)

    this.renderComment(comment)
    this.saveComments()
    this.input.value = ""
    this.updateCommentsAmount()
    this.toggleSubmitButton()
    const newCommentElement = document.getElementById(comment.id)
    if (newCommentElement) {
      newCommentElement.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    this.input.style.height = "61px"
    this.updateCounter()
  }

  private async waitForAuthor(comment: UserComment) {
    // Ждём, пока имя автора будет обновлено
    while (comment.author === "unknown") {
      await new Promise((resolve) => setTimeout(resolve, 100)) // Проверяем каждые 100 мс
    }
  }

  private handleReplyClick(event: Event, btn: HTMLButtonElement) {
    event.preventDefault()
    const commentElement = btn.closest(".comment")
    if (commentElement) {
      const replyToId = commentElement.id
      this.addReplyForm(replyToId)
    }

    const replyInput = document.querySelector(".reply-form__input") as HTMLInputElement
    replyInput.focus()
    replyInput.scrollIntoView({ behavior: "smooth", block: "center" })
    replyInput.addEventListener("input", this.toggleSubmitButton.bind(this))
  }

  private addReplyForm(replyToId: string) {
    const comment = document.getElementById(replyToId)
    if (!comment) return
    const replyForm = document.createElement("form")
    replyForm.className = "reply-form"
    replyForm.innerHTML = `<input class="reply-form__input" type="text" placeholder="Введите ответ...">
                <div class="reply-form__btns">
                <button class="reply-form__btn-cancel">Отмена</button>
                <button class="reply-form__btn-reply" type="submit">Ответить</button>
                </div>`
    comment.parentNode?.insertBefore(replyForm, comment.nextSibling)
    replyForm.addEventListener("submit", (event: Event) => this.handleReplyFormSubmit(event, replyToId))
    replyForm.scrollIntoView({ behavior: "smooth", block: "start" })
    const input = replyForm.querySelector(".reply-form__input") as HTMLInputElement
    input.focus()
  }

  private handleReplyFormSubmit(event: Event, replyToId: string) {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const input = form.querySelector(".reply-form__input") as HTMLInputElement
    const replyText = input.value.trim()
    form.remove()
    if (replyText === "" || replyText.length > 1000) return

    this.addReply(replyToId, replyText)
  }

  private async addReply(replyToId: string, text: string) {
    const comment = this.findCommentById(replyToId, this.comments)
    if (comment) {
      const reply = new UserComment(text)
      await this.waitForAuthor(reply)
      comment.replies?.push(reply)
      this.renderReply(replyToId, reply, comment.author)
      this.saveComments()
      const newReplyElement = document.getElementById(reply.id)
      if (newReplyElement) {
        newReplyElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  private findCommentById(id: string, comments: IComment[]): IComment | undefined {
    for (const comment of comments) {
      if (comment.id === id) return comment
      if (comment.replies && comment.replies.length > 0) {
        const found = this.findCommentById(id, comment.replies)
        if (found) return found
      }
    }
    return undefined
  }

  private renderComment(comment: IComment) {
    const avatarUrl = `https://picsum.photos/seed/${comment.id}/`
    const listItem = document.createElement("li")
    listItem.className = "comment-list__item"
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
       <ul class="comment-reply-list"></ul>`
    const replyButton = listItem.querySelector(".panel__btn_reply") as HTMLButtonElement
    replyButton.addEventListener("click", (event) => this.handleReplyClick(event, replyButton))

    const minusButton = listItem.querySelector(".panel__rating-btn_minus") as HTMLButtonElement
    const plusButton = listItem.querySelector(".panel__rating-btn_plus") as HTMLButtonElement

    minusButton.addEventListener("click", (event) => this.handleRatingChange(event, comment.id, false))
    plusButton.addEventListener("click", (event) => this.handleRatingChange(event, comment.id, true))

    this.commentList.appendChild(listItem)

    comment.replies?.forEach((reply) => this.renderReply(comment.id, reply, comment.author))

    const favoriteButton = listItem.querySelector(".panel__btn_favorite") as HTMLButtonElement
    if (favoriteButton) {
      favoriteButton.addEventListener("click", () => this.toggleFavorite(comment.id))
      this.updateFavoriteButton(comment.id)
    }

    this.updateFavoriteButton(comment.id)
  }

  private handleRatingChange(event: Event, commentId: string, isIncrease: boolean): void {
    event.preventDefault()
    // Проверяем, не оценивал ли пользователь этот комментарий
    if (this.ratedComments.has(commentId)) {
      return
    }

    const comment = this.findCommentById(commentId, this.comments)
    if (comment) {
      comment.rating += isIncrease ? 1 : -1 // Изменяем рейтинг
      this.ratedComments.add(commentId) // Добавляем ID в список оцененных
      localStorage.setItem("ratedComments", JSON.stringify([...this.ratedComments]))
      this.saveComments() // Сохраняем изменения
      this.updateCommentRating(commentId) // Обновляем рейтинг в DOM
    }
  }

  private updateCommentRating(commentId: string): void {
    const commentElement = document.getElementById(commentId)
    if (commentElement) {
      const ratingElement = commentElement.querySelector(".rating") as HTMLElement
      const comment = this.findCommentById(commentId, this.comments)
      if (ratingElement && comment) {
        ratingElement.textContent = comment.rating.toString()
      }
    }
  }

  private renderReply(replyToId: string, reply: IComment, author: string) {
    const avatarUrl = `https://picsum.photos/seed/${reply.id}/`
    const commentElement = document.getElementById(replyToId) as HTMLElement
    const replyList = commentElement.nextElementSibling as HTMLUListElement
    const replyListItem = document.createElement("li")
    replyListItem.className = "comment-reply-list__item"
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
       </div>`

    const minusButton = replyListItem.querySelector(".panel__rating-btn_minus") as HTMLButtonElement
    const plusButton = replyListItem.querySelector(".panel__rating-btn_plus") as HTMLButtonElement

    minusButton.addEventListener("click", (event) => this.handleRatingChange(event, reply.id, false))
    plusButton.addEventListener("click", (event) => this.handleRatingChange(event, reply.id, true))
    replyList.appendChild(replyListItem)
    const favoriteButton = replyListItem.querySelector(".panel__btn_favorite") as HTMLButtonElement
    if (favoriteButton) {
      favoriteButton.addEventListener("click", () => this.toggleFavorite(reply.id))
      this.updateFavoriteButton(reply.id) // Обновляем состояние для ответа
    }
  }

  private saveComments() {
    localStorage.setItem("comments", JSON.stringify(this.comments))
  }

  private loadComments(): IComment[] {
    const commentsData = localStorage.getItem("comments")
    if (commentsData) {
      const comments = JSON.parse(commentsData)
      // Преобразуем строки в объекты Date для каждого комментария
      comments.forEach((comment: IComment) => {
        comment.date = new Date(comment.date) // Преобразуем строку в объект Date
        if (comment.replies) {
          comment.replies.forEach((reply) => {
            reply.date = new Date(reply.date) // Преобразуем строку в объект Date для каждого ответа
          })
        }
      })
      return comments
    }
    return []
  }

  public sortCommentsByDate(order: "asc" | "desc" = "asc"): void {
    this.comments.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return order === "asc" ? dateA - dateB : dateB - dateA
    })
  }

  public sortCommentsByReplys(order: "asc" | "desc" = "asc"): void {
    this.comments.sort((a, b) => {
      const replysA = a.replies?.length
      const replysB = b.replies?.length
      return order === "asc" ? replysA - replysB : replysB - replysA
    })
  }

  public sortCommentsByRating(order: "asc" | "desc" = "asc"): void {
    this.comments.sort((a, b) => {
      const ratingA = a.rating
      const ratungB = b.rating
      return order === "asc" ? ratingA - ratungB : ratungB - ratingA
    })
  }
}

class Utils {
  public static formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${day}.${month} ${hours}:${minutes}`
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const commentsApp: CommentsApp = new CommentsApp()
  new CustomSelect(".custom-select", ".custom-select__dropdown", commentsApp)
})

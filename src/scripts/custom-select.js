export class CustomSelect {
  selectElement
  dropdownElement
  textElement
  options
  commentsApp
  constructor(selectSelector, dropdownSelector, commentsApp) {
    this.selectElement = document.querySelector(selectSelector)
    this.dropdownElement = document.querySelector(dropdownSelector)
    this.textElement = this.selectElement.querySelector(".custom-select__text")
    this.options = this.dropdownElement.querySelectorAll(".custom-select__option")
    this.commentsApp = commentsApp
    this.init()
  }
  init() {
    this.selectElement.addEventListener("click", () => {
      this.toggleDropdown()
    })
    this.options.forEach((option) => {
      option.addEventListener("click", (event) => {
        this.selectOption(event.currentTarget)
      })
    })
    document.addEventListener("click", (event) => {
      if (!this.selectElement.contains(event.target) && !this.dropdownElement.contains(event.target)) {
        this.closeDropdown()
      }
    })
  }
  toggleDropdown() {
    const isOpen = this.dropdownElement.style.display === "flex"
    this.dropdownElement.style.display = isOpen ? "none" : "flex"
  }
  closeDropdown() {
    this.dropdownElement.style.display = "none"
  }
  selectOption(option) {
    const optionText = option.querySelector(".custom-select__option-text")?.textContent
    const selectedValue = option.getAttribute("data-value")
    if (optionText) {
      this.textElement.textContent = optionText
    }
    this.updateCheckVisibility(selectedValue)
    this.commentsApp.sortComments()
    this.commentsApp.renderComments()
    this.closeDropdown()
  }
  updateCheckVisibility(selectedValue) {
    this.options.forEach((option) => {
      const img = option.querySelector("img")
      const optionValue = option.getAttribute("data-value")
      if (img) {
        img.style.opacity = optionValue === selectedValue ? "1" : "0"
      }
    })
  }
}

import { CommentsApp } from "./commenting-system.js"

export class CustomSelect {
  private selectElement: HTMLElement
  private dropdownElement: HTMLElement
  private textElement: HTMLElement
  private options: NodeListOf<HTMLElement>
  private commentsApp: CommentsApp

  constructor(selectSelector: string, dropdownSelector: string, commentsApp: CommentsApp) {
    this.selectElement = document.querySelector(selectSelector) as HTMLElement
    this.dropdownElement = document.querySelector(dropdownSelector) as HTMLElement
    this.textElement = this.selectElement.querySelector(".custom-select__text") as HTMLElement
    this.options = this.dropdownElement.querySelectorAll(".custom-select__option")
    this.commentsApp = commentsApp

    this.init()
  }

  private init(): void {
    this.selectElement.addEventListener("click", () => {
      this.toggleDropdown()
    })

    this.options.forEach((option) => {
      option.addEventListener("click", (event) => {
        this.selectOption(event.currentTarget as HTMLElement)
      })
    })

    document.addEventListener("click", (event) => {
      if (!this.selectElement.contains(event.target as Node) && !this.dropdownElement.contains(event.target as Node)) {
        this.closeDropdown()
      }
    })
  }

  private toggleDropdown(): void {
    const isOpen = this.dropdownElement.style.display === "flex"
    this.dropdownElement.style.display = isOpen ? "none" : "flex"
  }

  private closeDropdown(): void {
    this.dropdownElement.style.display = "none"
  }

  public selectOption(option: HTMLElement): void {
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

  private updateCheckVisibility(selectedValue: string | null): void {
    this.options.forEach((option) => {
      const img = option.querySelector("img") as HTMLElement
      const optionValue = option.getAttribute("data-value")
      if (img) {
        img.style.opacity = optionValue === selectedValue ? "1" : "0"
      }
    })
  }
}

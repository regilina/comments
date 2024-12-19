import { IComment } from "./i-comment.js"
import { ApiResponse } from "./api-response.js"

export class UserComment implements IComment {
  id: string
  text: string
  date: Date
  author: string
  replies: IComment[]
  rating: number
  userVote: number

  constructor(text: string, author?: string) {
    this.id = crypto.randomUUID()
    this.text = text
    this.date = new Date()
    this.author = author || "unknown"
    this.getUserName().then((name) => {
      if (name) {
        console.log(`First Name: ${name.first}, Last Name: ${name.last}`)
        this.author = name.first + " " + name.last
        console.log(this.author)
      } else {
        console.log("Failed to fetch user name.")
      }
    })

    this.replies = []
    this.rating = 0
    this.userVote = 0
  }

  private async getUserName(): Promise<{ first: string; last: string } | null> {
    try {
      const response = await fetch("https://randomuser.me/api/")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      const user = data.results[0]

      return { first: user.name.first, last: user.name.last }
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }
}

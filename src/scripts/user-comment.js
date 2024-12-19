export class UserComment {
  id
  text
  date
  author
  replies
  rating
  userVote
  constructor(text, author) {
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
  async getUserName() {
    try {
      const response = await fetch("https://randomuser.me/api/")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const user = data.results[0]
      return { first: user.name.first, last: user.name.last }
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }
}

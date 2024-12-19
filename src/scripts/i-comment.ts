export interface IComment {
  id: string
  text: string
  date: Date
  author: string

  replies: IComment[]
  rating: number
  userVote: number
}

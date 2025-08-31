export type Comment = {
  id?: string
  _id?: string
  userId: string
  userName: string
  text: string
  marbleId: string
  rating: number
  createdAt?: string | Date
}

export type NewComment = {
  userId: string
  userName: string
  text: string
  marbleId: string
  rating: number
}

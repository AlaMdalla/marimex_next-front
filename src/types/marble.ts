export interface Marble {
  _id?: string
  id?: string
  name: string
  price: number | string
  favorite?: boolean
  stars?: number
  imageurl: string
  description?: string
  descriptions?: string // some APIs may use this key
  tags?: string[]
}

export type NewMarble = Omit<Marble, "_id" | "id"> & { price: number | string }

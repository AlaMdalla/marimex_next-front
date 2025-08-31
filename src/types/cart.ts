export interface CartItem {
  id: number
  marble: {
    id: number
    name: string
    price: number
    imageurl: string
  }
  count: number
}

export interface Location {
  lat: number
  lng: number
  address?: string
}

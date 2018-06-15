export type Project = {
  id: String
  title: String
  ownerId: String
}

export type Item = {
  id: string
  title: string
  notes: string
  complete: boolean
  ordinal: number
  ownerId: string
}

export type Query = {
  items: Item[]
  projects: Project[]
}

export type Mutation = {
  addProject: Project
  addItem: Item
  editItem: Item
}
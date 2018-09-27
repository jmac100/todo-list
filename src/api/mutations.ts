import gql from "graphql-tag"

const addProjectMutation = gql`
  mutation addProject($title: String!, $ownerId: ID!) {
    addProject(title: $title, ownerId: $ownerId) {
      id
      title
      ownerId
    }
  }
`

const deleteProjectMutation = gql`
  mutation deleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
      title
      ownerId
    }
  }
`

const addItemMutation = gql`
  mutation addItem($title: String!, $notes: String, $complete: Boolean, $ordinal: Int!, $ownerId: ID!, $projectId: ID!, $dueDate: String) {
    addItem(title: $title, notes: $notes, complete: $complete, ordinal: $ordinal, ownerId: $ownerId, projectId: $projectId, dueDate: $dueDate) {
      id
      title
      notes
      complete
      ordinal
      ownerId
      projectId
      dueDate
    }
  }
`

const editItemMutation = gql`
  mutation editItem($id: ID!, $title: String, $notes: String, $complete: Boolean, $ordinal: Int, $dueDate: String, $projectId: ID) {
    editItem(id: $id, title: $title, notes: $notes, complete: $complete, ordinal: $ordinal, dueDate: $dueDate, projectId: $projectId) {
      id
      title
      notes
      complete
      ordinal
      ownerId
      projectId
      dueDate
    }
  }
`

const deleteItemMutation = gql`
  mutation deleteItem($id: ID!, $ordinal: Int!, $projectId: ID!) {
    deleteItem(id: $id, ordinal: $ordinal, projectId: $projectId) {
      id
      title
      notes
      complete
      ordinal
      ownerId
      projectId
      dueDate
    }
  }
`

const deleteAllItemsByOwnerMutation = gql`
  mutation deleteAllItemsByOwner($ownerId: ID!) {
    deleteAllItemsByOwner(ownerId: $ownerId) {
      id
      title
      notes
      complete
      ordinal
      ownerId
      dueDate
    }
  }
`

const updateOrdinalMutation = gql`
  mutation updateOrdinal($projectId: ID!, $id: ID!, $newOrdinal: Int!, $up: Boolean!) {
    updateOrdinal(projectId: $projectId, id: $id, newOrdinal: $newOrdinal, up: $up) {
      id
    }
  }
`

export {
  addProjectMutation,
  deleteProjectMutation,
  addItemMutation,
  editItemMutation,
  deleteItemMutation,
  deleteAllItemsByOwnerMutation,
  updateOrdinalMutation
}
import gql from "graphql-tag"

const projectsQuery = gql`
  query project($ownerId: ID!) {
    projects(ownerId: $ownerId) {
      id
      title
      ownerId
    }
  }
`

const itemQuery = gql`
  query item($id: ID) {
    item(id: $id){
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

const itemsQuery = gql`
  query items($projectId: ID!) {
    items(projectId: $projectId) {
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

export {
  projectsQuery,
  itemQuery,
  itemsQuery
}
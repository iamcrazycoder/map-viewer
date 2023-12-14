export default `
  type Tree {
    id: ID!
    treeId: String
    longitude: Float
    latitude: Float
    status: String
    health: String
    species: String
    problems: [String]
    address: String
    zipcode: String
    city: String
    state: String
  }

  type CompressedTree {
    id: ID!
    longitude: Float
    latitude: Float
  }

  input TreesFilter {
    health: [String]
    species: [String]
    problems: [String]
  }

  type Query {
    getTree(id: ID!): Tree
    getTrees(filter: TreesFilter, boundingBox: [[Float]]): [CompressedTree]
  }
`;

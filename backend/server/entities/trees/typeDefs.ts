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
    health: String
  }

  type InsightsPayload {
    count: Int
    city: String
    longitude: Float
    latitude: Float
    boundingBox: [[Float]]
  }

  input TreesFilter {
    health: [String]
    species: [String]
    problems: [String]
  }

  type FilterPayload {
    health: [String]
    species: [String]
    problems: [String]
  }

  type Query {
    getTree(id: ID!): Tree
    getTrees(filter: TreesFilter, boundingBox: [[Float]]): [CompressedTree]
    getTreesInsights(filter: TreesFilter, boundingBox: [[Float]]): [InsightsPayload]
    getFilterOptions: FilterPayload
  }
`;

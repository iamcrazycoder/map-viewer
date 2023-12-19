import { gql } from "@apollo/client";

export const GET_TREE_QUERY = gql`
  query getTree($id: ID!) {
    getTree(id: $id) {
      id
      treeId
      latitude
      longitude
      status
      health
      species
      problems
      address
      zipcode
      city
      state
    }
  }
`;

export const GET_TREES_QUERY = gql`
  query getTrees($filter: TreesFilter!, $boundingBox: [[Float]]) {
    getTrees(filter: $filter, boundingBox: $boundingBox) {
      id
      latitude
      longitude
      health
    }
  }
`;

export const GET_TREES_INSIGHTS_QUERY = gql`
  query getTreesInsights($filter: TreesFilter!, $boundingBox: [[Float]]) {
    getTreesInsights(filter: $filter, boundingBox: $boundingBox) {
      count
      city
      longitude
      latitude
      boundingBox
    }
  }
`;

export const GET_FILTER_OPTIONS_QUERY = gql`
  query getFilterOptions {
    getFilterOptions {
      health
      species
      problems
    }
  }
`;

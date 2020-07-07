const graphql = require("graphql");
const _ = require("lodash");

const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const usersData = [
  {
    id: "2",
    firstName: "Alex",
    age: 21,
  },
  {
    id: "1",
    firstName: "Alex",
    age: 21,
  },
];

// 下面这个声明的是一个collection长什么样
const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
  },
});

// 数据的进口出 rootquery,

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // user collection handler
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        const { id } = args;

        const result = _.find(usersData, { id: id });

        return result;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});

/**
 * query {
 *  user(id: "2"){ -> 这个user和rootquery中的user是相互对性的
 *    id
 *    firstName
 *    age
 *    }
 * }
 */

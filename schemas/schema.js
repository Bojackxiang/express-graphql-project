const graphql = require("graphql");
const _ = require("lodash");
const axios = require("axios");

const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;


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
      args: { id: { type: GraphQLString }, name: {type: GraphQLString} }, // input的参数
      async resolve (parentValue, args) {
        const {id} = args
        // 这边的关键点在于返回的数据一定要和期盼的数据的格式一一对应
        const result = await axios.get(`http://localhost:3000/users/${id}`)
        const resultData = result.data;
        console.log(resultData)
        return resultData;
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

 /**
  * 到目前为止，可以把graphql堪称一个过滤数据的东西，每次获得了数据库脸的数据，我们通过graphql来进行格式化，
  */
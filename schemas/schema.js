const graphql = require("graphql");
const _ = require("lodash");
const axios = require("axios");
const { update } = require("lodash");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

// Shared response for the request
const Response = new GraphQLObjectType({
  name:"Response",
  fields: {
    success: GraphQLString,
    message: GraphQLString,
  }
})

/**
 * 现在company和user两个是相互依赖的，我们需要解决这个 loop 的问题
 */
const companyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    // 这个func的实际意义是：目前 只是定义，而不是 run 这个function，等到这个歌的东西运行起来的时候，才run
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentValue, args) {
        const result = await axios.get(
          `http://localhost:3000/companies/${parentValue.id}/users`
        );
        return result.data;
      },
    },
  }),
});


// 下面这个声明的是一个collection长什么样
// 相互依赖的解决问题
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: companyType,
      async resolve(parentValue, args) {
        // !! 这个是帮助 user 来获取company的数据的, !! 如果是关联数据的话，（nested data）那就必须要一个resolve来帮助解决
        // !! parent value user resolve 之后的获取的数据
        // 只有嵌套的才有 parent value的存在
        const { companyId } = parentValue;
        console.log("companyId: ", companyId);
        const result = await axios.get(
          `http://localhost:3000/companies/${companyId}`
        );
        return result.data;
      },
    },
  }),
});

// 数据的进口出 rootquery,
// 只有 rootQuery 中存在的，我们才能在 query 中直接获取
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // user collection handler
    user: {
      type: UserType,
      args: { id: { type: GraphQLString }, name: { type: GraphQLString } }, // input的参数
      async resolve(parentValue, args) {
        const { id } = args;
        // 这边的关键点在于返回的数据一定要和期盼的数据的格式一一对应
        const result = await axios.get(`http://localhost:3000/users/${id}`);
        const resultData = result.data;
        console.log(resultData);
        return resultData;
      },
    },

    // companies
    companies: {
      type: companyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const result = await axios.get(
          `http://localhost:3000/companies/${args.id}`
        );
        return result.data;
      },
    },
  },
});

// mutation mutation
const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) }, // graphql non-null 说明这个参数一定需要的
        age: { type: new GraphQLNonNull(GraphQLInt) }, // you have to provide to this thing ...
        companyId: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parentValue, args) {
        const { firstName, age, companyId } = args;
        const result = await axios.post("http://localhost:3000/users", {
          firstName,
          age,
          companyId,
        });

        const resp = result.data;

        return resp;
      },
    },

    deleteUser: {
      // type: GraphQLString, // 如果只是return一个单一的数据的话，是不需要object来辅助的
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) }, // 传进来的id不能是null
      },
      async resolve(parentValue, args) {
        const { userId } = args;
        console.log("userId: ", userId);

        await axios.delete(`http://localhost:3000/users/${userId}`);

        //  return "Delete the user successfully"
        return {
          success: "yes",
        };
      },
    },

    editUser: {
      type: Response,
      args: { // !! 注意： mutation 的args不能是fields
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      async resolve(parentValue, args) {
        console.log(`mutation : edit user ......`);
        const { id, name, companyId } = args;
        console.log('edit user ...')
        console.log("id, name, companyId: ", id, name, companyId);

        const updateResult = await axios.patch(`http://localhost:3000/users/${id}`, {
          companyId
        })

        console.log(updateResult);
        
        return {
          success: 'success',
          message: "message"
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
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

/**
 * 基本流程：
 * -> 1. 先看root进来的是什么type
 * -> 2. 我自己的 root 先把我自己的数据给请求了 (resolve)
 * -> 3. 开始到type中处理数据的格式问题
 * -> 4. 如果有嵌套，再resolve，来满足格式
 * -> 5. 返回给前端
 */

 /**
  * different between put and patch : put 会把所有的值都覆盖，如果密友提供，那么就是null
  */

  /**
   * 如果没有 nonNull 的话，那么就意味着 这个 value 是 optional
   */
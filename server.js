const express = require('express')
const { graphqlHTTP } = require('express-graphql');

const app = express();
/**
 * graphql 的配置
 */
app.use("/graphql", graphqlHTTP({
    graphiql: true,
  }),)

app.listen(4000, () => {
    console.log('listening ...')
})
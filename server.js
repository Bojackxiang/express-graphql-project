const express = require('express')
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schemas/schema')

const app = express();
/**
 * graphql 的配置
 */
app.use("/graphql", graphqlHTTP({
    schema,
    graphiql: true,
  }),)

app.listen(4000, () => {
    console.log('listening ...')
})
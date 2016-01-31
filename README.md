# rethinkdb-index-tuning

Demonstrates different types of indexes in RethinkDB and how query performance is affected.

## Setup

- First [install RethinkDB](https://www.rethinkdb.com/docs/install/) for your 
platform.
- Start the RethinkDB server by running this command in your terminal:

  ```
  rethinkdb
  ```
  
- Install dependencies and seed the database by running these commands in another terminal:

  ```
  npm install
  npm run seed
  ```
    
This will create a database named `index_tuning` containing a single table named `posts`.
    
## Running

	
    npm start
    
This will run setup to create the indexes. Then the benchmark suite will run, testing 3 different queries. All queries return documents in the posts table with a given **author** and **tag**. Each query returns the same result but uses different RethinkDB api calls and a different indexes.

1. Chained `filter` commands
 
  ```
  r.table('posts')
    .filter(
      r.row('author').eq(author).and(
      r.row('tags').contains(tag))
    ).run(conn);
  ```
2. `getAll` with simple index and `filter`

  ```
  r.table('posts')
    .getAll(author, { index: 'author' })
    .filter(r.row('tags').contains(tag))
    .run(conn);
  ```
3. `getAll` with mapped multi index
  
  ```
  r.table('posts')
    .getAll([author, tag], { index: 'authorTags' })
    .run(conn)
  ```

The benchmark will output some stats including ops/sec, mean run time, and will declare the fastest and slowest query of the bunch.

## Cleanup
To drop the database:

    npm run clean
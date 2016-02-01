import r from 'rethinkdb';

const table = r.table('posts');

function dropIndexes(conn, indexes) {
  return Promise.all(indexes.map(i => {
    return table.indexDrop(i).run(conn);
  }));
}

export function cleanup(config) {
  r.connect(config).then(conn => {
    return r.dbDrop(config.db).run(conn).catch(err => {
      console.error(`Error dropping database ${config.db}`, err);
    }).then(() => {
      return console.info(`Dropped database ${config.db}`);
    }).finally(() => {
      console.info('Cleanup complete');
      return conn.close();
    });
  });
}

export function setup(config, cb) {
  r.connect(config).then(conn => {
  return table.indexList().run(conn).then(indexes => {
      return dropIndexes(conn, indexes);
    }).then(() => {
      return table.indexCreate('author').run(conn);
    }).then(() => {
      return table.indexCreate('tags', {multi: true}).run(conn);
    }).then(() => {
      return table.indexCreate('authorTags',
        (post) => post('tags').map(tag => [ post('author'), 'tag']),
        { multi: true }).run(conn);
    }).then(() => table.indexWait().run(conn))
    .catch(err => console.error(`Error in setup ${err}`))
    .finally(() => {
      console.info('Setup complete');
      return conn.close();
    });
  });
}

export function filterRowPredicate(conn, author, tag) {
  return r.table('posts')
    .filter(
      r.row('author').eq(author).and(
      r.row('tags').contains(tag))
    ).run(conn);
}

export function filterPredicateFunction(conn, author, tag) {
  return r.table('posts')
    .filter(post => r.and(post('author').eq(author),
      post('tags').contains(tag))
    ).run(conn);
}

export function getAllFilterChain(conn, author, tag) {
  return r.table('posts')
    .getAll(author, { index: 'author' })
    .filter(r.row('tags').contains(tag))
    .run(conn);
}

export function getAllMapped(conn, author, tag) {  
  return r.table('posts')
    .getAll([author, tag], { index: 'authorTags' })
    .run(conn);
}

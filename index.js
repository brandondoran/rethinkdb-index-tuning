import r from 'rethinkdb';
import { Suite } from 'benchmark';
import config from './config';
import { filterOnly, getAllAndFilter, mapped } from './lib/db';

const suite = new Suite();
const author = 'Kendra Mertz';
const tag = 'cat';

r.connect(config).then(conn => {
  console.info(`Connected to rethinkdb at ${config.host}:${config.port}...\n`);
  return suite
    .add('filterOnly', {
      defer: true,
      fn: deferred => {
        suite.name;
        filterOnly(conn, author, tag).then(() => deferred.resolve());
      }
    })
    .add('getAllAndFilter', {
      defer: true,
      fn: deferred => {
        suite.name;
        getAllAndFilter(conn, author, tag).then(() => deferred.resolve());
      }
    })
    .add('mapped', {
      defer: true,
      fn: deferred => {
        suite.name;
        mapped(conn, author, tag).then(() => deferred.resolve());
      }
    })
    .on('cycle', function(event) {
        console.info(String(event.target));
    })
    .on('complete', function() {
      console.info('\nrun times (mean):')
      this.forEach(b => {
        console.info(`${b.name} ${b.stats.mean * 1000} ms`);
      });
      console.info(`\nFastest is ${this.filter('fastest').map('name')}`);
      console.info(`Slowest is ${this.filter('slowest').map('name')}`);
      conn.close();
    })
    .run({async:true});
}).catch(err => console.error(err.stack));

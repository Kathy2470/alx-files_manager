import redis from 'redis';
import { expect } from 'chai';

describe('Redis Client', () => {
  let client;

  before((done) => {
    client = redis.createClient({
      host: 'localhost',
      port: 6379,
    });

    client.on('error', (err) => {
      done(err); // If there's an error, fail the test
    });

    client.on('connect', () => {
      done(); // Connection successful, proceed with tests
    });
  });

  after((done) => {
    client.quit();
    done();
  });

  it('should set and get a key successfully', (done) => {
    client.set('testKey', 'testValue', (err) => {
      if (err) done(err);

      client.get('testKey', (err, value) => {
        if (err) done(err);

        expect(value).to.equal('testValue');
        done();
      });
    });
  });
});


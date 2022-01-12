let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let server = require('./server')

chai.use(chaiHttp);

const basePath = '/input/pager'
describe(basePath, () => {
  describe('Authentication', () => {
    it(`GET ${basePath} should not work`, (done) => {
      chai.request(server.base)
        .get(basePath)
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          res.should.have.status(405);
          done();
        });
    });

    it(`POST ${basePath} should require authentication`, (done) => {
      chai.request(server.base)
        .post(basePath)
        .send({})
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          res.should.have.status(401);
          done();
        });
    });

    it(`POST ${basePath} should reject invalid JWT`, (done) => {
      chai.request(server.base)
        .post(basePath)
        .auth('invalid-token', { type: 'bearer' })
        .send({})
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          res.should.have.status(401);
          done();
        });
    });
  });
});

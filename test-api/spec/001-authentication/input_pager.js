let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);

const basePath = '/input/pager'
describe(basePath, () => {
  describe('Authentication', () => {
    it(`GET ${basePath} should not work`, function (done) {
      chai.request(this.server.base)
        .get(basePath)
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          res.should.have.status(405);
          done();
        });
    });

    it(`POST ${basePath} should require authentication`, function (done) {
      chai.request(this.server.base)
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

    it(`POST ${basePath} should reject invalid JWT`, function (done) {
      chai.request(this.server.base)
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

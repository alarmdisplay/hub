let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let server = require('./server')

chai.use(chaiHttp);

describe('Wait for server', function () {
  this.retries(12);
  it(`should be reachable`, function(done) {
    this.timeout(6000);
    chai.request(server.base)
      .get('/')
      .end((err, res) => {
        if (err) {
          setTimeout(() => { done(err) }, 5000);
          return
        }
        res.should.have.status(200);
        done();
      });
  });
});
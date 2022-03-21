let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);

describe('The server', function () {
  this.retries(12);

  it(`should be reachable`, function(done) {
    this.timeout(6000);
    chai.request(this.server.base)
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

  it(`should be ready`, function(done) {
    this.timeout(2000);
    this.slow(5000); // Basically disable the 'slow' reporting
    chai.request(this.server.base)
      .get('/status')
      .end((err, res) => {
        // Delay the evaluation a bit, so we don't burn through our retries
        setTimeout(() => {
          if (err) {
            done(err);
            return
          }
          res.should.have.status(200);
          res.body.should.include({ ready: true });
          done();
        }, 1500);
      });
  });
});

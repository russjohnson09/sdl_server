
//load main server config and do other things
var common = require('../common');

// var expect = common.expect;
const emailer = require('../../lib/emailer');
const expect = require('chai').expect;

async function sendMail(data)
{

  return new Promise((resolve,reject) => {
    emailer.send(data, function(error,result) {
      // console.log(`email`,x,y);
      resolve({error,result});

    });
  })
}

describe('email tests', function() {
  it('should be able to send', async function() {

    this.timeout(5 * 1000);
    let data = {
      to: `russjohnson09@gmail.com`,
      subject: "SDL App Pending Review",
      html: `test send`
    };
    let {result,error} = await sendMail(data);

    console.log(`result`,result,error);

    expect(error).to.be.null;

  });

})

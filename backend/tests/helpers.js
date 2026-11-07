const { signToken } = require('../src/utils/jwt');

const ids = {
  client: '64b000000000000000000001',
  freelancer: '64b000000000000000000002',
  otherFreelancer: '64b000000000000000000003',
  admin: '64b000000000000000000004',
  gig: '64b0000000000000000000a1',
};

function tokenFor(role, id) {
  return `Bearer ${signToken({ id, email: `${role}@example.com`, role })}`;
}

module.exports = { ids, tokenFor };

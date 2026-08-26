const ROLES = Object.freeze({
  CLIENT: 'client',
  FREELANCER: 'freelancer',
  ADMIN: 'admin',
});

const SELF_REGISTERABLE_ROLES = [ROLES.CLIENT, ROLES.FREELANCER];

module.exports = { ROLES, SELF_REGISTERABLE_ROLES };
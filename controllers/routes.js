const route = require('express').Router();

route.get('/', (_req, res, _next) => {
  res.sendFile(`${__dirname}/public/`);
});

module.exports = route;
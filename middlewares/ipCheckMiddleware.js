const ipCheckMiddleware = (db) => (req, res, next) => {
  const logger = require("../logger/log")

  var clientIp = req.ip || req.connection.remoteAddress;

  if (clientIp == "::1") {
    clientIp = req.headers["ip"];
  }

  const { uuid } = req.params;

  db.query('SELECT name, api_key, allowed_ips, blacklisted_ips FROM products WHERE uuid = ?', [uuid], (err, results) => {
    if (err) {
      return res.status(500).send('Database error.');
    }

    if (results.length === 0) {
      return res.status(404).send('Product not found.');
    }

    const allowedIps = JSON.parse(results[0].allowed_ips);
    const blacklistIps = JSON.parse(results[0].blacklisted_ips);
    const api_key = results[0].api_key
    const name = results[0].name

    if (blacklistIps.includes(clientIp)) {
      logger(api_key, name, clientIp, "blacklist", db)
      return res.status(200).json({ success: false, message: 'IP address is blacklisted.', ip: clientIp });
    }

    if (!allowedIps.includes(clientIp)) {
      logger(api_key, name, clientIp, "false", db)
      return res.status(200).json({ success: false, message: 'IP address not allowed.', ip: clientIp });
    }

    logger(api_key, name, clientIp, "true", db)

    next();
  });
};
  
  module.exports = ipCheckMiddleware;
  
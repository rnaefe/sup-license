const ipCheckMiddleware = (db) => (req, res, next) => {
    var clientIp = req.ip || req.connection.remoteAddress;
    if (clientIp == "::1") {
      clientIp = req.headers["ip"];
    }
    const { uuid } = req.params;
  
    db.query('SELECT allowed_ips, blacklisted_ips FROM products WHERE uuid = ?', [uuid], (err, results) => {
      if (err) {
        return res.status(500).send('Database error.');
      }
  
      if (results.length === 0) {
        return res.status(404).send('Product not found.');
      }
  
      const allowedIps = JSON.parse(results[0].allowed_ips);
      const blacklistIps = JSON.parse(results[0].blacklisted_ips);

      if (blacklistIps.includes(clientIp)) {
        return res.status(200).json({ success: false, message: 'IP address is blacklisted.', ip: clientIp });
      }

      if (!allowedIps.includes(clientIp)) {
        return res.status(200).json({ success: false, message: 'IP address not allowed.', ip: clientIp });
      }
  
      next();
    });
  };
  
  module.exports = ipCheckMiddleware;
  
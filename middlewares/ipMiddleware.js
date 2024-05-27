const ipMiddleware = () => (req, res, next) => {
    var clientIp = req.ip || req.connection.remoteAddress;
  
    if (clientIp == "::1") {
      clientIp = req.headers["ip"];
    }

    req.headers["x-ip"] = clientIp

    next();
};
    
module.exports = ipMiddleware;

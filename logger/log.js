module.exports = (api_key, name, ip, status, db) => {
    db.query('INSERT INTO logs (api_key, name, ip, status) VALUES (?, ?, ?, ?)', 
    [api_key, name, ip, status], (err, results) => {
        if (err) {
            throw err
        }
    });
}
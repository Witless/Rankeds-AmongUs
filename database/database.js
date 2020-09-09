const conn = require("./connector").init();

exports.getMatch = (hkey) => {
      return !hkey ? "hkey must be provided"
      : new Promise(async (resolve, reject) => {
         await conn.lrange(hkey, 0, 9, (err, val) => {
              val.length ? resolve(val)
                : reject(err)
        })
      })
}
exports.newMatch = (hkey, users) => {
      return !hkey ? "hkey must be provided"
    : !users ? "user must be provided"
    : new Promise (async (resolve, reject) => {
      users.forEach((userID) => {
            conn.rpush(hkey, userID)
      })
    resolve(1);
    })
}
exports.delMatch = (hkey) => {
    return !hkey ? "hkey must be provided"
    : new Promise (async (resolve, reject) => {
            conn.del(hkey, (err, res) => {
                res ? resolve(1) : reject( 1)
            })
    })
}


const login = (req, res, next) => {
  req.user = 'admin'
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  )
  next()
}

module.exports = login

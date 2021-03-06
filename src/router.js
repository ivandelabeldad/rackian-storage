const express = require('express')
const bodyParser = require('body-parser')
const paginationMiddleware = require('./middlewares/paginationMiddleware')
const authMiddleware = require('./middlewares/authMiddleware')
const healthController = require('./health/healthController')
const healthRouter = express.Router()

const folderController = require('./folders/folderController')
const Folder = require('./folders/Folder')
const folderRouter = express.Router()

healthRouter.get('/', healthController.get)

folderRouter.use('/', authMiddleware)
folderRouter.get('/', paginationMiddleware.paginate, folderController.get)
folderRouter.get('/:id/', folderController.getById)
folderRouter.post('/', Folder.validation(), folderController.post)
folderRouter.put('/:id/', Folder.validation(), folderController.put)
folderRouter.delete('/:id/', folderController.del)

module.exports = {
  enroute: (app) => {
    app.use(bodyParser.json())
    app.use('/healthz', healthRouter)
    app.use(Folder.uri, folderRouter)
    app.use(paginationMiddleware.process)
  }
}

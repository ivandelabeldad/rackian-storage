const { MongoClient, Db } = require('mongodb')
const logger = require('./logger')
const config = require('./config').load()

/**
 * @type {Db}
 */
let db = null

// TODO
const init = async () => {
  await connect()
  // CREATE INDEXES
}

const connect = async () => {
  const client = await MongoClient.connect(config.db.uri)
  const myDb = client.db(config.db.dbName)
  logger.info(`Database ${config.db.dbName} loaded`)
  db = myDb
  return db
}

const disconnect = async () => {
  logger.info(`Database ${config.db.dbName} disconnected`)
  return db.close()
}

const checkConnection = () => {
  if (!(db instanceof Db) && !db) throw new Error('Database is not connected')
}

/**
 * @return {Db}
 */
const database = () => {
  checkConnection()
  return db
}

/**
 * @param {string} collection
 */
const load = (collection) => {
  return {
    /**
     * @param {Object} opts
     * @param {number} opts.skip
     * @param {number} opts.limit
     * @param {Object} [opts.filter]
     * @param {Object} [opts.projection]
     * @return {Promise<[]>}
     */
    find: async (opts = {}) => {
      checkConnection()
      if (!opts.skip || !opts.limit) {
        throw new Error('DbService.find require at least skip and limit')
      }
      if (opts.filter && opts.filter.id) {
        opts.filter._id = opts.filter.id
        delete opts.filter.id
      }
      return db
        .collection(collection)
        .find()
        .filter(opts.filter)
        .project(opts.projection)
        .skip(opts.skip)
        .limit(opts.limit)
        .toArray()
    },

    /**
     * @param {Object} opts
     * @param {string} opts.filter
     * @return {Promise<Object>}
     */
    findOne: async (opts = {}) => {
      checkConnection()
      if (!opts.filter) throw new Error('DbService.findOne require a filter')
      if (opts.filter.id) {
        opts.filter._id = opts.filter.id
        delete opts.filter.id
      }
      return db.collection(collection)
        .findOne(opts.filter)
    },

    /**
     * @param {Object} opts
     * @param {Object} opts.object
     */
    save: async (opts = {}) => {
      checkConnection()
      if (!opts.object) throw new Error('DbService.save require an Object')
      return db.collection(collection)
        .save(opts.object)
    },

    /**
     * @param {Object} opts
     * @param {string} opts.id
     * @param {Object} opts.newObject
     */
    update: async (opts = {}) => {
      checkConnection()
      if (!opts.id || !opts.newObject) {
        throw new Error('DbService.save require the id and the new object')
      }
      return db.collection(collection)
        .updateOne({ _id: opts.id }, opts.newObject)
    },

    /**
     * @param {Object} opts
     * @param {string} opts.id
     */
    delete: async (opts = {}) => {
      checkConnection()
      if (!opts.id) throw new Error('DbService.delete require an ID')
      return db.collection(collection)
        .deleteOne({ _id: opts.id })
    },

    collection: () => {
      checkConnection()
      return db.collection(collection)
    }
  }
}

module.exports = { init, connect, disconnect, load, database }
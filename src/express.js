import log from './logger.js'
import express from 'express'

const PORT = process.env.PORT || 3000

const app = express()

const server = app.listen(PORT, ()=>{
  log.info(`bot-client monitor is listening on ${server.address().port}`)
})

app.get('/', (req, res)=>{
  res.sendStatus(200)
})

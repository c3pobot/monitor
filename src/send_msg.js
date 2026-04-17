import log from './logger.js'
import fetch from 'node-fetch'

const DISCORD_MESSAGE_WEBHOOK = process.env.DISCORD_MESSAGE_WEBHOOK

const sendMsg = (msg2send)=>{
  try{
    if(!DISCORD_MESSAGE_WEBHOOK || !msg2send) return
    let opts = { headers: { 'Content-Type': 'application/json'}, timeout: 30000, compress: true, method: 'POST' }
    opts.body = JSON.stringify({ content: msg2send })
    fetch(DISCORD_MESSAGE_WEBHOOK, opts)
  }catch(e){
    log.error(e)
  }
}
export default sendMsg

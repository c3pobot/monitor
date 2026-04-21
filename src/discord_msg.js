import fetch from 'node-fetch'
import log from './logger.js'
import { dataList } from './data_list.js'

const DISCORD_STATUS_WEBHOOK = process.env.DISCORD_STATUS_WEBHOOK, DISCORD_STATUS_WEBHOOK_MESSAGE_ID = process.env.DISCORD_STATUS_WEBHOOK_MESSAGE_ID

const updateMsg = async()=>{
  try{
    if(!DISCORD_STATUS_WEBHOOK) return
    let opts = { headers: { 'Content-Type': 'application/json'}, timeout: 30000, compress: true, method: 'POST' }, uri = DISCORD_STATUS_WEBHOOK
    if(DISCORD_STATUS_WEBHOOK_MESSAGE_ID){
      opts.method = 'PATCH',
      uri += `/messages/${DISCORD_STATUS_WEBHOOK_MESSAGE_ID}`
    }
    let msg2send = {
      color: 15844367,
      timestamp: new Date(),
      description: 'C3PO Discord Client Status\n```ansi\n',
      footer: {
        text: "Data updated"
      }
    }
    for(let i in dataList){
      if(!i || !dataList[i]) continue
      if(i == 'node_status') continue
      msg2send.description += `Client ${i}: ${dataList[i].state == 'ON' ? "\u001b[1;37mOnline\u001b[0m":"\u001b[1;31mOffline\u001b[0m"}\n`
    }
    msg2send.description += '```'
    opts.body = JSON.stringify({content: null, embeds: [msg2send]})
    await fetch(uri, opts)
  }catch(e){
    log.error(e)
  }
}
const sync = async()=>{
  try{
    await updateMsg()
    setTimeout(sync, 30000)
  }catch(e){
    setTimeout(sync, 30000)
    log.error(e)
  }
}
export default sync

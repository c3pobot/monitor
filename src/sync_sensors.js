import log from './logger.js'
import mqtt from './mqtt.js'
import checkClient from './check_client.js'
import sendMsg from './send_msg.js'
import { dataList } from './data_list.js'

const CLIENT_HOSTS = JSON.parse(process.env.CLIENT_HOSTS || "[]"), DEVICE_NAME = (process.env.DEVICE_NAME || 'Bot')?.toLowerCase(), DISCORD_USER_ID = process.env.DISCORD_USER_ID

const checkHosts = async()=>{
  try{
    if(!CLIENT_HOSTS || CLIENT_HOSTS?.length == 0) return
    let count = 0
    for(let i in CLIENT_HOSTS){
      if(!CLIENT_HOSTS[i]) continue
      let status = await checkClient(CLIENT_HOSTS[i])
      if(status) count++
      if(!status && dataList[i] == 'ON') sendMsg(`${DISCORD_USER_ID ? `<@${DISCORD_USER_ID}> `:''}Bot Client ${i} went offline...`)
      if(status && dataList[i] == 'OFF') sendMsg(`Bot Client ${i} came back online...`)
      dataList[i] = (status ? 'ON':'OFF')
      mqtt.publish(`${DEVICE_NAME}/client_${i}/connection/state`, dataList[i])
    }
    dataList.node_status = (count == CLIENT_HOSTS.length) ? 'ON':'OFF'
    mqtt.publish(`${DEVICE_NAME}/connection/state`, dataList.node_status)
  }catch(e){
    log.error(e)
  }
}
const sync = async()=>{
  try{
    await checkHosts()
    setTimeout(sync, 30000)
  }catch(e){
    setTimeout(sync, 5000)
    log.error(e)
  }
}
export default sync

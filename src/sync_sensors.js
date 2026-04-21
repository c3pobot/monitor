import log from './logger.js'
import mqtt from './mqtt.js'
import checkClient from './check_client.js'
import sendMsg from './send_msg.js'
import { dataList } from './data_list.js'

const DEVICE_NAME = (process.env.DEVICE_NAME || 'Bot')?.toLowerCase(), DISCORD_USER_ID = process.env.DISCORD_USER_ID
const NUM_CLIENTS = +(process.env.NUM_CLIENTS || 10)
const checkHosts = async()=>{
  try{
    if(!NUM_CLIENTS || NUM_CLIENTS == 0) return
    let disconnectedCount = 0
    for(let i=0;i<NUM_CLIENTS;i++){
      let status = await checkClient(`bot${i}.c3po.wtf`)
      if(status){
        dataList[i].count = 0
      }else{
        dataList[i].count++
      }
      if(dataList[i].count >= 3 && dataList[i].state == 'ON'){
        dataList[i].state = 'OFF'
        sendMsg(`${DISCORD_USER_ID ? `<@${DISCORD_USER_ID}> `:''}Bot Client ${i} went offline...`)
      }
      if(dataList[i].count == 0 && dataList[i].state == 'OFF'){
        dataList[i].state = 'ON'
        sendMsg(`Bot Client ${i} came back online...`)
      }
      if(dataList[i].state == 'OFF') disconnectedCount++
      mqtt.publish(`${DEVICE_NAME}/client_${i}/connection/state`, dataList[i].state)
    }
    dataList.node_status.state = (disconnectedCount > 0) ? 'OFF':'ON'
    mqtt.publish(`${DEVICE_NAME}/status/connection/state`, dataList.node_status.state)
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

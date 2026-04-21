import log from './logger.js'
import mqtt from './mqtt.js'
import { dataList } from './data_list.js'
import checkClient from './check_client.js'
const DEVICE_NAME = process.env.DEVICE_NAME || 'Bot'
const NUM_CLIENTS = +(process.env.NUM_CLIENTS || 10)


const createSensors = async()=>{
  try{
    if(!NUM_CLIENTS || NUM_CLIENTS == 0) return
    let disconnectedCount = 0, device_name = DEVICE_NAME?.toLowerCase()
    dataList.node_status = { state: 'ON' }
    for(let i=0;i<NUM_CLIENTS;i++){
      dataList[i] = { state: 'ON', count: 0 }
      let connectionConfig = {
        state_topic: `${device_name}/client_${i}/connection/state`,
        unique_id: `${device_name}_client_${i}`,
        name: `Client ${i}`,
        device: {
          identifiers: [device_name],
          name: DEVICE_NAME
        },
        device_class: 'connectivity'
      }
      await mqtt.register(`homeassistant/binary_sensor/${device_name}/client_${i}/config`, connectionConfig)

      let client_status = await checkClient(`bot${i}.c3po.wtf`)
      if(!client_status){
        dataList[i].state = 'OFF'
        dataList[i].count = 3
        disconnectedCount++
      }

      mqtt.publish(`${device_name}/client_${i}/connection/state`, dataList[i].state)
    }
    let botConnectionConfig = {
      state_topic: `${device_name}/status/connection/state`,
      unique_id: `${device_name}_status`,
      name: 'Status',
      device: {
        identifiers: [device_name],
        name: DEVICE_NAME
      },
      device_class: 'connectivity'
    }
    await mqtt.register(`homeassistant/binary_sensor/${device_name}/status/config`, botConnectionConfig)
    dataList.node_status.state = (disconnectedCount > 0) ? 'OFF':'ON'
    mqtt.publish(`${device_name}/status/connection/state`, dataList.node_status.state)
    log.info(`${NUM_CLIENTS} connection sensors created...`)
    return true
  }catch(e){
    log.error(e)
  }
}
export default createSensors

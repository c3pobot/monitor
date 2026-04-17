import log from './logger.js'
import mqtt from './mqtt.js'
import { dataList } from './data_list.js'
import checkClient from './check_client.js'
const CLIENT_HOSTS = JSON.parse(process.env.CLIENT_HOSTS || "[]"), DEVICE_NAME = process.env.DEVICE_NAME || 'Bot'



const createSensors = async()=>{
  try{
    if(!CLIENT_HOSTS || CLIENT_HOSTS?.length == 0) return
    let count = 0, device_name = DEVICE_NAME?.toLowerCase()
    let state_topic = `${device_name}/connection/state`
    for(let i in CLIENT_HOSTS){
      if(!CLIENT_HOSTS[i]) continue
      let connectionConfig = {
        state_topic: `${device_name}/client_${i}/connection/state`,
        name: `Client ${i}`,
        value_template: `{{ value_json.${i} }}`,
        device: {
          identifiers: [device_name],
          name: DEVICE_NAME
        },
        host_ip: CLIENT_HOSTS[i],
        device_class: 'connectivity'
      }
      await mqtt.register(`homeassistant/binary_sensor/${device_name}_client_${i}/connection/config`, connectionConfig)
      let client_status = await checkClient(CLIENT_HOSTS[i])
      dataList[i] = (client_status ? 'ON':'OFF')
      mqtt.publish(`${device_name}/client_${i}/connection/state`, dataList[i])
      if(client_status) count++
    }
    let botConnectionConfig = {
      state_topic: `${device_name}/connection/state`,
      unique_id: device_name,
      name: 'Status',
      device: {
        identifiers: [device_name],
        name: DEVICE_NAME
      },
      device_class: 'connectivity'
    }
    await mqtt.register(`homeassistant/binary_sensor/${DEVICE_NAME?.toLowerCase()}/connection/config`, botConnectionConfig)
    dataList.node_status = (count == CLIENT_HOSTS.length) ? 'ON':'OFF'
    mqtt.publish(`${device_name}/connection/state`, dataList.node_status)
    log.info(`${CLIENT_HOSTS.length} connection sensors created...`)

    await mqtt.publish(state_topic, JSON.stringify(dataList))
    return true
  }catch(e){
    log.error(e)
  }
}
export default createSensors

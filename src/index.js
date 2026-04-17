import log from './logger.js'
import mqtt from './mqtt.js'
import './express.js'
import createSensors from './create_sensors.js'
import syncSensors from './sync_sensors.js'
import discordMsg from './discord_msg.js'
const checkMqtt = async()=>{
  try{
    let status = mqtt.status()
    if(status) status = await createSensors()
    if(status){
      syncSensors()
      discordMsg()
      return
    }
    setTimeout(checkMqtt, 5000)
  }catch(e){
    setTimeout(checkMqtt, 5000)
    log.error(e)
  }
}
checkMqtt()

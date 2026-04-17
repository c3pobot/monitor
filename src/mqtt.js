import log from './logger.js'
import mqtt from 'mqtt'

let connectMsg = false, MQTT_STATUS = false, MQTT_CLIENT
const MQTT_HOST = process.env.MQTT_HOST
const MQTT_PORT = process.env.MQTT_PORT || '1883'
const MQTT_USER = process.env.MQTT_USER || 'hassio'
const MQTT_PASS = process.env.MQTT_PASS || 'hassio'
const DEVICE_NAME = process.env.DEVICE_NAME || 'bot-client'

if(MQTT_HOST){
  const connectUrl = `mqtt://${MQTT_HOST}:${MQTT_PORT}`
  log.info(`MQTT Connect URL: ${connectUrl}`)

  MQTT_CLIENT = mqtt.connect(connectUrl, {
    clientId: `mqtt_${DEVICE_NAME}`,
    clean: true,
    keepalive: 60,
    connectTimeout: 4000,
    username: MQTT_USER,
    password: MQTT_PASS,
    reconnectPeriod: 1000,
  })
  MQTT_CLIENT.on('connect', ()=>{
    if(!connectMsg){
      connectMsg = true
      MQTT_STATUS = true
      log.info('MQTT Connection successful...')
    }
  })
}
const publish = (topic, message)=>{
  if(!MQTT_STATUS || !topic) return
  return new Promise((resolve, reject)=>{
    MQTT_CLIENT?.publish(topic, message?.toString(), { qos: 1, retain: false }, (err)=>{
      if(err){
        log.error(err)
        reject()
      }
      resolve(true)
    })
  })
}
const register = (topic, payload) =>{
  if(!MQTT_STATUS || !topic) return
  return new Promise((resolve, reject)=>{
    MQTT_CLIENT?.publish(topic, JSON.stringify(payload), { qos: 1, retain: true }, (err)=>{
      if(err){
        log.error(err)
        reject()
      }
      resolve(true)
    })
  })
}
const Cmds = {
  status: () => { return MQTT_STATUS },
  publish,
  register
}
export default Cmds

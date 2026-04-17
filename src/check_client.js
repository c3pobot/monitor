import fetch from 'node-fetch'
import log from './logger.js'
let retryCount = 3

const parseResponse = async(res)=>{
  try{
    if(!res) return
    if (res?.status?.toString().startsWith('5')) {
      throw('Bad status code '+res.status)
    }
    let body

    if (res?.status === 204) {
      body = null
    } else if (res?.headers?.get('Content-Type')?.includes('application/json')) {
      body = await res?.json()
    } else {
      body = await res?.text()
    }
    return {
      status: res?.status,
      body: body
    }
  }catch(e){
    throw(e);
  }
}
const fetchHealth = async(HOST_IP)=>{
  try{
    let res = await fetch(`http://${HOST_IP}:3001/healthz`, { signal: AbortSignal.timeout(5000), compress: true, method: 'GET' })
    return await parseResponse(res)
  }catch(e){
    if(e?.name){
      log.error(`[${HOST_IP}] ${e.name}: ${e.message}`)
      return { error: e.name, message: e.message }
    }
    if(e?.status) return await parseResponse(e)
    throw(e)
  }
}
const fetchWithRetry = async(HOST_IP, count = 0)=>{
  try{
    let res = await fetchHealth(HOST_IP)
    if(res?.error || res?.name){
      if(count < retryCount){
        count++
        return await fetchWithRetry(HOST_IP, count)
      }else{
        throw(`tried request to ${HOST_IP} ${count} time(s) and errored with ${res.error} : ${res.message}`)
      }
    }
    return res
  }catch(e){
    log.error(e)
  }
}
const checkClient = async(HOST_IP)=>{
  try{
    let res = await fetchWithRetry(HOST_IP)
    if(res?.status == 200) return true
    return false
  }catch(e){
    log.error(e)
    return false
  }
}
export default checkClient

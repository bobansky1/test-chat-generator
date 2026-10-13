export type License={plan:string;expires:number|null;remaining:number|null};
export function savedKey(){return localStorage.getItem('chat-studio-key')||'';}
export async function api(path:string,body?:unknown,key?:string){
 let response:Response;
 try{response=await fetch('/api'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(key?{Authorization:'Bearer '+key}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});}catch{throw new Error('Сервер оплаты недоступен. Попробуйте позже.');}
 const data=await response.json().catch(()=>({error:'Сервер оплаты недоступен. Попробуйте позже.'}));if(!response.ok)throw new Error(data.error||'Не удалось выполнить запрос');return data;
}
export async function activateKey(key:string):Promise<License>{const data=await api('/license',{},key);localStorage.setItem('chat-studio-key',key.trim().toUpperCase());return data;}

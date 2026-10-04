import {getStore} from "@netlify/blobs";
const PW=process.env.ADMIN_PW||"MDIM1232026";
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
export default async(req)=>{
const st=getStore("mdi"),r=new URL(req.url).pathname.replace(/^\/api\//,"").replace(/\/$/,""),ad=req.headers.get("x-pw")===PW;
const get=async(k,d)=>(await st.get(k,{type:"json"}))??d,body=async()=>{try{return await req.json()}catch{return{}}};
try{
if(r==="data"){const m=await get("main",{}),lim=new Date(Date.now()-7*864e5).toISOString().slice(0,10);
 if(m.events&&m.events.some(e=>e.d<lim)){m.events=m.events.filter(e=>e.d>=lim);await st.setJSON("main",m)}
 return J({...m,infaq:(await get("infaq",[])).map(({a,at})=>({a,at}))})}
if(r==="login")return ad?J({ok:1}):J({e:1},401);
if(r==="private")return ad?J({infaq:await get("infaq",[]),saran:await get("saran",[])}):J({},401);
if(r==="admin"){if(!ad)return J({},401);const b=await body(),m={};for(const k of["events","photos","banks","struct","serv","cc"])if(Array.isArray(b[k]))m[k]=b[k];await st.setJSON("main",m);return J({ok:1})}
if(r==="saranadmin"){if(!ad)return J({},401);const b=await body();if(!Array.isArray(b))return J({},400);await st.setJSON("saran",b);return J({ok:1})}
if(r==="photo"&&req.method==="POST"){const b=await body();if(b.kind!=="proof"&&!ad)return J({},401);
 if(typeof b.data!=="string"||!/^data:image\/(jpeg|png|webp);base64,/.test(b.data)||b.data.length>2e6)return J({},400);
 const id=crypto.randomUUID();await st.set("p-"+id,b.data);return J({id})}
if(r==="photo"){const id=new URL(req.url).searchParams.get("id")||"";if(!/^[a-f0-9-]{36}$/.test(id))return J({},400);
 const d=await st.get("p-"+id);if(!d)return J({},404);const[h,b]=d.split(",");
 return new Response(Buffer.from(b,"base64"),{headers:{"content-type":h.slice(5,h.indexOf(";")),"cache-control":"public,max-age=31536000,immutable"}})}
if(r==="infaq"){const b=await body(),a=Math.floor(+b.a);if(!(a>=1&&a<=1e10))return J({},400);
 const l=await get("infaq",[]);l.push({a,b:/^[a-f0-9-]{36}$/.test(b.b||"")?b.b:"",at:new Date().toLocaleDateString("id-ID",{timeZone:"Asia/Jakarta"})});await st.setJSON("infaq",l.slice(-1000));return J({ok:1})}
if(r==="saran"){const b=await body(),n=String(b.n||"").trim().slice(0,100),m=String(b.m||"").trim().slice(0,2000);if(!n||!m)return J({},400);
 const l=await get("saran",[]);l.push({n,m,at:new Date().toLocaleDateString("id-ID",{timeZone:"Asia/Jakarta"})});await st.setJSON("saran",l.slice(-500));return J({ok:1})}
return J({},404)}catch(e){return J({error:String(e)},500)}};
export const config={path:"/api/*"};

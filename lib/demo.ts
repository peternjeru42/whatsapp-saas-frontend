export type EventRecord = { id: string; name: string; date: string; venue: string; price: number; category: string; color: string; status: string }
export type Order = { id: string; customer: string; phone: string; event: string; tier: string; quantity: number; amount: number; status: string; fulfillment: string; date: string }
export const events: EventRecord[] = [
 { id:'EV-001',name:'Nairobi Music Festival',date:'2026-11-14',venue:'Uhuru Gardens, Nairobi',price:3500,category:'MUSIC & CULTURE',color:'festival',status:'On sale' },
 { id:'EV-002',name:'Nairobi AI Summit',date:'2026-11-20',venue:'Sarit Expo Centre, Nairobi',price:6500,category:'TECHNOLOGY',color:'summit',status:'On sale' },
 { id:'EV-003',name:'Digital Creators Expo',date:'2026-12-05',venue:'KICC, Nairobi',price:2500,category:'CREATIVE ECONOMY',color:'creators',status:'On sale' },
 { id:'EV-004',name:'East Africa Business Forum',date:'2026-12-12',venue:'Villa Rosa Kempinski',price:12000,category:'BUSINESS',color:'business',status:'On sale' },
 { id:'EV-005',name:'Tech Innovators Conference',date:'2026-12-18',venue:'iHub, Nairobi',price:4500,category:'TECHNOLOGY',color:'summit',status:'On sale' },
]
const names = ['Grace Wanjiku','Brian Otieno','Faith Achieng','James Mwangi','Sarah Njeri','David Kimani','Mercy Wambui','Kevin Mutua']
export const orders: Order[] = Array.from({length:84},(_,i)=> {const event=events[i%5]; const status=i%17===0?'Failed':i%13===0?'Pending':'Paid'; return {id:`ORD-${10482-i}`,customer:names[i%8],phone:`+254 7•• ••• ${String(210+i)}`,event:event.name,tier:i%3===0?'VIP':'Regular',quantity: i%4+1,amount:event.price*(i%4+1),status,fulfillment:status==='Paid'?'Delivered':'Awaiting payment',date:`2026-10-${String(29-Math.floor(i/3)).padStart(2,'0')}T${String(9+i%10).padStart(2,'0')}:24:00`}})
export const money=(n:number)=>new Intl.NumberFormat('en-KE',{maximumFractionDigits:0}).format(n)
export const paid=orders.filter(o=>o.status==='Paid')
export const total=paid.reduce((s,o)=>s+o.amount,0)
export const tickets=paid.reduce((s,o)=>s+o.quantity,0)
export function exportCSV(rows: Record<string,unknown>[], name:string) {if(!rows.length)return;const keys=Object.keys(rows[0]);const csv=[keys.join(','),...rows.map(row=>keys.map(k=>'"'+String(row[k]??'').replaceAll('"','""')+'"').join(','))].join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click();URL.revokeObjectURL(url)}
export interface PageResult<T> { results:T[]; count:number; next:string|null }
export class ApiError extends Error { constructor(message:string,public status:number){super(message)} }
export async function apiRequest<T>(path:string,init?:RequestInit):Promise<T>{const base=process.env.NEXT_PUBLIC_API_BASE_URL;if(!base)throw new ApiError('Django API is not configured. This workspace uses demonstration data.',503);const response=await fetch(`${base.replace(/\/$/,'')}/${path.replace(/^\//,'')}`,{...init,credentials:'include',headers:{'Content-Type':'application/json',...init?.headers}});if(!response.ok)throw new ApiError(response.status===401?'Please sign in again.':'The request could not be completed.',response.status);return response.json()}
export const demoService={orders:async()=>({results:orders,count:orders.length,next:null}),events:async()=>({results:events,count:events.length,next:null})}
export type Tenant = { id: string; name: string; status: 'Active' | 'Suspended'; plan: string; whatsappStatus: string }
export type Payment = { id: string; orderId: string; amount: number; phone: string; merchant: string; provider: string; status: string; date: string }
export type Ticket = { id: string; orderId: string; event: string; customer: string; tier: string; status: string; delivery: string; issuedAt: string }
export type Customer = { id: string; name: string; phone: string; orders: number; tickets: number; amount: number; lastActivity: string }
export type ApiKey = { id: string; name: string; prefix: string; permissions: string[]; status: string; createdAt: string; lastUsedAt: string | null }
export type ApiDomain = {
  auth: { me: () => Promise<{ id: string; role: string; tenantId: string }> }
  tenants: { list: () => Promise<PageResult<Tenant>>; get: (id: string) => Promise<Tenant> }
  subscriptions: { current: () => Promise<{ plan: string; status: string; renewalDate: string }> }
  whatsapp: { status: () => Promise<{ status: string; businessAccountId: string; phoneNumberId: string }> }
  integrations: { list: () => Promise<PageResult<{ name: string; status: string; lastChecked: string }>>; sync: () => Promise<{ synced: number }> }
  events: { list: () => Promise<PageResult<EventRecord>> }
  orders: { list: () => Promise<PageResult<Order>>; get: (id: string) => Promise<Order> }
  customers: { list: () => Promise<PageResult<Customer>> }
  payments: { list: () => Promise<PageResult<Payment>> }
  tickets: { list: () => Promise<PageResult<Ticket>> }
  analytics: { overview: () => Promise<{ sales: number; tickets: number; successRate: number }> }
  apiKeys: { list: () => Promise<PageResult<ApiKey>> }
  auditLogs: { list: () => Promise<PageResult<{ id: string; action: string; actor: string; createdAt: string }>> }
  support: { create: (payload: { subject: string; message: string }) => Promise<{ id: string; status: string }> }
}
const endpoint = <T>(path: string, init?: RequestInit) => apiRequest<T>(path, init)
export const api: ApiDomain = {
  auth: { me: () => endpoint('auth/me/') },
  tenants: { list: () => endpoint('tenants/'), get: id => endpoint(`tenants/${encodeURIComponent(id)}/`) },
  subscriptions: { current: () => endpoint('subscriptions/current/') },
  whatsapp: { status: () => endpoint('whatsapp/status/') },
  integrations: { list: () => endpoint('integrations/'), sync: () => endpoint('integrations/sync/', { method: 'POST' }) },
  events: { list: () => endpoint('events/') },
  orders: { list: () => endpoint('orders/'), get: id => endpoint(`orders/${encodeURIComponent(id)}/`) },
  customers: { list: () => endpoint('customers/') },
  payments: { list: () => endpoint('payments/') },
  tickets: { list: () => endpoint('tickets/') },
  analytics: { overview: () => endpoint('analytics/overview/') },
  apiKeys: { list: () => endpoint('api-keys/') },
  auditLogs: { list: () => endpoint('audit-logs/') },
  support: { create: payload => endpoint('support/cases/', { method: 'POST', body: JSON.stringify(payload) }) },
}

'use client'
import {useEffect, useMemo, useRef, useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {ArrowLeft,ArrowRight,Check,CheckCircle2,LockKeyhole,MessageCircle,ShieldCheck} from 'lucide-react'
import {toast} from 'sonner'
import {Brand} from '@/components/workspace'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {useAuth} from '@/lib/auth'

const createAuthSchema=(registerMode:boolean)=>z.object({
  email:z.email('Please enter a valid email address.'),
  password:z.string().min(8,'Use at least 8 characters.'),
  confirmPassword:z.string().optional(),
}).superRefine((values,context)=>{
  if(!registerMode)return
  if(!values.confirmPassword){
    context.addIssue({code:'custom',path:['confirmPassword'],message:'Please confirm your password.'})
  }else if(values.password!==values.confirmPassword){
    context.addIssue({code:'custom',path:['confirmPassword'],message:'Passwords do not match.'})
  }
})
type AuthValues=z.infer<ReturnType<typeof createAuthSchema>>

export function AuthScreen({mode}:{mode:string}){
  const registerMode=mode==='register'
  const supported=mode==='login'||registerMode
  const router=useRouter()
  const {user,loading,signIn,signUp}=useAuth()
  const [serverError,setServerError]=useState('')
  const signupInProgress=useRef(false)
  const authSchema=useMemo(()=>createAuthSchema(registerMode),[registerMode])
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<AuthValues>({resolver:zodResolver(authSchema),defaultValues:{email:'',password:'',confirmPassword:''}})

  useEffect(()=>{if(!loading&&user&&!signupInProgress.current)router.replace('/dashboard')},[loading,router,user])

  const submit=async(values:AuthValues)=>{
    setServerError('')
    try{
      if(registerMode){
        signupInProgress.current=true
        await signUp(values.email,values.password,values.confirmPassword||'')
        toast.success('Your account is ready.')
        router.replace('/onboarding')
      }else{
        await signIn(values.email,values.password)
        toast.success('Welcome back.')
        const requested=new URLSearchParams(window.location.search).get('next')
        const destination=requested?.startsWith('/')&&!requested.startsWith('//')?requested:'/dashboard'
        router.replace(destination)
      }
      router.refresh()
    }catch(error){
      signupInProgress.current=false
      setServerError(error instanceof Error?error.message:'Unable to authenticate. Please try again.')
    }
  }

  return <main className="auth-page"><section className="auth-story"><Link href="/home"><Brand/></Link><div><span className="eyebrow">BUILT FOR THE NEXT GREAT EXPERIENCE</span><h1>Less friction.<br/>More conversations.<br/><em>More ticket sales.</em></h1><p>Your events, your customers, and your payments. Connected through WhatsApp.</p><div className="auth-feature"><ShieldCheck size={19}/> Secure, tenant-isolated infrastructure</div><div className="auth-feature"><MessageCircle size={19}/> Built for the way your customers connect</div></div><small>Ticketflow · WhatsApp Ticketing Gateway</small></section><section className="auth-form-side"><Link href="/home" className="back-link"><ArrowLeft size={15}/>Back to website</Link><div className="auth-form"><span className="section-icon"><LockKeyhole size={25}/></span><h2>{registerMode?'Create your account.':supported?'Welcome back.':'Coming soon'}</h2><p>{registerMode?'Sign up with your email and choose a secure password.':supported?'Access your company’s ticketing workspace.':'This account recovery flow is not available yet.'}</p>{supported?<form className="stack-form" onSubmit={handleSubmit(submit)} noValidate><label>Email address<Input type="email" placeholder="you@company.com" autoComplete="email" {...register('email')} aria-invalid={!!errors.email}/>{errors.email&&<span className="field-error">{errors.email.message}</span>}</label><label>Password<Input type="password" placeholder="At least 8 characters" autoComplete={registerMode?'new-password':'current-password'} {...register('password')} aria-invalid={!!errors.password}/>{errors.password&&<span className="field-error">{errors.password.message}</span>}</label>{registerMode&&<label>Confirm password<Input type="password" placeholder="Enter your password again" autoComplete="new-password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword}/>{errors.confirmPassword&&<span className="field-error">{errors.confirmPassword.message}</span>}</label>}{serverError&&<div className="auth-error" role="alert">{serverError}</div>}{mode==='login'&&<Link className="text-link" href="/forgot-password">Forgot password?</Link>}<Button type="submit" disabled={isSubmitting||loading}>{isSubmitting?(registerMode?'Creating account…':'Signing in…'):(registerMode?'Create account':'Sign in')}<ArrowRight/></Button></form>:<div className="auth-notice"><CheckCircle2 size={23}/><h3>Account recovery</h3><p>Please contact your workspace administrator while password recovery is being prepared.</p><Link href="/login" className="primary-link">Return to sign in <ArrowRight size={16}/></Link></div>}<p className="auth-switch">{registerMode?'Already have an account?':'New to Ticketflow?'} <Link href={registerMode?'/login':'/register'}>{registerMode?'Log in':'Create an account'}</Link></p><div className="secure-auth-note"><ShieldCheck size={14}/>Passwords are securely hashed and sessions use protected, HTTP-only cookies.</div></div></section></main>
}
const steps=['Company information','Subscription','Ticketing API','WhatsApp Business','M-Pesa payments','Review & activation']
export function Onboarding(){const [step,setStep]=useState(0);const [completed,setCompleted]=useState<number[]>([]);const [values,setValues]=useState<Record<string,string>>({});const save=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=new FormData(e.currentTarget);const update=Object.fromEntries(f.entries()) as Record<string,string>;delete update.credential;setValues({...values,...update});setCompleted([...new Set([...completed,step])]);setStep(Math.min(5,step+1));toast.success('Demo step saved. No live connection was established.')};return <main className="onboarding-page"><header><Link href="/home"><Brand/></Link><Link className="text-link" href="/dashboard">Explore dashboard instead <ArrowRight size={14}/></Link></header><div className="onboarding-layout"><aside><span className="eyebrow">LET’S GET YOU CONNECTED</span><h1>Your next chapter<br/>starts here.</h1><p>Six steps to bring your ticketing platform to WhatsApp.</p><nav>{steps.map((s,i)=><button className={step===i?'selected':''} key={s} onClick={()=>setStep(i)}><span>{completed.includes(i)?<Check size={15}/>:i+1}</span><div><strong>{s}</strong><small>{completed.includes(i)?'Demo configuration saved':step===i?'In progress':'Not completed'}</small></div></button>)}</nav><div className="demo-auth-note">Demo setup only. Credentials are not retained, and live activation stays disabled until the backend verifies all checks.</div></aside><section className="panel onboarding-form"><span className="eyebrow">STEP {step+1} OF 6</span><h2>{steps[step]}</h2><p className="muted">{['Tell us a little about your ticketing business.','Choose an illustrative plan for your workspace.','Connect your source of events, inventory, and tickets.','Use Meta’s authorized onboarding to connect your business.','Your customers pay directly into your merchant account.','Make sure every part of your customer journey is ready.'][step]}</p><form key={step} className="stack-form" onSubmit={save}>{step===0?<>{['Company name','Business email','Contact phone','Website URL','Business description'].map(n=><label key={n}>{n}<Input name={n} required defaultValue={values[n]} type={n==='Business email'?'email':n==='Website URL'?'url':'text'}/></label>)}<div className="form-columns"><label>Country<select name="Country"><option>Kenya</option><option>Uganda</option><option>Tanzania</option></select></label><label>Currency<select name="Currency"><option>KES</option><option>UGX</option><option>TZS</option></select></label></div></>:step===1?<><label>Demo plan<select name="Plan" defaultValue={values.Plan||'Growth'}><option>Starter</option><option>Growth</option><option>Enterprise</option></select></label><label>Billing cycle<select name="Cycle"><option>Monthly</option><option>Yearly</option></select></label><p className="muted">Example allowances are configurable. No subscription or billing charge will be created.</p></>:step===2?<><label>Integration name<Input name="Integration" required defaultValue={values.Integration}/></label><label>API base URL<Input name="Endpoint" type="url" required defaultValue={values.Endpoint} placeholder="https://api.example.com/v1"/></label><label>Authentication type<select name="Authentication"><option>API key</option><option>Bearer token</option></select></label><label>Demo credential<Input name="credential" type="password" autoComplete="off" placeholder="Do not enter a real secret"/></label><Button type="button" variant="outline" onClick={()=>toast.info('Demo connection check only. Django will test the real endpoint.')}>Preview connection test</Button></>:step===3?<><div className="integration-large-icon"><MessageCircle size={27}/></div><StatusBox/><p className="muted">Meta Embedded Signup will authorize your WhatsApp Business Account. Entering a number cannot establish a connection.</p><Button type="button" variant="outline" onClick={()=>toast.info('Meta Embedded Signup requires the backend integration. Authorization remains pending.')}>Connect WhatsApp Business</Button><label>Display phone number (preview only)<Input name="Phone" type="tel" defaultValue={values.Phone} placeholder="+254 712 345 678"/></label></>:step===4?<><label>Payment integration mode<select name="Payment mode"><option>Direct Safaricom Daraja</option><option>Tenant-managed payment API</option></select></label><label>Merchant shortcode<Input name="Merchant" required pattern="[0-9]{5,8}" defaultValue={values.Merchant} placeholder="123456"/></label><label>Environment<select name="Environment"><option>Sandbox</option></select></label><label>Demo credential<Input type="password" name="credential" autoComplete="off"/></label><p className="muted">Payment credentials must be securely submitted to Django. They are discarded from this demo form.</p></>:<><div className="activation-list">{['Company profile configured','Plan selected','Ticketing API authorized','Events synchronized','WhatsApp authorized','Payment merchant verified','Test order confirmed','Ticket issued by provider'].map((s,i)=><div key={s}><span className={i<2&&completed.includes(i)?'positive':'muted'}>{i<2&&completed.includes(i)?<CheckCircle2 size={19}/>:<LockKeyhole size={17}/>}</span>{s}<small>{i<2&&completed.includes(i)?'Demo ready':'Backend verification required'}</small></div>)}</div><Button disabled>Activate platform</Button><p className="muted">Live activation is locked until all required checks are verified by your backend.</p><Link className="primary-link" href="/dashboard">Explore the demo dashboard <ArrowRight size={16}/></Link></>}{step<5&&<div className="onboarding-actions">{step>0&&<Button type="button" variant="outline" onClick={()=>setStep(step-1)}>Back</Button>}<Button type="submit">Save demo step & continue <ArrowRight/></Button></div>}</form></section></div></main>}
function StatusBox(){return <div className="connection-banner">Pending authorization · Not connected to Meta</div>}

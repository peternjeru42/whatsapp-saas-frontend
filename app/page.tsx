import {Workspace} from '@/components/workspace'
import {Overview} from '@/components/overview'
import {RequireAuth} from '@/lib/auth'
export default function Page(){return <RequireAuth><Workspace><Overview/></Workspace></RequireAuth>}

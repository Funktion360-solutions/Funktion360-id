import {AuthForm} from '../auth-form';
export default async function Page({searchParams}:{searchParams:Promise<{notice?:string,authorization_id?:string}>}){const params=await searchParams;return <AuthForm register={false} notice={params.notice} authorization={params.authorization_id}/>}

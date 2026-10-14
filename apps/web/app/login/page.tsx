import {AuthForm} from '../auth-form';
export default async function Page({searchParams}:{searchParams:Promise<{notice?:string}>}){return <AuthForm register={false} notice={(await searchParams).notice}/>}

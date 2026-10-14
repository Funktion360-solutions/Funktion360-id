import {AuthForm} from '../auth-form';
export default async function Page({searchParams}:{searchParams:Promise<{notice?:string}>}){return <AuthForm register={true} notice={(await searchParams).notice}/>}

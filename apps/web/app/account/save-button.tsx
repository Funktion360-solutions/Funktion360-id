'use client';
import {useFormStatus} from 'react-dom';
export function SaveButton(){const {pending}=useFormStatus();return <button disabled={pending} aria-busy={pending}>{pending?'Gemmer din profil…':'Gem profil'}</button>;}

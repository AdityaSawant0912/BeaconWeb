import { redirect } from "next/navigation";


export default function LoginButton() {



    return (
        <button onClick={()=>{redirect('/login')}}>Login</button>
    )
}
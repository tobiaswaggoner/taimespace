
import Chat from "@/app/components/Chat";
import { getSession } from "@auth0/nextjs-auth0";


export default async function ChatPage() {
    const session = await getSession();
    const user: string = session?.user?.name;
    return (
        <div className="flex flex-row">
            <div style={{ width: '400px', minWidth: '50px' }} className="ml-1 overflow-hidden h-screen border border-black">
                <Chat user={user} />
            </div>
            <div className="flex-1 overflow-auto h-screen border border-black">
                Dies ist nur ein erster Test! {(user)}
            </div>
        </div>
    );
}
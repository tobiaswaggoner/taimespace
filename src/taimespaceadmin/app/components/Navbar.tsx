import Tooltip from "./Tooltip";
import { getSession } from '@auth0/nextjs-auth0';

const Navbar = async () => {
    const session = await getSession();
    const user = session?.user;
    return (
        <nav className="h-full w-16 flex flex-col justify-between bg-gray-800 text-white fixed">
            <div>
                <a href="/">
                    <Tooltip content="Startseite">
                        <div className="m-2">🏠</div>
                    </Tooltip>
                </a>
                {user && (
                    <>
                        <a href="/chat">
                            <Tooltip content="Chat">
                                <div className="m-2">💬</div>
                            </Tooltip>
                        </a>
                    </>
                )}
            </div>
            {user && (

                <div className="mt-auto">
                    {/* Show login / logout at the very bottom */}
                    <a className="flex-end" href="/api/auth/logout">
                        <Tooltip content="Logout">
                            <div className="m-2">🚪</div>
                        </Tooltip>
                    </a>
                </div>
            )}

        </nav>
    );
};
export default Navbar;
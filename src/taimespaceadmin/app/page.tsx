import { getSession } from '@auth0/nextjs-auth0';

export default async function Home() {
  const session = await getSession();
  const user = session?.user;
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-5xl font-bold">🏠 Willkommen bei T<span className="text-red-500">AI</span>meSpace</h1>
      <p className="text-2xl">
        Der interaktive Tutor aus dem digitalen Herzen Thüringens!
      </p>
      <p>
        {(user?.name)} 
      </p>
    </main>
  );
}

import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-5xl font-bold">🏠Welcome to <span className="text-red-500">AI</span>ccountant</h1>
      <p className="text-2xl">
        A fully automated accounting system for small businesses.
      </p>
    </main>
  );
}

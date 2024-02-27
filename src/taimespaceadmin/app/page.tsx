import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-5xl font-bold">🏠 Willkommen bei T<span className="text-red-500">AI</span>meSpace</h1>
      <p className="text-2xl">
        Der interaktive Tutor aus dem digitalen Herzen Thüringens!
      </p>
    </main>
  );
}

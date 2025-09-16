import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Vite + React + Tailwind</h1>

      <button
        onClick={() => setCount((count) => count + 1)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        Count is {count}
      </button>
      <div className="bg-blue-500 text-red p-4">Hello Tailwind!</div>
      <p className="mt-4 text-gray-600">
        Edit <code className="bg-gray-200 px-1 rounded">src/App.tsx</code> and save to test HMR
      </p>
    </div>
  );
}

export default App;

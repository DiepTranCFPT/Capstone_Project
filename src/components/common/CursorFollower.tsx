import { useState, useEffect } from 'react';

const CursorFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-50"
      style={{
        transform: `translate(${mousePosition.x - 5}px, ${mousePosition.y - 5}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <div className="w-2 h-2 bg-teal-500 rounded-full "></div>
    </div>
  );
};

export default CursorFollower;


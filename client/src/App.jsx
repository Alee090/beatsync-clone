import { useEffect, useRef, useState } from 'react';
const socket = new WebSocket(import.meta.env.VITE_WS_URL);

export default function App() {
  const [room, setRoom] = useState('');
  const [connected, setConnected] = useState(false);
  const audioRef = useRef();

  useEffect(() => {
    socket.onmessage = (e) => {
      const { type, payload } = JSON.parse(e.data);
      if (type === 'sync') {
        const audio = audioRef.current;
        const diff = Math.abs(audio.currentTime - payload.currentTime);
        if (diff > 0.1) {
          audio.currentTime = payload.currentTime;
          if (payload.paused) audio.pause();
          else audio.play();
        }
      }
    };
  }, []);

  const joinRoom = () => {
    socket.send(JSON.stringify({ type: 'join', room }));
    setConnected(true);
  };

  const broadcastSync = () => {
    const audio = audioRef.current;
    socket.send(JSON.stringify({
      type: 'sync',
      room,
      payload: {
        currentTime: audio.currentTime,
        paused: audio.paused
      }
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">BeatSync Clone</h1>
      {!connected ? (
        <div className="flex gap-2">
          <input type="text" className="p-2 text-black" placeholder="Enter room ID" onChange={(e) => setRoom(e.target.value)} />
          <button className="bg-blue-600 p-2 rounded" onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <div className="w-full max-w-md text-center">
          <audio ref={audioRef} controls className="w-full mb-2" onPlay={broadcastSync} onPause={broadcastSync} onSeeked={broadcastSync} />
          <p>Room: {room}</p>
        </div>
      )}
    </div>
  );
}

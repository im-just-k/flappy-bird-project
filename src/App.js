import React, { useEffect, useRef, useState } from 'react';
import { io } from "socket.io-client";
import './App.css';

const socket = io("http://localhost:3001");

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const GRAVITY = 0.6;
const JUMP = -10;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;

function App() {
  const canvasRef = useRef(null);
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    socket.on('flap', handleFlap);
    return () => socket.off('flap', handleFlap);
  }, []);

  const handleFlap = () => {
    setVelocity(JUMP);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') handleFlap();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    const reset = () => {
      setBirdY(GAME_HEIGHT / 2);
      setVelocity(0);
      setPipes([{ x: GAME_WIDTH, top: Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) }]);
      setScore(0);
      setGameOver(false);
    };

    const loop = () => {
      if(gameOver) return;

      setVelocity(v => v + GRAVITY);
      setBirdY(y => {
        const newY = y + velocity;
        if (newY > GAME_HEIGHT || newY < 0) {
          setGameOver(true);
          return y;
        }
        return newY;
      });

      setPipes(prev => {
        let newPipes = prev.map(p => ({ ...p, x: p.x - PIPE_SPEED }));
        if (newPipes[newPipes.length -1].x < GAME_WIDTH - 200) {
          newPipes.push({ x: GAME_WIDTH, top: Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) });
        }
        newPipes = newPipes.filter(p => p.x + PIPE_WIDTH > 0);
        return newPipes;
      });

      pipes.forEach(p => {
        if (p.x < 50 && p.x + PIPE_WIDTH > 0) {
          if (birdY < p.top || birdY > p.top + PIPE_GAP) {
            setGameOver(true);
          } else {
            setScore(s => s + 0.01);
          }
        }
      });

      draw(ctx);
      requestAnimationFrame(loop);
    };

    const draw = (ctx) => {
      ctx.fillStyle = '#70c5ce';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = 'yellow';
      ctx.fillRect(50, birdY, 30, 30);

      ctx.fillStyle = 'green';
      pipes.forEach(p => {
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
        ctx.fillRect(p.x, p.top + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - p.top - PIPE_GAP);
      });

      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText("Score: " + Math.floor(score), 10, 30);

      if(gameOver){
        ctx.fillStyle = 'red';
        ctx.font = '48px Arial';
        ctx.fillText("GAME OVER", 50, GAME_HEIGHT/2);
      }
    };

    reset();
    requestAnimationFrame(loop);
  }, [velocity, birdY, pipes, score, gameOver]);

  return (
    <div className="App">
      <h1>Flappy Bird ESP32</h1>
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} />
    </div>
  );
}

export default App;
import React, { useState, useEffect, useRef } from "react";
import chickenImg from "./assets/chickenSprite.png";

const GAME_HEIGHT = 500;
const GAME_WIDTH = 400;

const GRAVITY = 0.5;
const JUMP_FORCE = -8;

const PIPE_WIDTH = 60;
const PIPE_GAP = 150;

const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 40;

function App() {
  const [birdY, setBirdY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [pipeX, setPipeX] = useState(GAME_WIDTH);
  const [pipeHeight, setPipeHeight] = useState(200);
  const [gameOver, setGameOver] = useState(false);

  const [timeSurvived, setTimeSurvived] = useState(0);
  const startTimeRef = useRef(null);

  // Main game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setVelocity((v) => v + GRAVITY);
      setBirdY((y) => y + velocity);

      setPipeX((x) => {
        if (x < -PIPE_WIDTH) {
          setPipeHeight(Math.floor(Math.random() * 250) + 50);
          return GAME_WIDTH;
        }
        return x - 3;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [gameStarted, velocity, gameOver]);

  // Timer logic (separate from physics loop)
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    startTimeRef.current = Date.now();

    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setTimeSurvived(elapsed);
    }, 100); // updates 10x per second

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // Collision detection
  useEffect(() => {
    const hitTop = birdY <= 0;
    const hitBottom = birdY + BIRD_HEIGHT >= GAME_HEIGHT;

    const hitPipe =
      pipeX < 50 + BIRD_WIDTH &&
      pipeX + PIPE_WIDTH > 50 &&
      (birdY < pipeHeight || birdY + BIRD_HEIGHT > pipeHeight + PIPE_GAP);

    if (hitTop || hitBottom || hitPipe) {
      setGameOver(true);
      setGameStarted(false);
    }
  }, [birdY, pipeX, pipeHeight]);

  // Spacebar control
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code !== "Space") return;

      if (gameOver) {
        setBirdY(250);
        setVelocity(0);
        setPipeX(GAME_WIDTH);
        setTimeSurvived(0);
        setGameOver(false);
        return;
      }

      if (!gameStarted) {
        setGameStarted(true);
      }

      setVelocity(JUMP_FORCE);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameStarted, gameOver]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#70c5ce",
      }}
    >
      <div
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          position: "relative",
          overflow: "hidden",
          border: "4px solid black",
          backgroundColor: "skyblue",
        }}
      >
        {/* Live Timer */}
        {gameStarted && !gameOver && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              color: "white",
              fontWeight: "bold",
              fontSize: "20px",
              textShadow: "2px 2px 4px black",
              zIndex: 10,
            }}
          >
            Time: {timeSurvived.toFixed(1)}s
          </div>
        )}

        {!gameStarted && !gameOver && (
          <div
            style={{
              position: "absolute",
              top: 20,
              width: "100%",
              textAlign: "center",
              zIndex: 5,
            }}
          >
            <h2 style={{ margin: 0 }}>Press Space to Start</h2>
          </div>
        )}

        <img
          src={chickenImg}
          alt="chicken"
          style={{
            position: "absolute",
            left: 50,
            top: birdY - 10,
            width: 60,
            height: 60,
            zIndex: 2,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {/* Top Pipe */}
        <div
          style={{
            position: "absolute",
            left: pipeX,
            top: 0,
            width: PIPE_WIDTH,
            height: pipeHeight,
            backgroundColor: "green",
          }}
        />

        {/* Bottom Pipe */}
        <div
          style={{
            position: "absolute",
            left: pipeX,
            top: pipeHeight + PIPE_GAP,
            width: PIPE_WIDTH,
            height: GAME_HEIGHT,
            backgroundColor: "green",
          }}
        />

        {/* Game Over */}
        {gameOver && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 100,
              color: "white",
              fontFamily: "'Arial Black', Arial, sans-serif",
              textAlign: "center",
              textShadow: "2px 2px 4px black",
            }}
          >
            <div style={{ fontSize: "40px", fontWeight: 900 }}>
              Game Over
            </div>

            <div style={{ fontSize: "18px", marginTop: 10 }}>
              Time Survived: {timeSurvived.toFixed(1)} seconds
            </div>

            <div style={{ marginTop: 15 }}>
              Press Space to Restart
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
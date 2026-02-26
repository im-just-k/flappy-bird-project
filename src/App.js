import React, { useState, useEffect } from "react";
import chickenImg from "./assets/chickenSprite.png";

const GAME_HEIGHT = 500;
const GAME_WIDTH = 400;

const GRAVITY = 0.5;
const JUMP_FORCE = -8;

const PIPE_WIDTH = 60;
const PIPE_GAP = 150;

// Invisible hitbox for collision detection
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 40;

function App() {
  const [birdY, setBirdY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [pipeX, setPipeX] = useState(GAME_WIDTH);
  const [pipeHeight, setPipeHeight] = useState(200);
  const [gameOver, setGameOver] = useState(false);

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

  // Collision detection using invisible hitbox
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
        // Reset game
        setBirdY(250);
        setVelocity(0);
        setPipeX(GAME_WIDTH);
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
        {/* Start Message */}
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

        {/* Chicken sprite */}
        <img
          src={chickenImg}
          alt="chicken"
          style={{
            position: "absolute",
            left: 50,
            top: birdY - 10, // adjust to center over hitbox
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
            zIndex: 1,
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
            zIndex: 1,
          }}
        />

        {/* Game Over Overlay */}
        {gameOver && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 100,
            }}
          >
            <span
              style={{
                color: "white",
                fontFamily: "'Arial Black', Arial, sans-serif",
                fontSize: "40px",
                fontWeight: 900,
                textAlign: "center",
                lineHeight: 1.2,
                textShadow: "2px 2px 4px black",
              }}
            >
              Game Over - Press Space to Restart
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
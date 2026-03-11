import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import chickenImg from "./assets/chickenSprite.png";
import flinchImg from "./assets/flinchingChickenSprite.png";
import "bootstrap/dist/css/bootstrap.min.css";

const GAME_HEIGHT = 500;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 140;
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 40;
const PIPE_SPACING = 300;

function App() {
  const [gameWidth, setGameWidth] = useState(window.innerWidth);
  const [birdY, setBirdY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [pipes, setPipes] = useState([{ x: window.innerWidth - PIPE_SPACING, height: 200 }]);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [flapAnim, setFlapAnim] = useState(false);
  const [flinching, setFlinching] = useState(false);

  const musicRef = useRef(null);
  const countdownBeepRef = useRef(null);
  const gameStartRef = useRef(null);
  const hitRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setGameWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    musicRef.current = new Audio("/flight_theme.mp3");
    musicRef.current.loop = true;
    countdownBeepRef.current = new Audio("/countdown_beep.mp3");
    gameStartRef.current = new Audio("/game_start_effect.mp3");
    hitRef.current = new Audio("/pipe_collision_effect.mp3");
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver && countdown === null) {
      musicRef.current.play().catch(() => {});
    } else if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, [gameStarted, gameOver, countdown]);

  useEffect(() => {
    if (!gameStarted || gameOver || countdown !== null) return;

    const interval = setInterval(() => {
      setVelocity(v => v + GRAVITY);
      setBirdY(y => y + velocity);

      setPipes(prev => {
        const moved = prev.map(pipe => ({ ...pipe, x: pipe.x - 3 }));
        const filtered = moved.filter(pipe => pipe.x + PIPE_WIDTH > 0);
        const lastPipeX = filtered.length ? filtered[filtered.length - 1].x : 0;

        if (lastPipeX < gameWidth - PIPE_SPACING) {
          filtered.push({
            x: lastPipeX + PIPE_SPACING,
            height: Math.floor(Math.random() * 250) + 50,
          });
        }
        return filtered;
      });

      setTime(t => t + 0.02);
    }, 20);

    return () => clearInterval(interval);
  }, [gameStarted, velocity, gameOver, gameWidth, countdown]);

  useEffect(() => {
    const hitTop = birdY <= 0;
    const hitBottom = birdY + BIRD_HEIGHT >= GAME_HEIGHT;

    const hitPipe = pipes.some(
      pipe =>
        pipe.x < 50 + BIRD_WIDTH &&
        pipe.x + PIPE_WIDTH > 50 &&
        (birdY < pipe.height || birdY + BIRD_HEIGHT > pipe.height + PIPE_GAP)
    );

    if (hitTop || hitBottom || hitPipe) {
      if (hitPipe) {
        setFlinching(true);
        hitRef.current.currentTime = 0;
        hitRef.current.play().catch(() => {});
      }
      setGameOver(true);
      setGameStarted(false);
    } else {
      setFlinching(false);
    }
  }, [birdY, pipes]);

  useEffect(() => {
    const handleKey = e => {
      if (e.code !== "Space") return;
      if (!gameStarted || gameOver || countdown !== null) return;

      setVelocity(JUMP_FORCE);

      setFlapAnim(true);
      setTimeout(() => setFlapAnim(false), 120);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameStarted, gameOver, countdown]);

  const startCountdown = () => {
    setCountdown(3);
    setVelocity(0);
    setBirdY(250);
    setPipes([{ x: gameWidth - PIPE_SPACING, height: Math.floor(Math.random() * 250) + 50 }]);
    setTime(0);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;

        countdownBeepRef.current.currentTime = 0;
        countdownBeepRef.current.play().catch(() => {});

        if (prev === 1) {
          clearInterval(interval);
          setCountdown(null);
          setGameStarted(true);
          gameStartRef.current.currentTime = 0;
          gameStartRef.current.play().catch(() => {});
          return null;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const resetGame = () => {
    setGameOver(false);
    startCountdown();
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(to bottom, #0d1b2a, #1b263b)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: gameWidth,
          height: GAME_HEIGHT,
          position: "relative",
          backgroundColor: "skyblue",
          border: "4px solid #444",
          borderRadius: "10px",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* Time survived */}
        {!gameOver && gameStarted && countdown === null && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              color: "white",
              fontWeight: "bold",
              fontSize: "22px",
              textShadow: "1px 1px 2px black",
              zIndex: 10,
            }}
          >
            Time Survived: {Math.floor(time)}s
          </div>
        )}

        {/* Countdown */}
        {countdown !== null && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              width: "100%",
              textAlign: "center",
              zIndex: 50,
              color: "white",
              fontSize: "72px",
              fontWeight: "bold",
              textShadow: "2px 2px 6px black",
            }}
          >
            {countdown}
          </div>
        )}

        {/* Start button */}
        {!gameStarted && !gameOver && countdown === null && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              width: "100%",
              textAlign: "center",
            }}
          >
            <Button
              variant="light"
              onClick={startCountdown}
              style={{
                fontFamily: "'Arial Black', Arial, sans-serif",
                fontWeight: 900,
                borderRadius: "16px",
                padding: "20px 40px",
                textShadow: "1px 1px 2px black",
                fontSize: "36px",
                transition: "transform 0.1s ease-in-out",
              }}
            >
              Start Game
            </Button>
          </div>
        )}

        {/* Chicken sprite */}
        <img
          src={flinching ? flinchImg : chickenImg}
          alt="chicken"
          style={{
            position: "absolute",
            left: 50,
            top: birdY - 10,
            width: 60,
            height: 60,
            zIndex: 5,
            userSelect: "none",
            pointerEvents: "none",
            transform: flapAnim ? "scaleX(1.2) scaleY(0.8)" : "scaleX(1) scaleY(1)",
            transition: "transform 0.12s ease-out",
          }}
        />

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            <div
              style={{
                position: "absolute",
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.height,
                backgroundColor: "green",
                borderRadius: "5px",
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: pipe.x,
                top: pipe.height + PIPE_GAP,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT,
                backgroundColor: "green",
                borderRadius: "5px",
                zIndex: 4,
              }}
            />
          </React.Fragment>
        ))}

        {/* Game Over dialog */}
        {gameOver && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: "400px",
                maxWidth: "90%",
                padding: "30px",
                backgroundColor: "rgba(0,0,0,0.8)",
                borderRadius: "20px",
                textAlign: "center",
                color: "white",
                fontFamily: "'Arial Black', Arial, sans-serif",
                animation: "fadeBounce 0.5s ease-out",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>Game Over</div>
              <div style={{ fontSize: "28px", marginBottom: "30px" }}>
                Time Survived: {Math.floor(time)}s
              </div>
              <Button
                variant="light"
                onClick={resetGame}
                style={{
                  fontFamily: "'Arial Black', Arial, sans-serif",
                  fontWeight: 900,
                  borderRadius: "16px",
                  padding: "15px 30px",
                  fontSize: "28px",
                  textShadow: "1px 1px 2px black",
                  transition: "transform 0.1s ease-in-out",
                }}
              >
                Restart
              </Button>
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes fadeBounce {
              0% { opacity: 0; transform: scale(0.8) translateY(-20px); }
              60% { opacity: 1; transform: scale(1.05) translateY(10px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }

            button:active {
              transform: scale(0.95);
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default App;
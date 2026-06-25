import { useState, useEffect } from "react";
import "./App.css";
import ColorBox from "./components/ColorBox";

function App() {
  const [colors, setColors] = useState([]);
  const [targetColor, setTargetColor] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);

  const [bestScore, setBestScore] = useState(
    Number(localStorage.getItem("bestScore")) || 0
  );

  const [difficulty, setDifficulty] = useState(6);

  function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return `rgb(${r}, ${g}, ${b})`;
  }

  function generateGame() {
    const newColors = [];

    for (let i = 0; i < difficulty; i++) {
      newColors.push(randomColor());
    }

    const randomIndex = Math.floor(
      Math.random() * difficulty
    );

    setColors(newColors);
    setTargetColor(newColors[randomIndex]);
    setMessage("");
  }

  useEffect(() => {
    generateGame();
  }, [difficulty]);

  function handleGuess(color) {
    if (color === targetColor) {
      const newScore = score + 1;

      setScore(newScore);
      setMessage("🎉 Correct!");

      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem(
          "bestScore",
          newScore
        );
      }

      setTimeout(() => {
        generateGame();
      }, 1000);
    } else {
      setMessage("❌ Try Again");
    }
  }

  return (
    <div className="container">
      <h1>🎨 Color Guessing Game</h1>

      <h2>{targetColor}</h2>

      <div className="score-box">
        <h3>⭐ Score: {score}</h3>
        <h3>🏆 Best Score: {bestScore}</h3>
      </div>

      <div className="difficulty">
        <button
          onClick={() => setDifficulty(3)}
        >
          Easy
        </button>

        <button
          onClick={() => setDifficulty(6)}
        >
          Hard
        </button>
      </div>

      <p>{message}</p>

      <div className="grid">
        {colors.map((color, index) => (
          <ColorBox
            key={index}
            color={color}
            handleClick={handleGuess}
          />
        ))}
      </div>

      <button onClick={generateGame}>
        🔄 New Colors
      </button>

      <button
        className="reset-btn"
        onClick={() => {
          setScore(0);
          setMessage("");
        }}
      >
        Reset Score
      </button>
    </div>
  );
}

export default App;
function ColorBox({ color, handleClick }) {
  return (
    <div
      className="color-box"
      style={{ backgroundColor: color }}
      onClick={() => handleClick(color)}
    ></div>
  );
}

export default ColorBox;
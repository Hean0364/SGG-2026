export default function LayerOpacityControl({ layerId, opacity, disabled = false, onOpacityChange }) {
  const percent = Math.round(opacity * 100);

  return (
    <label className="opacity-control" htmlFor={`opacity-${layerId}`}>
      <span>{percent}%</span>
      <input
        id={`opacity-${layerId}`}
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={opacity}
        disabled={disabled}
        onChange={(event) => onOpacityChange(layerId, Number(event.target.value))}
      />
    </label>
  );
}

export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      {label ? <p className="spinner-label">{label}</p> : null}
    </div>
  );
}

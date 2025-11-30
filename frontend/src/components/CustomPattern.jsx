import { useState } from "react";

export default function CustomPattern({ onSave }) {
  const [inhale, setInhale] = useState(5);
  const [hold, setHold] = useState(2);
  const [exhale, setExhale] = useState(7);

  const save = () => {
    if (onSave)
      onSave({
        inhale: Number(inhale),
        hold: Number(hold),
        exhale: Number(exhale),
      });
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="font-semibold">Custom Pattern</h3>
      <div className="mt-2 space-y-2">
        <div>
          <label className="block text-sm">Inhale (s)</label>
          <input
            type="number"
            value={inhale}
            onChange={(e) => setInhale(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm">Hold (s)</label>
          <input
            type="number"
            value={hold}
            onChange={(e) => setHold(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm">Exhale (s)</label>
          <input
            type="number"
            value={exhale}
            onChange={(e) => setExhale(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="mt-2">
          <button
            onClick={save}
            className="px-3 py-2 bg-cyan-500 text-white rounded"
          >
            Save Pattern
          </button>
        </div>
      </div>
    </div>
  );
}

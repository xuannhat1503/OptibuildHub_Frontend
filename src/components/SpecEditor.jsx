import React, { useState, useEffect, useRef } from "react";

const PRESETS = {
  CPU: [
    ["socket", ""],
    ["cores", ""],
    ["threads", ""],
    ["baseClock", ""],
    ["boostClock", ""],
    ["tdp", ""],
  ],
  GPU: [
    ["memory", ""],
    ["memoryType", ""],
    ["memoryBus", ""],
    ["coreClock", ""],
  ],
  RAM: [
    ["capacity", ""],
    ["modules", ""],
    ["speed", ""],
    ["type", ""],
    ["timings", ""],
  ],
  MAIN: [
    ["socket", ""],
    ["chipset", ""],
    ["formFactor", ""],
    ["memorySlots", ""],
  ],
  PSU: [
    ["wattage", ""],
    ["modular", ""],
    ["efficiency", ""],
  ],
  STORAGE: [
    ["type", ""],
    ["capacity", ""],
    ["interface", ""],
  ],
  CASE: [["formFactor", ""], ["fanSupport", ""], ["maxGpuLength", ""]],
  COOLER: [["type", ""], ["tdpSupported", ""]],
};

// Allowed fields per category (controlled list shown when editing/adding)
const ALLOWED = {
  CPU: ["socket", "cpuTdp", "cores", "threads", "baseClock", "boostClock"],
  GPU: ["memory", "memoryType", "memoryBus", "coreClock", "gpuLengthMm", "gpuTdp"],
  RAM: ["capacity", "modules", "speed", "type", "timings", "ramType"],
  MAIN: ["socket", "chipset", "formFactor", "memorySlots", "ramSlots", "ramMaxGb", "m2Slots", "sataPorts", "pcieSlots"],
  PSU: ["psuWatt", "modular", "efficiency"],
  STORAGE: ["type", "capacity", "interface", "m2Slots"],
  CASE: ["formFactor", "fanSupport", "maxGpuLength", "caseGpuMaxMm", "caseCoolerMaxMm"],
  COOLER: ["type", "tdpSupported", "coolerHeightMm"]
};

function SpecEditor({ value = {}, onChange, category }) {
  const [fields, setFields] = useState([]);

  // (use outer PRESETS)

  // sync incoming `value` -> fields only when different to avoid loops
  useEffect(() => {
    const entries = value && typeof value === "object" ? Object.entries(value) : [];
    const next = entries.map(([k, v]) => ({ key: k, value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? '') }));
    const same = JSON.stringify(next) === JSON.stringify(fields);
    if (!same) setFields(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Initialize presets when category changes if no fields exist
  useEffect(() => {
    if (!category) return;
    const isEmpty = fields.length === 0 || fields.every(f => !f.key);
    if (isEmpty && PRESETS[category]) {
      setFields(PRESETS[category].map(([k, v]) => ({ key: k, value: v })));
    }
  }, [category]);

  // emit changes only when resultant object differs from last emitted
  const lastEmittedRef = useRef(null);
  const emitTimeoutRef = useRef(null);
  useEffect(() => {
    const obj = {};
    fields.forEach(f => {
      if (f.key && f.key.trim() !== "") obj[f.key] = parseValue(f.value);
    });
    const serialized = JSON.stringify(obj);
    if (lastEmittedRef.current !== serialized) {
      // debounce emission to parent to avoid excessive re-renders
      if (emitTimeoutRef.current) clearTimeout(emitTimeoutRef.current);
      emitTimeoutRef.current = setTimeout(() => {
        lastEmittedRef.current = serialized;
        onChange && onChange(obj);
      }, 200);
    }
    return () => {
      if (emitTimeoutRef.current) {
        clearTimeout(emitTimeoutRef.current);
        emitTimeoutRef.current = null;
      }
    };
  }, [fields, onChange]);

  const parseValue = (v) => {
    if (v === null || v === undefined) return v;
    const s = String(v).trim();
    if (s === "true") return true;
    if (s === "false") return false;
    if (!isNaN(Number(s)) && s !== "") return Number(s);
    try {
      const parsed = JSON.parse(s);
      return parsed;
    } catch (e) {
      return v;
    }
  };

  const updateField = (idx, key, value) => {
    setFields(prev => prev.map((f, i) => i === idx ? { key, value } : f));
  };

  const addField = () => setFields(prev => [...prev, { key: "", value: "" }]);
  const removeField = (idx) => setFields(prev => prev.filter((_, i) => i !== idx));

  const [selectedAllowed, setSelectedAllowed] = React.useState("");
  const addAllowedField = () => {
    if (!selectedAllowed) return;
    setFields(prev => [...prev, { key: selectedAllowed, value: "" }]);
    setSelectedAllowed("");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {category && PRESETS[category] && (
          <button
            type="button"
            onClick={() => setFields(PRESETS[category].map(([k, v]) => ({ key: k, value: v })))}
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
          >
            Áp dụng mẫu {category}
          </button>
        )}
        <button type="button" onClick={() => setFields([])} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
          Xóa tất cả
        </button>
      </div>
      {category && (
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm text-gray-600">Thêm thông số phù hợp:</label>
          <select
            value={selectedAllowed}
            onChange={(e) => setSelectedAllowed(e.target.value)}
            className="px-2 py-1 border rounded-md text-sm"
          >
            <option value="">-- Chọn --</option>
            {(ALLOWED[category] || []).filter(k => !fields.some(f => f.key === k)).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addAllowedField}
            disabled={!selectedAllowed}
            className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm"
          >
            Thêm
          </button>
          <div className="ml-4 text-sm text-gray-500">Hoặc thêm thủ công nếu cần</div>
        </div>
      )}
      <div className="space-y-2">
        {fields.map((f, idx) => (
          <div className="flex gap-2 items-center" key={idx}>
            <input
              className="w-1/3 px-2 py-1 border rounded-md text-sm"
              placeholder="key"
              value={f.key}
              onChange={(e) => updateField(idx, e.target.value, f.value)}
            />
            <input
              className="flex-1 px-2 py-1 border rounded-md text-sm font-mono"
              placeholder="value"
              value={f.value}
              onChange={(e) => updateField(idx, f.key, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeField(idx)}
              className="text-red-600 hover:underline text-sm"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <button type="button" onClick={addField} className="px-3 py-1 bg-gray-100 rounded-md text-sm">
          Thêm thông số
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Ghi chú: giá trị có thể là chuỗi, số, boolean hoặc JSON (đặt dạng JSON nếu cần object/array).</p>
    </div>
  );
}

export default React.memo(SpecEditor);

import { useState } from 'react'

interface TrackedFlightsBarProps {
  tracked: string[]
  onPin: (flight: string) => void
  onUnpin: (flight: string) => void
}

export function TrackedFlightsBar({ tracked, onPin, onUnpin }: TrackedFlightsBarProps) {
  const [input, setInput] = useState('')

  function handlePin() {
    const flight = input.trim().toUpperCase()
    if (!flight) return
    onPin(flight)
    setInput('')
  }

  return (
    <div className="ft-pin-island">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handlePin()}
        placeholder="e.g. UA 1234"
        className="ft-pin-input"
      />
      <button onClick={handlePin} className="ft-pin-btn">Pin</button>
      {tracked.map((fn) => (
        <span key={fn} className="ft-pin-tag">
          {fn}
          <button onClick={() => onUnpin(fn)} className="ft-pin-tag-remove">&times;</button>
        </span>
      ))}
    </div>
  )
}

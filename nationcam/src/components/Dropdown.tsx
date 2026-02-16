import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  value: string | number
  label: string
}

interface DropdownProps {
  options: Array<DropdownOption>
  onSelect: (value: string | number) => void
  label: string
  selectedValue?: string | number
}

export default function Dropdown({
  options,
  onSelect,
  label,
  selectedValue,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedLabel =
    options.find((o) => String(o.value) === String(selectedValue))?.label ??
    label

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-overlay0 bg-surface0 px-4 py-3 text-left text-text transition-colors hover:border-accent"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-overlay0 bg-surface0 shadow-lg">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-text transition-colors hover:bg-surface1"
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

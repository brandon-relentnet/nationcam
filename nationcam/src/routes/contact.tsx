import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Dropdown from '@/components/Dropdown'
import Button from '@/components/Button'

export const Route = createFileRoute('/contact')({ component: ContactPage })

function ContactPage() {
  return (
    <div className="page-container">
      <h1>Contact Us</h1>
      <p>
        Interested in having your camera featured on NationCam? Fill out the
        form below and we will get in touch.
      </p>
      <ContactForm />
    </div>
  )
}

const internetOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Unsure' },
]

const timelineOptions = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-3months', label: '1-3 months' },
  { value: '3-6months', label: '3-6 months' },
  { value: '6months+', label: '6+ months' },
]

interface FormData {
  firstName: string
  lastName: string
  cameras: string
  internet: string
  street: string
  street2: string
  city: string
  state: string
  postalCode: string
  country: string
  timeline: string
}

function ContactForm() {
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    cameras: '',
    internet: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    timeline: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const required: Array<keyof FormData> = [
      'firstName',
      'lastName',
      'cameras',
      'internet',
      'street',
      'city',
      'state',
      'postalCode',
      'country',
      'timeline',
    ]
    const missing = required.filter((f) => !form[f])
    if (missing.length > 0) {
      setError('Please fill out all required fields.')
      return
    }

    // TODO: Submit form data to server
    setSubmitted(true)
    setError('')
  }

  if (submitted) {
    return (
      <div className="section-container text-center">
        <h3>Thank you!</h3>
        <p className="mb-0">
          We have received your submission. Our team will review it and get back
          to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="section-container space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First Name *"
          value={form.firstName}
          onChange={(v) => update('firstName', v)}
        />
        <Input
          label="Last Name *"
          value={form.lastName}
          onChange={(v) => update('lastName', v)}
        />
      </div>

      <Input
        label="Number of Cameras *"
        value={form.cameras}
        onChange={(v) => update('cameras', v)}
        type="number"
      />

      <Dropdown
        label="Do you have internet access? *"
        options={internetOptions}
        selectedValue={form.internet}
        onSelect={(v) => update('internet', String(v))}
      />

      <Input
        label="Street Address *"
        value={form.street}
        onChange={(v) => update('street', v)}
      />
      <Input
        label="Address Line 2"
        value={form.street2}
        onChange={(v) => update('street2', v)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="City *"
          value={form.city}
          onChange={(v) => update('city', v)}
        />
        <Input
          label="State *"
          value={form.state}
          onChange={(v) => update('state', v)}
        />
        <Input
          label="Postal Code *"
          value={form.postalCode}
          onChange={(v) => update('postalCode', v)}
        />
      </div>

      <Input
        label="Country *"
        value={form.country}
        onChange={(v) => update('country', v)}
      />

      <Dropdown
        label="When are you looking to start? *"
        options={timelineOptions}
        selectedValue={form.timeline}
        onSelect={(v) => update('timeline', String(v))}
      />

      {error && <p className="mb-0 text-sm text-red">{error}</p>}

      <Button text="Submit" type="submit" className="w-full" />
    </form>
  )
}

/* ──── Simple text input ──── */

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-subtext0">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-overlay0 bg-base px-4 py-3 text-text transition-colors focus:border-accent focus:outline-none"
      />
    </div>
  )
}

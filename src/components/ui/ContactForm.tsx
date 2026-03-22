import { useState, type FormEvent } from 'react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = new FormData(form)

    // mailto fallback (no backend needed for GitHub Pages)
    const subject = encodeURIComponent(`Portfolio Contact: ${data.get('name')}`)
    const body = encodeURIComponent(`From: ${data.get('name')} (${data.get('email')})\n\n${data.get('message')}`)
    window.open(`mailto:saurabhjalendra@gmail.com?subject=${subject}&body=${body}`)
    setStatus('sent')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder-muted input-focus-glow transition-colors"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder-muted input-focus-glow transition-colors"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder-muted input-focus-glow transition-colors resize-none"
          placeholder="What would you like to discuss?"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-press px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {status === 'sent' ? 'Message sent!' : 'Send Message'}
      </button>
    </form>
  )
}

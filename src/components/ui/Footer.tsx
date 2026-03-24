export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <p className="text-sm text-gray-500">{new Date().getFullYear()} Saurabh Jalendra</p>
        <div className="flex items-center gap-6">
          <a href="https://github.com/SaurabhJalendra" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-black transition-colors">GitHub</a>
          <a href="https://linkedin.com/in/saurabhjalendra" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-black transition-colors">LinkedIn</a>
          <a href="mailto:saurabhjalendra@gmail.com" className="text-sm text-gray-500 hover:text-black transition-colors">Email</a>
        </div>
      </div>
    </footer>
  )
}

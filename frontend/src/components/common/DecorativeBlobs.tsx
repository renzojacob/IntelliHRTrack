export default function DecorativeBlobs() {
  return (
    <div className="pointer-events-none fixed -z-10 inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-40 gradient-accent animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-500 to-indigo-500 animate-float" style={{ animationDelay: '1s' }}></div>
    </div>
  )
}














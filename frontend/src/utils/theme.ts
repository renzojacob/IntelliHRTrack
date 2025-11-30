export const toggleTheme = () => {
  const html = document.documentElement
  const isDark = html.classList.contains('dark')
  
  if (isDark) {
    html.classList.remove('dark')
    localStorage.setItem('ih_theme', 'light')
  } else {
    html.classList.add('dark')
    localStorage.setItem('ih_theme', 'dark')
  }
}

export const getTheme = (): 'light' | 'dark' => {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}














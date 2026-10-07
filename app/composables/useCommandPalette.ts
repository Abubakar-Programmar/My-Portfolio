export function useCommandPalette() {
  const open = useState('command-palette-open', () => false)
  return { open, toggle: () => (open.value = !open.value), close: () => (open.value = false) }
}

import type { ProviderGetImage } from '@nuxt/image'

// Serves uploaded files through the /media route, which resizes on demand with sharp.
const getImage: ProviderGetImage = (src, options) => {
  const params = new URLSearchParams()
  if (options.modifiers.width) params.set('w', String(options.modifiers.width))
  if (options.modifiers.format) params.set('f', String(options.modifiers.format))
  const qs = params.toString()
  return { url: qs ? `${src}?${qs}` : src }
}

export default () => ({ getImage })

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

const model = defineModel<string>({ default: '' })
const mediaOpen = ref(false)

const editor = useEditor({
  content: model.value,
  extensions: [
    StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } } }),
    Image,
    Placeholder.configure({ placeholder: 'Start writing…' })
  ],
  editorProps: { attributes: { class: 'prose-content !max-w-none', 'aria-label': 'Rich text editor' } },
  onUpdate: ({ editor: e }) => { model.value = e.isEmpty ? '' : e.getHTML() }
})

// Keep the editor in sync when the form loads or resets its value externally.
watch(model, (v) => {
  if (editor.value && v !== editor.value.getHTML() && !(v === '' && editor.value.isEmpty)) editor.value.commands.setContent(v, { emitUpdate: false })
})
onBeforeUnmount(() => editor.value?.destroy())

function setLink() {
  const e = editor.value
  if (!e) return
  const previous = e.getAttributes('link').href as string | undefined
  const url = window.prompt('Link URL (leave empty to remove)', previous ?? 'https://')
  if (url === null) return
  if (url === '') e.chain().focus().extendMarkRange('link').unsetLink().run()
  else e.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function insertImage(urls: string[]) {
  const url = urls[0]
  if (url) editor.value?.chain().focus().setImage({ src: url, alt: '' }).run()
}

const buttons = computed(() => {
  const e = editor.value
  if (!e) return []
  const c = () => e.chain().focus()
  return [
    { label: 'Bold', icon: 'B', on: e.isActive('bold'), run: () => c().toggleBold().run(), cls: 'font-bold' },
    { label: 'Italic', icon: 'I', on: e.isActive('italic'), run: () => c().toggleItalic().run(), cls: 'italic' },
    { label: 'Strikethrough', icon: 'S', on: e.isActive('strike'), run: () => c().toggleStrike().run(), cls: 'line-through' },
    { label: 'Heading 2', icon: 'H2', on: e.isActive('heading', { level: 2 }), run: () => c().toggleHeading({ level: 2 }).run() },
    { label: 'Heading 3', icon: 'H3', on: e.isActive('heading', { level: 3 }), run: () => c().toggleHeading({ level: 3 }).run() },
    { label: 'Bullet list', icon: '• List', on: e.isActive('bulletList'), run: () => c().toggleBulletList().run() },
    { label: 'Numbered list', icon: '1. List', on: e.isActive('orderedList'), run: () => c().toggleOrderedList().run() },
    { label: 'Quote', icon: '“ ”', on: e.isActive('blockquote'), run: () => c().toggleBlockquote().run() },
    { label: 'Code block', icon: '</>', on: e.isActive('codeBlock'), run: () => c().toggleCodeBlock().run() },
    { label: 'Link', icon: 'Link', on: e.isActive('link'), run: setLink },
    { label: 'Insert image', icon: 'Image', on: false, run: () => (mediaOpen.value = true) },
    { label: 'Divider', icon: '—', on: false, run: () => c().setHorizontalRule().run() },
    { label: 'Undo', icon: '↶', on: false, run: () => c().undo().run() },
    { label: 'Redo', icon: '↷', on: false, run: () => c().redo().run() }
  ]
})
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-line bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
    <div class="flex flex-wrap gap-1 border-b border-line bg-surface p-2" role="toolbar" aria-label="Formatting">
      <button v-for="b in buttons" :key="b.label" type="button" class="min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-sm transition" :class="[b.on ? 'bg-accent text-white' : 'text-ink hover:bg-white', b.cls]" :aria-label="b.label" :aria-pressed="b.on" :title="b.label" @click="b.run()">{{ b.icon }}</button>
    </div>
    <EditorContent :editor="editor" />
    <AdminMediaPicker :open="mediaOpen" @close="mediaOpen = false" @select="insertImage" />
  </div>
</template>

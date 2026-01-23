'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, PenLine, Image as ImageIcon, Type, Link as LinkIcon, Globe, FileText } from 'lucide-react'
import { AIMetadata, Reference } from '@/lib/types'

interface GenerationSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onGenerate: (settings: AIMetadata) => void
    initialSettings?: Partial<AIMetadata>
    mode?: 'full' | 'text-only' | 'image-only'
    title?: string
}

export default function GenerationSettingsModal({
    isOpen,
    onClose,
    onGenerate,
    initialSettings = {},
    mode = 'full',
    title = 'Generate Article'
}: GenerationSettingsModalProps) {
    const [settings, setSettings] = useState<AIMetadata>({
        topic: initialSettings.topic || '',
        textModel: initialSettings.textModel || 'claude-opus-4-5-20251101',
        imageModel: initialSettings.imageModel || 'gemini-3-pro-image-preview',
        imageResolution: initialSettings.imageResolution || '1K',
        imageStyle: initialSettings.imageStyle || 'abstract, contemporary, tech-focused, visually striking',
        imagePrompt: initialSettings.imagePrompt || '',
        additionalInstructions: initialSettings.additionalInstructions || '',
        references: initialSettings.references || [],
    })

    const [referenceInput, setReferenceInput] = useState('')

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onGenerate(settings)
        onClose()
    }

    const addReference = () => {
        if (!referenceInput.trim()) return
        const type = referenceInput.startsWith('http') ? 'url' : 'text'
        setSettings({
            ...settings,
            references: [...(settings.references || []), { type, content: referenceInput }]
        })
        setReferenceInput('')
    }

    const removeReference = (index: number) => {
        setSettings({
            ...settings,
            references: (settings.references || []).filter((_, i) => i !== index)
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            addReference()
        }
    }

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
                e.stopPropagation()
                onClose()
            }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    {/* Header with Generate button */}
                    <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-lg font-serif font-light">{title}</h2>
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-white text-black rounded-lg hover:bg-[#EAEAEA] transition-colors text-xs font-bold flex items-center gap-1.5 font-mono uppercase tracking-wider"
                            >
                                <PenLine className="w-3.5 h-3.5" />
                                {mode === 'full' ? 'Generate' : 'Regenerate'}
                            </button>
                            <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                        {/* Text Settings */}
                        {(mode === 'full' || mode === 'text-only') && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                                    <Type className="w-3 h-3" />
                                    Text
                                </div>

                                <input
                                    type="text"
                                    value={settings.topic}
                                    onChange={(e) => setSettings({ ...settings, topic: e.target.value })}
                                    placeholder="Topic — e.g. The Future of AI in Healthcare"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm"
                                />

                                <div className="flex gap-2">
                                    <select
                                        value={settings.textModel}
                                        onChange={(e) => setSettings({ ...settings, textModel: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 appearance-none text-sm"
                                    >
                                        <optgroup label="Anthropic">
                                            <option value="claude-opus-4-5-20251101">Claude Opus 4.5</option>
                                            <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5</option>
                                            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                                        </optgroup>
                                        <optgroup label="Google Gemini">
                                            <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                                            <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
                                        </optgroup>
                                        <optgroup label="OpenAI">
                                            <option value="gpt-5.2">GPT-5.2</option>
                                            <option value="o4-mini">O4 Mini</option>
                                        </optgroup>
                                    </select>
                                </div>

                                <input
                                    type="text"
                                    value={settings.additionalInstructions || ''}
                                    onChange={(e) => setSettings({ ...settings, additionalInstructions: e.target.value })}
                                    placeholder="Additional instructions (optional)"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm"
                                />
                            </div>
                        )}

                        {/* References */}
                        {(mode === 'full' || mode === 'text-only') && (
                            <div className="space-y-2 pt-3 border-t border-white/10">
                                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                                    <LinkIcon className="w-3 h-3" />
                                    References
                                </div>

                                {(settings.references?.length ?? 0) > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {settings.references?.map((ref: Reference, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs flex items-center gap-1.5">
                                                {ref.type === 'url' ? <Globe className="w-3 h-3 shrink-0" /> : <FileText className="w-3 h-3 shrink-0" />}
                                                <span className="truncate max-w-[180px]">
                                                    {ref.title || (ref.type === 'url' ? ref.content.replace(/^https?:\/\/(www\.)?/, '').substring(0, 40) : ref.content.substring(0, 40))}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeReference(i)}
                                                    className="hover:bg-white/10 rounded p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={referenceInput}
                                        onChange={(e) => setReferenceInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Paste URL or text snippet..."
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={addReference}
                                        className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-xs font-mono uppercase tracking-wider"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Image Settings */}
                        {(mode === 'full' || mode === 'image-only') && (
                            <div className="space-y-3 pt-3 border-t border-white/10">
                                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                                    <ImageIcon className="w-3 h-3" />
                                    Image
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={settings.imageModel}
                                        onChange={(e) => {
                                            const newModel = e.target.value
                                            setSettings({
                                                ...settings,
                                                imageModel: newModel,
                                                imageResolution: newModel.startsWith('gemini') ? '1K' : undefined
                                            })
                                        }}
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 appearance-none text-sm"
                                    >
                                        <optgroup label="Google">
                                            <option value="gemini-3-pro-image-preview">Nano Banana Pro</option>
                                            <option value="imagen-4.0-generate-001">Imagen 4</option>
                                        </optgroup>
                                        <optgroup label="OpenAI">
                                            <option value="gpt-image-1.5">GPT Image 1.5</option>
                                            <option value="gpt-image-1">GPT Image 1</option>
                                        </optgroup>
                                    </select>

                                    {settings.imageModel?.startsWith('gemini') && (
                                        <select
                                            value={settings.imageResolution || '1K'}
                                            onChange={(e) => setSettings({ ...settings, imageResolution: e.target.value as '1K' | '2K' | '4K' })}
                                            className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 appearance-none text-sm"
                                        >
                                            <option value="1K">1K</option>
                                            <option value="2K">2K</option>
                                            <option value="4K">4K</option>
                                        </select>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    value={settings.imageStyle}
                                    onChange={(e) => setSettings({ ...settings, imageStyle: e.target.value })}
                                    placeholder="Style — e.g. abstract, photorealistic, cyberpunk"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm"
                                />

                                <input
                                    type="text"
                                    value={settings.imagePrompt}
                                    onChange={(e) => setSettings({ ...settings, imagePrompt: e.target.value })}
                                    placeholder="Custom image prompt (optional)"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm"
                                />
                            </div>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

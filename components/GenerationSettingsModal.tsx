'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Image as ImageIcon, Type, Settings2, Link as LinkIcon, Globe, FileText } from 'lucide-react'
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
        textModel: initialSettings.textModel || 'gemini-3-flash-preview',
        imageModel: initialSettings.imageModel || 'gpt-image-1.5',
        imageResolution: initialSettings.imageResolution || '2K',
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
                className="glass border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-serif font-light flex items-center gap-2">
                        <Settings2 className="w-5 h-5" />
                        {title}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Text Generation Settings */}
                    {(mode === 'full' || mode === 'text-only') && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-[#888888] mb-2">
                                <Type className="w-4 h-4" />
                                Text Settings
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Topic</label>
                                <input
                                    type="text"
                                    value={settings.topic}
                                    onChange={(e) => setSettings({ ...settings, topic: e.target.value })}
                                    placeholder="e.g. The Future of AI in Healthcare"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Model</label>
                                <select
                                    value={settings.textModel}
                                    onChange={(e) => setSettings({ ...settings, textModel: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 appearance-none"
                                >
                                    <optgroup label="Google Gemini">
                                        <option value="gemini-3-flash-preview">Gemini 3 Flash (Fastest)</option>
                                        <option value="gemini-3-pro-preview">Gemini 3 Pro (Best Quality)</option>
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Stable)</option>
                                    </optgroup>
                                    <optgroup label="OpenAI">
                                        <option value="gpt-5.2">GPT-5.2 (Latest Flagship)</option>
                                        <option value="gpt-5.2-pro">GPT-5.2 Pro (Enhanced Reasoning)</option>
                                        <option value="o4-mini">O4 Mini (Fast Reasoning)</option>
                                    </optgroup>
                                    <optgroup label="Anthropic">
                                        <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5 (Recommended)</option>
                                        <option value="claude-opus-4-5-20251101">Claude Opus 4.5 (Most Capable)</option>
                                        <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Fastest)</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Additional Instructions (Optional)</label>
                                <textarea
                                    value={settings.additionalInstructions || ''}
                                    onChange={(e) => setSettings({ ...settings, additionalInstructions: e.target.value })}
                                    placeholder="e.g. Focus on technical details, use a friendly tone, include code examples..."
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* References Section */}
                    {(mode === 'full' || mode === 'text-only') && (
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-[#888888] mb-2">
                                <LinkIcon className="w-4 h-4" />
                                References (Optional)
                            </div>

                            <p className="text-xs text-[#888888]">
                                Add URLs or text snippets to incorporate into the article. Works best with Gemini models.
                            </p>

                            {/* Reference chips */}
                            {(settings.references?.length ?? 0) > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {settings.references?.map((ref: Reference, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs flex items-center gap-2 max-w-full">
                                            {ref.type === 'url' ? <Globe className="w-3 h-3 shrink-0" /> : <FileText className="w-3 h-3 shrink-0" />}
                                            <span className="truncate max-w-[200px]">
                                                {ref.title || (ref.type === 'url' ? ref.content : ref.content.substring(0, 50) + '...')}
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

                            {/* Add reference input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={referenceInput}
                                    onChange={(e) => setReferenceInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Paste URL or text snippet..."
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={addReference}
                                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Image Generation Settings */}
                    {(mode === 'full' || mode === 'image-only') && (
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-[#888888] mb-2">
                                <ImageIcon className="w-4 h-4" />
                                Image Settings
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Model</label>
                                <select
                                    value={settings.imageModel}
                                    onChange={(e) => {
                                        const newModel = e.target.value
                                        // Set appropriate default resolution based on model
                                        const defaultResolution = newModel === 'gemini-image' ? '1K' : '2K'
                                        setSettings({
                                            ...settings,
                                            imageModel: newModel,
                                            imageResolution: defaultResolution as '1K' | '2K' | '4K'
                                        })
                                    }}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 appearance-none"
                                >
                                    <optgroup label="OpenAI">
                                        <option value="gpt-image-1.5">GPT Image 1.5 (Best Quality)</option>
                                        <option value="gpt-image-1">GPT Image 1 (Standard)</option>
                                        <option value="dall-e-3">DALL-E 3 (Legacy - Deprecated May 2026)</option>
                                    </optgroup>
                                    <optgroup label="Google">
                                        <option value="gemini-3-pro-image-preview">Nano Banana Pro (2K/4K)</option>
                                        <option value="imagen-4.0-generate-001">Imagen 4 (High Quality)</option>
                                    </optgroup>
                                </select>
                            </div>

                            {/* Resolution selector (only for Gemini models) */}
                            {settings.imageModel?.startsWith('gemini') && (
                                <div>
                                    <label className="block text-sm mb-2">
                                        Resolution
                                        <span className="text-xs text-[#888888] ml-2">(Higher = Better quality but slower)</span>
                                    </label>
                                    <select
                                        value={settings.imageResolution || '2K'}
                                        onChange={(e) => setSettings({ ...settings, imageResolution: e.target.value as '1K' | '2K' | '4K' })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 appearance-none"
                                    >
                                        <option value="1K">1K (1024x1024 - Fast)</option>
                                        <option value="2K">2K (2048x2048 - Balanced - Recommended)</option>
                                        <option value="4K">4K (4096x4096 - High Quality)</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm mb-2">Style</label>
                                <input
                                    type="text"
                                    value={settings.imageStyle}
                                    onChange={(e) => setSettings({ ...settings, imageStyle: e.target.value })}
                                    placeholder="e.g. abstract, photorealistic, cyberpunk"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Custom Prompt (Optional)</label>
                                <textarea
                                    value={settings.imagePrompt}
                                    onChange={(e) => setSettings({ ...settings, imagePrompt: e.target.value })}
                                    placeholder="Leave empty to auto-generate based on title/topic"
                                    rows={2}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-[#EAEAEA] transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            {mode === 'full' ? 'Generate' : 'Regenerate'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

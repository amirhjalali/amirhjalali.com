'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Image as ImageIcon, Type, Settings2 } from 'lucide-react'
import { AIMetadata } from '@/lib/types'

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
        textModel: initialSettings.textModel || 'gpt-4o-mini',
        imageModel: initialSettings.imageModel || 'dall-e-3',
        imageStyle: initialSettings.imageStyle || 'abstract, contemporary, tech-focused, visually striking',
        imagePrompt: initialSettings.imagePrompt || '',
        additionalInstructions: initialSettings.additionalInstructions || '',
    })

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onGenerate(settings)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
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
                                    <option value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</option>
                                    <option value="gpt-4o">GPT-4o (High Quality)</option>
                                    <option value="claude-3-opus">Claude 3 Opus (Coming Soon)</option>
                                    <option value="gemini-pro">Gemini Pro (Coming Soon)</option>
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
                                    onChange={(e) => setSettings({ ...settings, imageModel: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 appearance-none"
                                >
                                    <option value="dall-e-3">DALL-E 3 (Standard)</option>
                                    <option value="stable-diffusion-xl">Stable Diffusion XL (Replicate - Coming Soon)</option>
                                    <option value="flux-pro">Flux Pro (Replicate - Coming Soon)</option>
                                </select>
                            </div>

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

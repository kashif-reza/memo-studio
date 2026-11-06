import React, { useState } from 'react';
import { ChatMessage, EmojiConfig, SavedEmoji } from '../types/emoji';
import { EmojiRenderer } from './EmojiRenderer';
import { FormattedEmojiText } from './FormattedEmojiText';
import { X, Send, SmilePlus, Copy, Check } from 'lucide-react';

interface ChatSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: EmojiConfig;
  savedPack: SavedEmoji[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    author: 'Maya Lin',
    role: 'Design Systems Lead',
    timestamp: '10:42 AM',
    text: 'Hello 😊 How are you? ❤️🔥 Just pushed the new animated custom emoji pack for our release channel! 😍✨🎉',
    customEmojiIds: [],
    reactions: [
      { emojiId: 'preset-hype-cat', shortcode: ':neko_hype:', count: 4, userReacted: true },
      { emojiId: 'preset-deal-boss', shortcode: ':ship_it_boss:', count: 2, userReacted: false },
    ],
  },
  {
    id: 'msg-2',
    author: 'Devon Brooks',
    role: 'Staff Frontend Engineer',
    timestamp: '10:44 AM',
    text: '😂😂😂 That was hilarious! The secondary bounce on the party hat and sunglasses looks super crisp at both 28px inline and 64px jumbo! 🚀💯',
    customEmojiIds: ['preset-deal-boss'],
    reactions: [
      { emojiId: 'preset-royal-chef', shortcode: ':let_him_cook:', count: 3, userReacted: true },
    ],
  },
];

const QUICK_UNICODE_EMOJIS = ['😊', '😂', '❤️', '🔥', '😍', '✨', '🎉', '🌞', '☕', '🥰', '💯', '🚀'];

export const ChatSimulatorModal: React.FC<ChatSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  savedPack,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draftText, setDraftText] = useState<string>('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [selectedEmojisForDraft, setSelectedEmojisForDraft] = useState<string[]>([
    currentConfig.id,
  ]);

  if (!isOpen) return null;

  // Combine current active emoji + saved pack into a lookup dictionary
  const allEmojisMap = new Map<string, EmojiConfig>();
  allEmojisMap.set(currentConfig.id, currentConfig);
  savedPack.forEach((s) => allEmojisMap.set(s.config.id, s.config));

  const availableEmojis = Array.from(allEmojisMap.values());

  const handleToggleReaction = (messageId: string, emoji: EmojiConfig) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.emojiId === emoji.id);
        if (existing) {
          const nextCount = existing.userReacted ? existing.count - 1 : existing.count + 1;
          return {
            ...m,
            reactions:
              nextCount <= 0
                ? m.reactions.filter((r) => r.emojiId !== emoji.id)
                : m.reactions.map((r) =>
                    r.emojiId === emoji.id
                      ? { ...r, count: nextCount, userReacted: !r.userReacted }
                      : r
                  ),
          };
        }
        return {
          ...m,
          reactions: [
            ...m.reactions,
            {
              emojiId: emoji.id,
              shortcode: emoji.shortcode,
              count: 1,
              userReacted: true,
            },
          ],
        };
      })
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim() && selectedEmojisForDraft.length === 0) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      author: 'You (Creator)',
      role: 'Emoji Animator',
      timestamp: 'Just now',
      text: draftText.trim(),
      customEmojiIds: selectedEmojisForDraft,
      reactions: [
        {
          emojiId: currentConfig.id,
          shortcode: currentConfig.shortcode,
          count: 1,
          userReacted: true,
        },
      ],
    };

    setMessages((prev) => [...prev, newMsg]);
    setDraftText('');
    setSelectedEmojisForDraft([]);
  };

  const toggleDraftEmoji = (id: string) => {
    setSelectedEmojisForDraft((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyMessageText = (msgId: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 1600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-sim-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-3xl bg-white border-2 border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#E8B1C4]/35 border-b border-slate-200">
          <div>
            <h2
              id="chat-sim-title"
              className="text-lg font-bold text-slate-900"
            >
              Live Team Chat & Reaction Sandbox
            </h2>
            <p className="text-xs text-slate-600">
              Preview how your custom animated emojis and inline Unicode emojis render at real chat scale without overlapping.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Chat Sandbox"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F9F9F9]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {msg.author}
                  </span>
                  <span aria-hidden="true" className="text-slate-400">
                    ·
                  </span>
                  <span className="text-slate-500">{msg.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 tabular-nums">{msg.timestamp}</span>
                  {msg.text && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessageText(msg.id, msg.text)}
                      aria-label="Copy message text"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F9F9F9] hover:bg-[#FFBA00]/25 border border-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#8EBE2A]" />
                          <span className="text-[#8EBE2A]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.text && (
                <div className="text-sm text-slate-800">
                  <FormattedEmojiText text={msg.text} />
                </div>
              )}

              {/* Jumbo Custom Emojis attached to message */}
              {msg.customEmojiIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {msg.customEmojiIds.map((id, idx) => {
                    const emojiObj = allEmojisMap.get(id) || currentConfig;
                    return (
                      <div
                        key={`${id}-${idx}`}
                        className="inline-flex flex-col items-center p-2 rounded-lg bg-[#F9F9F9] border border-slate-200"
                      >
                        <EmojiRenderer
                          config={emojiObj}
                          size={56}
                          animate={true}
                          showShadow={false}
                        />
                        <span className="text-[10px] font-mono text-slate-500 mt-1">
                          {emojiObj.shortcode}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reaction Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {msg.reactions.map((react) => {
                  const emojiObj = allEmojisMap.get(react.emojiId) || currentConfig;
                  return (
                    <button
                      key={react.emojiId}
                      type="button"
                      onClick={() => handleToggleReaction(msg.id, emojiObj)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer tabular-nums ${
                        react.userReacted
                          ? 'border-[#FF4925] bg-[#FFBA00]/20 text-slate-900 font-bold'
                          : 'border-slate-200 bg-[#F9F9F9] text-slate-700'
                      }`}
                    >
                      <EmojiRenderer
                        config={emojiObj}
                        size={22}
                        animate={true}
                        showShadow={false}
                      />
                      <span>{react.count}</span>
                    </button>
                  );
                })}

                {/* Quick React with Current Active Emoji */}
                <button
                  type="button"
                  onClick={() => handleToggleReaction(msg.id, currentConfig)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-slate-300 text-xs text-slate-600 hover:text-[#FF4925] hover:border-[#FF4925] transition-colors cursor-pointer"
                >
                  <SmilePlus className="w-3.5 h-3.5" />
                  <span>React {currentConfig.shortcode}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Message Composer */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-slate-200 bg-white space-y-3"
        >
          {/* Quick Inline Unicode Emojis */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-600 shrink-0 mr-1">
              Insert Emoji:
            </span>
            {QUICK_UNICODE_EMOJIS.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => setDraftText((prev) => `${prev}${prev.endsWith(' ') || !prev ? '' : ' '}${char} `)}
                className="w-8 h-8 rounded-lg bg-[#F9F9F9] hover:bg-[#FFBA00]/25 border border-slate-200 flex items-center justify-center text-base cursor-pointer shrink-0"
                title={`Insert ${char}`}
              >
                <span className="memo-emoji-span">{char}</span>
              </button>
            ))}
          </div>

          {/* Custom Sticker Picker Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-600 shrink-0">
              Attach Sticker:
            </span>
            {availableEmojis.map((emo) => {
              const isAttached = selectedEmojisForDraft.includes(emo.id);
              return (
                <button
                  key={emo.id}
                  type="button"
                  onClick={() => toggleDraftEmoji(emo.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono shrink-0 transition-all cursor-pointer ${
                    isAttached
                      ? 'border-[#FF4925] bg-[#FFBA00]/20 text-slate-900 font-bold'
                      : 'border-slate-200 bg-[#F9F9F9] text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <EmojiRenderer config={emo} size={22} animate={false} showShadow={false} />
                  <span>{emo.shortcode}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              aria-label="Chat Message Input"
              placeholder={`Message #design-ship-room with ${currentConfig.shortcode}...`}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-[#F9F9F9] text-sm text-slate-900 focus:outline-none focus:border-[#FF4925]"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF4925] hover:bg-[#E97A11] text-white font-bold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

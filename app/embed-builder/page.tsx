"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "../components/Navigation";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/lib/siteConfig";
import { Upload, Copy, Check, Hash, ChevronDown, Users, Pin, Bell, HelpCircle, Inbox, AtSign, Gift, Sticker, ImagePlus, Smile, Send } from "lucide-react";

interface ButtonData {
  label: string;
  style: string;
  url: string;
  emoji: string;
  row: number;
  disabled: boolean;
}

interface FieldData {
  name: string;
  value: string;
  inline: boolean;
}

interface EmbedData {
  content: string;
  color: string;
  url: string;
  title: string;
  description: string;
  authorName: string;
  authorIcon: string;
  authorUrl: string;
  thumbnailUrl: string;
  imageUrl: string;
  footerText: string;
  footerIcon: string;
  timestamp: boolean;
  deleteAfter: string;
  buttons: ButtonData[];
  fields: FieldData[];
}

export default function EmbedBuilder() {
  const [isDark, setIsDark] = useState(true);
  const siteConfig = useSiteConfig();
  const [botInfo, setBotInfo] = useState({ name: siteConfig.botName, avatar: siteConfig.botLogo });
  const [copied, setCopied] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importScript, setImportScript] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (trimmed === 'None' || trimmed === 'null' || trimmed === 'undefined') return false;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  };

  const [embedData, setEmbedData] = useState<EmbedData>({
    content: "",
    color: "#5865F2",
    url: "",
    title: "",
    description: "",
    authorName: "",
    authorIcon: "",
    authorUrl: "",
    thumbnailUrl: "",
    imageUrl: "",
    footerText: "",
    footerIcon: "",
    timestamp: false,
    deleteAfter: "",
    buttons: [],
    fields: [],
  });
  const [buttonsEnabled, setButtonsEnabled] = useState(true);
  const [generatedScript, setGeneratedScript] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);

  useEffect(() => {
    setBotInfo({
      name: siteConfig.botName,
      avatar: siteConfig.botLogo,
    });
  }, [siteConfig.botName, siteConfig.botLogo]);

  useEffect(() => {
    generateScript();
  }, [embedData]);

  useEffect(() => {
    // Count actual content in the embed/fields/content
    let totalChars = 0;

    // Content text
    if (embedData.content) {
      totalChars += embedData.content.length;
    }

    // Embed title
    if (embedData.title) {
      totalChars += embedData.title.length;
    }

    // Embed description
    if (embedData.description) {
      totalChars += embedData.description.length;
    }

    // Author name
    if (embedData.authorName) {
      totalChars += embedData.authorName.length;
    }

    // Footer text
    if (embedData.footerText) {
      totalChars += embedData.footerText.length;
    }

    // Fields (name + value)
    embedData.fields.forEach(field => {
      totalChars += (field.name || '').length;
      totalChars += (field.value || '').length;
    });

    setCharacterCount(totalChars);
    setIsOverLimit(totalChars > 6000);
  }, [embedData]);

  const generateScript = () => {
    const parts: string[] = [];

    if (embedData.content) {
      parts.push(`{content: ${embedData.content.replace(/\n/g, '\\n')}}`);
    }

    parts.push("$v{embed}");

    if (embedData.color) {
      parts.push(`$v{color: ${embedData.color}}`);
    }

    if (embedData.title) {
      parts.push(`$v{title: ${embedData.title.replace(/\n/g, '\\n')}}`);
    }

    if (embedData.description) {
      parts.push(`$v{description: ${embedData.description.replace(/\n/g, '\\n')}}`);
    }

    if (embedData.timestamp) {
      parts.push("$v{timestamp}");
    }

    if (embedData.authorName) {
      parts.push(`$v{author: name: ${embedData.authorName.replace(/\n/g, '\\n')} && icon: ${embedData.authorIcon || ""}}`);
    }

    if (embedData.thumbnailUrl) {
      parts.push(`$v{thumbnail: ${embedData.thumbnailUrl}}`);
    }

    if (embedData.imageUrl) {
      parts.push(`$v{image: ${embedData.imageUrl}}`);
    }

    if (embedData.footerText) {
      parts.push(`$v{footer: text: ${embedData.footerText.replace(/\n/g, '\\n')} && icon: ${embedData.footerIcon || ""}}`);
    }

    if (embedData.fields && embedData.fields.length > 0) {
      embedData.fields.forEach((field) => {
        if (field.name || field.value) {
          parts.push(`$v{field: name: ${field.name.replace(/\n/g, '\\n')} && value: ${field.value.replace(/\n/g, '\\n')} && inline: ${field.inline}}`);
        }
      });
    }

    if (embedData.buttons && embedData.buttons.length > 0) {
      parts.push("$v{buttons}");
      if (!buttonsEnabled) {
        parts.push("$v{buttons_disabled}");
      }
      embedData.buttons.forEach((button) => {
        const buttonParts: string[] = [];
        if (button.label) buttonParts.push(`label=${button.label.replace(/\n/g, '\\n')}`);
        if (button.style) buttonParts.push(`style=${button.style}`);
        if (button.style === 'link' && button.url) buttonParts.push(`url=${button.url}`);
        if (button.emoji) buttonParts.push(`emoji=${button.emoji}`);
        if (button.row !== undefined) buttonParts.push(`row=${button.row}`);
        if (button.disabled) buttonParts.push(`disabled=${button.disabled}`);

        if (buttonParts.length > 0) {
          parts.push(`$v{button: ${buttonParts.join(" && ")}}`);
        }
      });
    }

    const script = parts.join("");
    setGeneratedScript(script);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseImportedScript = (script: string) => {
    const contentMatch = script.match(/\{content:\s*([^}]+)\}/);
    const colorMatch = script.match(/\{color:\s*([^}]+)\}/);
    const titleMatch = script.match(/\{title:\s*([^}]+)\}/);
    const descMatch = script.match(/\{description:\s*([^}]+)\}/);
    const authorMatch = script.match(/\{author:\s*name:\s*([^&]+)&&\s*icon:\s*([^}]+)\}/);
    const thumbMatch = script.match(/\{thumbnail:\s*([^}]+)\}/);
    const imageMatch = script.match(/\{image:\s*([^}]+)\}/);
    const footerMatch = script.match(/\{footer:\s*text:\s*([^&]+)&&\s*icon:\s*([^}]+)\}/);

    const fields: FieldData[] = [];
    const fieldPattern = /\{field:\s*name:\s*([^&]+)&&\s*value:\s*([^&]+)&&\s*inline:\s*(true|false)\}/g;
    let fieldMatch;
    while ((fieldMatch = fieldPattern.exec(script)) !== null) {
      fields.push({
        name: fieldMatch[1].trim().replace(/\\n/g, '\n'),
        value: fieldMatch[2].trim().replace(/\\n/g, '\n'),
        inline: fieldMatch[3] === 'true'
      });
    }

    const buttons: ButtonData[] = [];
    const hasButtons = script.includes("{buttons}");
    const buttonsAreDisabled = script.includes("{buttons_disabled}");

    if (hasButtons) {
      const buttonPattern = /\{button:\s*([^}]+)\}/g;
      let buttonMatch;
      while ((buttonMatch = buttonPattern.exec(script)) !== null) {
        const buttonStr = buttonMatch[1];
        const button: ButtonData = { label: "", style: "secondary", url: "", emoji: "", row: 0, disabled: false };

        const properties = buttonStr.split("&&");
        properties.forEach((prop) => {
          const [key, value] = prop.split("=").map((s) => s.trim());
          if (key === "label") button.label = value.replace(/\\n/g, '\n');
          else if (key === "style") button.style = value;
          else if (key === "url") button.url = value;
          else if (key === "emoji") button.emoji = value;
          else if (key === "row") button.row = parseInt(value) || 0;
          else if (key === "disabled") button.disabled = value === "true";
        });

        if (button.label) buttons.push(button);
      }
    }

    setButtonsEnabled(!buttonsAreDisabled);
    setEmbedData({
      content: contentMatch ? contentMatch[1].trim().replace(/\\n/g, '\n') : "",
      color: colorMatch ? colorMatch[1].trim() : "#5865F2",
      url: "",
      title: titleMatch ? titleMatch[1].trim().replace(/\\n/g, '\n') : "",
      description: descMatch ? descMatch[1].trim().replace(/\\n/g, '\n') : "",
      authorName: authorMatch ? authorMatch[1].trim().replace(/\\n/g, '\n') : "",
      authorIcon: authorMatch ? authorMatch[2].trim() : "",
      authorUrl: "",
      thumbnailUrl: thumbMatch ? thumbMatch[1].trim() : "",
      imageUrl: imageMatch ? imageMatch[1].trim() : "",
      footerText: footerMatch ? footerMatch[1].trim().replace(/\\n/g, '\n') : "",
      footerIcon: footerMatch ? footerMatch[2].trim() : "",
      timestamp: script.includes("{timestamp}"),
      deleteAfter: "",
      buttons: buttons,
      fields: fields,
    });
    setShowImportModal(false);
    setImportScript("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        parseImportedScript(content);
      };
      reader.readAsText(file);
    }
  };

  const clearEmbed = () => {
    setEmbedData({
      content: "",
      color: "#5865F2",
      url: "",
      title: "",
      description: "",
      authorName: "",
      authorIcon: "",
      authorUrl: "",
      thumbnailUrl: "",
      imageUrl: "",
      footerText: "",
      footerIcon: "",
      timestamp: false,
      deleteAfter: "",
      buttons: [],
      fields: [],
    });
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map(line => {
        if (line.startsWith('### ')) return `<h3 class="text-[15px] font-semibold leading-[1.375]">${line.slice(4)}</h3>`;
        if (line.startsWith('## ')) return `<h2 class="text-base font-semibold leading-[1.375]">${line.slice(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1 class="text-lg font-semibold leading-[1.375]">${line.slice(2)}</h1>`;
        if (line.startsWith('> ')) return `<div class="border-l-[3px] border-[#4e5058] pl-3 text-[#b5bac1]">${line.slice(2)}</div>`;
        if (line.startsWith('-# ')) return `<div class="text-xs text-[#949ba4]">${line.slice(3)}</div>`;
        return line;
      })
      .join('<br />')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<u>$1</u>')
      .replace(/~~(.+?)~~/g, '<del class="text-[#949ba4]">$1</del>')
      .replace(/`([^`]+)`/g, '<code class="px-[0.4em] py-[0.2em] rounded-[3px] bg-[#2b2d31] text-[#e1e3e6] text-[0.85em] font-mono">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#00a8fc] hover:underline" target="_blank">$1</a>');
  };

  const hasEmbed = embedData.title || embedData.description || embedData.authorName || 
                   embedData.thumbnailUrl || embedData.imageUrl || embedData.footerText;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation isDark={isDark} setIsDark={setIsDark} />

      <main className="max-w-[1800px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Embed Builder
          </motion.h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              <Upload size={16} />
              Import Script
            </button>
            <button
              onClick={clearEmbed}
              className="px-4 py-2 border border-white/20 hover:border-white/50 bg-gray-900/50 hover:bg-gray-900 rounded-lg text-sm font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Side - Discord-like Preview */}
          <div className="space-y-4">
            {/* Discord Channel Header */}
            <div className="bg-[#313338] rounded-lg overflow-hidden border border-[#1e1f22] shadow-xl">
              <div className="h-12 bg-[#313338] border-b border-[#1e1f22] flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Hash size={20} className="text-[#80848e]" />
                  <span className="font-semibold text-white">general</span>
                </div>
                <div className="flex items-center gap-4 text-[#b5bac1]">
                  <Bell size={20} className="cursor-pointer hover:text-white" />
                  <Pin size={20} className="cursor-pointer hover:text-white" />
                  <Users size={20} className="cursor-pointer hover:text-white" />
                  <div className="w-px h-5 bg-[#3f4147]" />
                  <div className="flex items-center bg-[#1e1f22] rounded px-2 py-1">
                    <span className="text-xs text-[#949ba4]">Search</span>
                  </div>
                  <Inbox size={20} className="cursor-pointer hover:text-white" />
                  <HelpCircle size={20} className="cursor-pointer hover:text-white" />
                </div>
              </div>

              {/* Discord Chat Area */}
              <div className="bg-[#313338] min-h-[500px] max-h-[600px] overflow-y-auto">
                <div className="px-4 py-4">
                  {/* Message */}
                  <div className="group flex hover:bg-[#2e3035] rounded px-2 py-0.5 -mx-2">
                    {/* Avatar */}
                    <div className="flex-shrink-0 mr-4 mt-0.5">
                      <img 
                        src={isValidUrl(botInfo.avatar) ? botInfo.avatar : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                        alt={botInfo.name}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                        }}
                      />
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {/* Username & Timestamp */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#f2f3f5] hover:underline cursor-pointer">{botInfo.name}</span>
                        <span className="px-1 py-0.5 bg-[#5865F2] rounded text-[10px] font-medium text-white">BOT</span>
                        <span className="text-xs text-[#949ba4]">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Text Content */}
                      {embedData.content && (
                        <div 
                          className="mt-1 text-[#dbdee1] text-[0.9375rem] leading-[1.375rem] break-words"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(embedData.content) }}
                        />
                      )}

                      {/* Embed */}
                      {hasEmbed && (
                        <div 
                          className="mt-2 max-w-[520px] rounded overflow-hidden border-l-4 bg-[#2b2d31]"
                          style={{ borderColor: embedData.color || '#5865F2' }}
                        >
                          <div className="p-4 grid gap-2" style={{ gridTemplateColumns: embedData.thumbnailUrl ? '1fr 80px' : '1fr' }}>
                            <div className="min-w-0">
                              {/* Author */}
                              {embedData.authorName && (
                                <div className="flex items-center gap-2 mb-1">
                                  {isValidUrl(embedData.authorIcon) && (
                                    <img 
                                      src={embedData.authorIcon} 
                                      alt="" 
                                      className="w-6 h-6 rounded-full"
                                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                    />
                                  )}
                                  <span 
                                    className="text-sm font-medium text-white"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(embedData.authorName) }}
                                  />
                                </div>
                              )}

                              {/* Title */}
                              {embedData.title && (
                                <div 
                                  className="text-[#00a8fc] font-semibold hover:underline cursor-pointer"
                                  dangerouslySetInnerHTML={{ __html: renderMarkdown(embedData.title) }}
                                />
                              )}

                              {/* Description */}
                              {embedData.description && (
                                <div 
                                  className="mt-2 text-sm text-[#dbdee1] whitespace-pre-wrap break-words"
                                  dangerouslySetInnerHTML={{ __html: renderMarkdown(embedData.description) }}
                                />
                              )}

                              {/* Fields */}
                              {embedData.fields && embedData.fields.length > 0 && (
                                <div className={`mt-2 grid gap-2 ${embedData.fields.some(f => f.inline) ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
                                  {embedData.fields.map((field, index) => (
                                    <div key={index} className={field.inline ? 'col-span-1' : 'col-span-3'}>
                                      <div 
                                        className="font-semibold text-sm text-white mb-1"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(field.name) }}
                                      />
                                      <div 
                                        className="text-sm text-[#dbdee1] whitespace-pre-wrap break-words"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(field.value) }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Thumbnail */}
                            {isValidUrl(embedData.thumbnailUrl) && (
                              <div className="flex-shrink-0">
                                <img 
                                  src={embedData.thumbnailUrl} 
                                  alt="" 
                                  className="w-20 h-20 rounded object-cover"
                                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                />
                              </div>
                            )}
                          </div>

                          {/* Image */}
                          {isValidUrl(embedData.imageUrl) && (
                            <div className="px-4 pb-4">
                              <img 
                                src={embedData.imageUrl} 
                                alt="" 
                                className="max-w-full rounded max-h-[300px] object-contain"
                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                              />
                            </div>
                          )}

                          {/* Footer */}
                          {(embedData.footerText || embedData.timestamp) && (
                            <div className="px-4 pb-3 flex items-center gap-2 text-xs text-[#949ba4]">
                              {isValidUrl(embedData.footerIcon) && (
                                <img 
                                  src={embedData.footerIcon} 
                                  alt="" 
                                  className="w-5 h-5 rounded-full"
                                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                />
                              )}
                              {embedData.footerText && (
                                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(embedData.footerText) }} />
                              )}
                              {embedData.footerText && embedData.timestamp && <span>•</span>}
                              {embedData.timestamp && <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Buttons */}
                      {embedData.buttons && embedData.buttons.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {embedData.buttons.map((button, index) => {
                            let bgColor = 'bg-[#4e5058]';
                            let hoverColor = 'hover:bg-[#6d6f78]';

                            if (button.style === 'primary' || button.style === 'blurple') {
                              bgColor = 'bg-[#5865F2]';
                              hoverColor = 'hover:bg-[#4752c4]';
                            } else if (button.style === 'success' || button.style === 'green') {
                              bgColor = 'bg-[#248046]';
                              hoverColor = 'hover:bg-[#1a6334]';
                            } else if (button.style === 'danger' || button.style === 'red' || button.style === 'error') {
                              bgColor = 'bg-[#da373c]';
                              hoverColor = 'hover:bg-[#a12d31]';
                            } else if (button.style === 'link') {
                              bgColor = 'bg-[#4e5058]';
                              hoverColor = 'hover:bg-[#6d6f78]';
                            }

                            const isDisabled = !buttonsEnabled || button.disabled;

                            return (
                              <button
                                key={index}
                                disabled={isDisabled}
                                className={`px-4 py-2 ${bgColor} ${isDisabled ? 'opacity-50 cursor-not-allowed' : hoverColor} rounded text-sm font-medium text-white transition-colors flex items-center gap-1.5 min-h-[32px]`}
                                onClick={!isDisabled && button.style === 'link' && button.url ? () => window.open(button.url, '_blank') : undefined}
                              >
                                {button.emoji && <span>{button.emoji}</span>}
                                <span>{button.label || 'Button'}</span>
                                {button.style === 'link' && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                                    <path d="M10 5V3H5.375C4.06519 3 3 4.06519 3 5.375V18.625C3 19.936 4.06519 21 5.375 21H18.625C19.936 21 21 19.936 21 18.625V14H19V19H5V5H10Z" />
                                    <path d="M21 2.99902H14V4.99902H17.586L9.29297 13.292L10.707 14.706L19 6.41302V9.99902H21V2.99902Z" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discord Input Bar */}
              <div className="h-16 bg-[#383a40] mx-4 mb-6 rounded-lg flex items-center px-4 gap-4">
                <button className="text-[#b5bac1] hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.00098C6.486 2.00098 2 6.48698 2 12.001C2 17.515 6.486 22.001 12 22.001C17.514 22.001 22 17.515 22 12.001C22 6.48698 17.514 2.00098 12 2.00098ZM17 13.001H13V17.001H11V13.001H7V11.001H11V7.00098H13V11.001H17V13.001Z" />
                  </svg>
                </button>
                <div className="flex-1 text-[#949ba4] text-sm">Message #general</div>
                <div className="flex items-center gap-4 text-[#b5bac1]">
                  <Gift size={20} className="cursor-pointer hover:text-white" />
                  <Sticker size={20} className="cursor-pointer hover:text-white" />
                  <Smile size={20} className="cursor-pointer hover:text-white" />
                </div>
              </div>
            </div>

            {/* Generated Script */}
            <div className="border border-white/10 bg-gray-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Generated Script</h2>
                <div className="flex items-center gap-3">
                  <div className={`text-xs font-medium ${isOverLimit ? 'text-red-400' : characterCount > 5000 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {characterCount} / 6000 chars
                  </div>
                  <button
                    onClick={copyScript}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              {isOverLimit && (
                <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                  ⚠️ Script exceeds Discord's 6000 character limit! Please reduce content.
                </div>
              )}
              <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-gray-300 break-all max-h-32 overflow-y-auto border border-white/5">
                {generatedScript || "Configure your embed to generate a script..."}
              </div>
            </div>
          </div>

          {/* Right Side - Settings */}
          <div className="border border-white/10 bg-gray-900/30 rounded-lg p-6 h-fit">
            <h2 className="text-lg font-semibold text-white mb-6">Embed Settings</h2>

            <div className="space-y-6">
              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message Content</label>
                <textarea
                  value={embedData.content}
                  onChange={(e) => setEmbedData({ ...embedData, content: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
                  placeholder="Message content (outside embed)"
                  rows={3}
                />
              </div>

              {/* Color & Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Embed Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={embedData.color}
                      onChange={(e) => setEmbedData({ ...embedData, color: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={embedData.color}
                      onChange={(e) => setEmbedData({ ...embedData, color: e.target.value })}
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="#5865F2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={embedData.title}
                    onChange={(e) => setEmbedData({ ...embedData, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30"
                    placeholder="Embed title"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  value={embedData.description}
                  onChange={(e) => setEmbedData({ ...embedData, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
                  placeholder="Embed description (supports markdown)"
                  rows={4}
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Author</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={embedData.authorName}
                    onChange={(e) => setEmbedData({ ...embedData, authorName: e.target.value })}
                    className="px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30"
                    placeholder="Author name"
                  />
                  <input
                    type="text"
                    value={embedData.authorIcon}
                    onChange={(e) => setEmbedData({ ...embedData, authorIcon: e.target.value })}
                    className="px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30"
                    placeholder="Author icon URL"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Images</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={embedData.thumbnailUrl}
                    onChange={(e) => setEmbedData({ ...embedData, thumbnailUrl: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30"
                    placeholder="Thumbnail URL (small image, top right)"
                  />
                  <input
                    type="text"
                    value={embedData.imageUrl}
                    onChange={(e) => setEmbedData({ ...embedData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30"
                    placeholder="Image URL (large image)"
                  />
                </div>
              </div>

              {/* Footer */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Footer</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={embedData.footerText}
                    onChange={(e) => setEmbedData({ ...embedData, footerText: e.target.value })}
                    className="px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30"
                    placeholder="Footer text"
                  />
                  <input
                    type="text"
                    value={embedData.footerIcon}
                    onChange={(e) => setEmbedData({ ...embedData, footerIcon: e.target.value })}
                    className="px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30"
                    placeholder="Footer icon URL"
                  />
                </div>
              </div>

              {/* Timestamp */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={embedData.timestamp}
                    onChange={(e) => setEmbedData({ ...embedData, timestamp: e.target.checked })}
                    className="w-4 h-4 rounded bg-black/40 border-white/20 text-white focus:ring-white/30"
                  />
                  <span className="text-sm text-white">Include Timestamp</span>
                </label>
              </div>

              {/* Fields */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-400">Fields</label>
                  <button
                    onClick={() => {
                      if (embedData.fields.length < 25) {
                        setEmbedData({
                          ...embedData,
                          fields: [...embedData.fields, { name: "", value: "", inline: false }]
                        });
                      }
                    }}
                    className="px-3 py-1 bg-white text-black hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    + Add Field
                  </button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {embedData.fields.map((field, index) => (
                    <div key={index} className="p-3 bg-black/40 border border-white/10 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-400">Field {index + 1}</span>
                        <button
                          onClick={() => {
                            const newFields = embedData.fields.filter((_, i) => i !== index);
                            setEmbedData({ ...embedData, fields: newFields });
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...embedData.fields];
                            newFields[index].name = e.target.value;
                            setEmbedData({ ...embedData, fields: newFields });
                          }}
                          className="w-full px-2.5 py-1.5 bg-gray-900/50 border border-white/10 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-white/30"
                          placeholder="Field Name"
                        />
                        <textarea
                          value={field.value}
                          onChange={(e) => {
                            const newFields = [...embedData.fields];
                            newFields[index].value = e.target.value;
                            setEmbedData({ ...embedData, fields: newFields });
                          }}
                          className="w-full px-2.5 py-1.5 bg-gray-900/50 border border-white/10 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
                          placeholder="Field Value"
                          rows={2}
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.inline}
                            onChange={(e) => {
                              const newFields = [...embedData.fields];
                              newFields[index].inline = e.target.checked;
                              setEmbedData({ ...embedData, fields: newFields });
                            }}
                            className="w-4 h-4 rounded bg-black/40 border-white/20 text-white focus:ring-white/30"
                          />
                          <span className="text-xs text-gray-400">Inline (display side-by-side)</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  {embedData.fields.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No fields added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-400">Buttons</label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buttonsEnabled}
                        onChange={(e) => setButtonsEnabled(e.target.checked)}
                        className="w-4 h-4 rounded bg-black/40 border-white/20 text-white focus:ring-white/30"
                      />
                      <span className="text-xs text-white">Enabled</span>
                    </label>
                    <button
                      onClick={() => {
                        if (embedData.buttons.length < 25) {
                          setEmbedData({
                            ...embedData,
                            buttons: [...embedData.buttons, { label: "", style: "secondary", url: "", emoji: "", row: 0, disabled: false }]
                          });
                        }
                      }}
                      className="px-3 py-1 bg-white text-black hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      + Add Button
                    </button>
                  </div>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {embedData.buttons.map((button, index) => (
                    <div key={index} className="p-3 bg-black/40 border border-white/10 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-400">Button {index + 1}</span>
                        <button
                          onClick={() => {
                            const newButtons = embedData.buttons.filter((_, i) => i !== index);
                            setEmbedData({ ...embedData, buttons: newButtons });
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={button.label}
                          onChange={(e) => {
                            const newButtons = [...embedData.buttons];
                            newButtons[index].label = e.target.value;
                            setEmbedData({ ...embedData, buttons: newButtons });
                          }}
                          className="px-2.5 py-1.5 bg-gray-900/50 border border-white/10 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-white/30"
                          placeholder="Label"
                        />
                        <select
                          value={button.style}
                          onChange={(e) => {
                            const newButtons = [...embedData.buttons];
                            newButtons[index].style = e.target.value;
                            setEmbedData({ ...embedData, buttons: newButtons });
                          }}
                          className="px-2.5 py-1.5 bg-gray-900/50 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-white/30"
                        >
                          <option value="primary">Blurple</option>
                          <option value="secondary">Grey</option>
                          <option value="success">Green</option>
                          <option value="danger">Red</option>
                          <option value="link">Link</option>
                        </select>
                        <input
                          type="text"
                          value={button.url}
                          onChange={(e) => {
                            const newButtons = [...embedData.buttons];
                            newButtons[index].url = e.target.value;
                            setEmbedData({ ...embedData, buttons: newButtons });
                          }}
                          className="px-2.5 py-1.5 bg-gray-900/50 border border-white/10 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-white/30"
                          placeholder="URL (for link buttons)"
                        />
                        <input
                          type="text"
                          value={button.emoji}
                          onChange={(e) => {
                            const newButtons = [...embedData.buttons];
                            newButtons[index].emoji = e.target.value;
                            setEmbedData({ ...embedData, buttons: newButtons });
                          }}
                          className="px-2.5 py-1.5 bg-gray-900/50 border border-white/10 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-white/30"
                          placeholder="Emoji"
                        />
                        <div className="col-span-2 flex items-center gap-2 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={button.disabled}
                              onChange={(e) => {
                                const newButtons = [...embedData.buttons];
                                newButtons[index].disabled = e.target.checked;
                                setEmbedData({ ...embedData, buttons: newButtons });
                              }}
                              className="w-4 h-4 rounded bg-black/40 border-white/20 text-white focus:ring-white/30"
                            />
                            <span className="text-xs text-gray-400">Disable this button</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {embedData.buttons.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No buttons added yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowImportModal(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-lg w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-4">Import Embed Script</h3>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-white/20 rounded-lg hover:border-white/50 transition-colors flex flex-col items-center gap-2 text-gray-400 hover:text-white"
                >
                  <Upload size={32} />
                  <span className="text-sm">Click to upload a script file (.txt or .json)</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Paste Script */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Paste Script</label>
                <textarea
                  value={importScript}
                  onChange={(e) => setImportScript(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none font-mono"
                  placeholder="Paste your embed script here..."
                  rows={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2.5 border border-white/20 hover:border-white/50 bg-gray-900/50 hover:bg-gray-900 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => parseImportedScript(importScript)}
                  disabled={!importScript.trim()}
                  className="flex-1 py-2.5 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

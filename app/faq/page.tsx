"use client"

import { useState } from "react"
import Navigation from "../components/Navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useSiteConfig } from "@/lib/site-config"

interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const [isDark, setIsDark] = useState(true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { config } = useSiteConfig()

  const faqs: FAQItem[] = [
    {
      question: "How many commands does the bot have?",
      answer: "The bot has 400+ commands across 30+ feature categories including moderation, leveling, giveaways, automation, and entertainment - all available as both slash commands and prefix commands for full flexibility",
    },
    {
      question: "What are the main features?",
      answer: "The bot includes AntiNuke (raid protection), AutoMod (spam/invite filtering), Leveling system with rank cards, Giveaways, Welcome/Leave messages, Tags, AFK status, Emojiboard, Server analytics, Role management, guild tag roles",
    },
    {
      question: "Is the bot open source?",
      answer: "No, the bot is closed source. However, the website is open for customization and feedback.",
    },
    {
      question: "Support server link?",
      answer: "Join our Discord server for support, bug reports, and feature requests. Link available in the Discord menu.",
    },
    {
      question: "How do I change the bot's prefix?",
      answer: "Use prefixes add [prefix] to add custom prefixes. Requires Manage Server permission. You can have multiple prefixes active.",
    },
    {
      question: "Why isn't the bot responding to my commands?",
      answer: "Check that: 1) The bot has proper permissions in the channel, 2) You're using the correct prefix or slash command, 3) The command name is spelled correctly. Use /help to see all available commands.",
    },
    {
      question: "How do I report a bug or request a feature?",
      answer: "Join the support server and simply ask. The developer actively reviews all suggestions.",
    },
    {
      question: "Does the bot store my messages?",
      answer: "The bot stores minimal data: moderation logs (warnings, bans), temporary snipe data, server settings, and leveling stats. See Privacy Policy for full details.",
    },
    {
      question: "What permissions does the bot need?",
      answer: "The bot works best with Administrator permission for full functionality, but is not recommended, and giving it to this bot or any bot in general isn't recommended. For specific features, it needs: Manage Messages (for moderation), Manage Roles (for role assignment), Send Messages, Embed Links, and Attach Files.",
    },
    {
      question: "How do I set up AntiNuke protection?",
      answer: "Use /antinuke logchannel to set a log channel, then configure /antinuke modules to enable protections like channel/role/webhook monitoring. Set punishment levels and whitelist trusted admins.",
    },
    {
      question: "What's the difference between ban, hardban, and softban?",
      answer: "Ban = Standard ban (can be unbanned). Hardban = Only bot owner can unban (permanent). Softban = Ban then immediately unban (used to clear user messages). Use /ban, /hardban, or /softban accordingly.",
    },
    {
      question: "How does the leveling system work?",
      answer: "Users gain XP from messages. Reach XP thresholds to level up. Configure role rewards at specific levels using /level. Rank cards display user level, XP progress, and server stats.",
    },
    {
      question: "Is the bot free to use?",
      answer: "Yes! All 611+ commands and features are completely free. No premium tiers or paywalls.",
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <Navigation isDark={isDark} setIsDark={setIsDark} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"} mb-12`}>
            Find answers to common questions about {config.botName}
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`border ${isDark ? "border-white/10 bg-gray-900/30" : "border-black/10 bg-gray-100/30"} rounded-lg overflow-hidden`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full px-6 py-4 text-left flex justify-between items-center ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"} transition-colors`}
              >
                <span className="font-semibold text-lg pr-4">{faq.question}</span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl flex-shrink-0"
                >
                  ↓
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`px-6 py-4 border-t ${isDark ? "border-white/10 bg-black/20 text-gray-300" : "border-black/10 bg-white/20 text-gray-700"}`}
                    >
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-4`}>
            Still have questions? Join our support server!
          </p>
          <Link
            href="/discord"
            className={`inline-block px-6 py-3 ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"} rounded-lg transition-all duration-200 font-medium`}
          >
            Join Discord Server
          </Link>
        </motion.div>
      </main>
    </div>
  )
}

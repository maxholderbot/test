"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Navigation from "./components/Navigation"
import FeatureCards from "./components/FeatureCards"
import Link from "next/link"
import { useSiteConfig } from "@/lib/site-config"
import * as Icons from "lucide-react"

export default function Home() {
  const { data: session } = useSession()
  const { config, loading: configLoading } = useSiteConfig()
  const [guilds, setGuilds] = useState<any[]>([])
  const [loadingGuilds, setLoadingGuilds] = useState(false)

  useEffect(() => {
    if (session) {
      setLoadingGuilds(true)
      fetch("/api/guilds")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setGuilds(data)
          }
        })
        .catch((err) => console.error("Failed to fetch guilds:", err))
        .finally(() => setLoadingGuilds(false))
    }
  }, [session])

  const navLinks = [
    { href: "/commands", label: "Commands", icon: Icons.Zap },
    { href: "/status", label: "Status", icon: Icons.CheckCircle },
    { href: "/embed-builder", label: "Embed Builder", icon: Icons.Palette },
    { href: "/discord", label: "Discord", icon: Icons.MessageCircle },
    { href: "/faq", label: "FAQ", icon: Icons.HelpCircle },
  ]

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-radial from-[#1B1B1B] to-[#000000]">
        <Navigation isDark={true} setIsDark={() => {}} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#CECECE]/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Ambient glow overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-[#CECECE]/5 via-transparent to-transparent pointer-events-none" />

        {/* Main Hero */}
        <main className="relative max-w-6xl mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center">
          <motion.div className="text-center max-w-2xl mx-auto">
            {/* Bot Avatar */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="w-32 h-32 mx-auto rounded-2xl p-1 bg-gradient-to-br from-[#FAFAFA] to-[#CECECE] rim-light shadow-2xl">
                <img
                  src={config.botLogo}
                  alt="Bot"
                  className="w-full h-full rounded-xl bg-[#1B1B1B]"
                />
              </div>
            </motion.div>

            {/* Bot Name */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-br from-[#FAFAFA] to-[#CECECE] bg-clip-text text-transparent"
            >
              {config.botName}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl mb-12 text-[#CECECE]"
            >
              {config.tagline}
            </motion.p>

            {/* Navigation Grid */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12"
            >
              {navLinks.map((link, idx) => {
                const Icon = link.icon
                return (
                  <motion.div
                    key={link.href}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all bg-[#1B1B1B]/80 border border-[#CECECE]/20 hover:border-[#CECECE]/50 hover:bg-[#1B1B1B] text-[#FAFAFA] soft-bevel rim-light"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{link.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Feature Cards */}
            <FeatureCards isDark={true} />

            {/* Login or Guild List */}
            {!session ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Link
                  href="/api/auth/signin"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-[#FAFAFA] to-[#CECECE] hover:from-[#CECECE] hover:to-[#FAFAFA] text-[#000000] rim-light shadow-lg"
                >
                  <Icons.LogIn className="w-4 h-4" />
                  Login with Discord
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-[#FAFAFA]">
                  Your Servers
                </h2>
                {loadingGuilds ? (
                  <p className="text-[#CECECE]">Loading...</p>
                ) : guilds.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {guilds.map((guild) => (
                      <motion.div
                        key={guild.id}
                        whileHover={{ scale: 1.1 }}
                        className="relative group"
                      >
                        {guild.icon ? (
                          <img
                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`}
                            alt={guild.name}
                            className="w-14 h-14 rounded-xl"
                            title={guild.name}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold bg-gray-800">
                            {guild.name[0]}
                          </div>
                        )}
                        <div className="absolute bottom-full mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800">
                          {guild.name}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#CECECE]">No mutual servers</p>
                )}
              </motion.div>
            )}

            {/* Footer Links */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-16 flex gap-4 justify-center"
            >
              <Link
                href="/tos"
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all border border-[#CECECE]/20 hover:border-[#CECECE]/50 bg-[#1B1B1B]/50 hover:bg-[#1B1B1B]/80 text-[#CECECE]"
              >
                <Icons.FileText className="w-4 h-4" />
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all border border-[#CECECE]/20 hover:border-[#CECECE]/50 bg-[#1B1B1B]/50 hover:bg-[#1B1B1B]/80 text-[#CECECE]"
              >
                <Icons.ShieldAlert className="w-4 h-4" />
                Privacy Policy
              </Link>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </>
  )
}

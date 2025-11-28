"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/lib/site-config";

interface Stats {
  servers: number;
  users: number;
  uptime: string;
  latency?: string;
  status: string;
}

export default function Status() {
  const { config } = useSiteConfig();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = stats ? [
    { label: "Servers", value: stats.servers.toLocaleString(), icon: "server" },
    { label: "Users", value: stats.users.toLocaleString(), icon: "users" },
    { label: "Uptime", value: stats.uptime, icon: "clock" },
    { label: "Status", value: stats.status, icon: "status" }
  ] : [];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation isDark={true} setIsDark={() => {}} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>Bot Status</h1>
          <p className={`text-lg mb-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Real-time statistics and bot health information
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-lg text-gray-400">
              Loading statistics...
            </p>
          </div>
        ) : stats ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {statCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="p-6 rounded-xl border transition-all duration-200 border-white/10 hover:border-white/30 hover:bg-white/5"
              >
                <div className="text-sm font-medium mb-2 text-gray-400">
                  {card.label}
                </div>
                <div className="text-3xl font-bold mb-1 text-white">
                  {card.value}
                </div>
                {card.label === "Status" && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${stats.status === "Online" ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
                    <span className="text-xs text-gray-500">
                      Last updated: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Unable to fetch bot statistics</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 p-6 rounded-xl border border-white/10 bg-white/5"
        >
          <h2 className="text-xl font-bold mb-3 text-white">About {config.botName}</h2>
          <p className="text-gray-400 leading-relaxed">
            {config.botName} is a powerful Discord bot with comprehensive moderation, automation, and engagement features. The statistics above reflect real-time data from your bot instance.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { BriefcaseIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface DashboardStatsData {
  totalApplications: number
  statusCounts: Record<string, number>
  priorityCounts: Record<string, number>
  monthlyData: Record<string, { total: number; offers: number; rejections: number }>
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Theme-based classes
  const cardClasses = isDark ? 'bg-gray-800' : 'bg-white'
  const textClasses = isDark ? 'text-white' : 'text-gray-900'
  const secondaryTextClasses = isDark ? 'text-gray-400' : 'text-gray-600'
  const loadingBgClasses = isDark ? 'bg-gray-700' : 'bg-gray-200'

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${cardClasses} p-6 rounded-lg shadow animate-pulse`}>
            <div className={`h-4 ${loadingBgClasses} rounded w-3/4 mb-2`}></div>
            <div className={`h-8 ${loadingBgClasses} rounded w-1/2`}></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return <div className={textClasses}>Failed to load statistics</div>
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: BriefcaseIcon,
      color: 'blue',
    },
    {
      title: 'Pending',
      value: (stats.statusCounts.APPLIED || 0) + (stats.statusCounts.PHONE_SCREENING || 0) + 
             (stats.statusCounts.TECHNICAL_INTERVIEW || 0) + (stats.statusCounts.ONSITE_INTERVIEW || 0) +
             (stats.statusCounts.FINAL_INTERVIEW || 0),
      icon: ClockIcon,
      color: 'yellow',
    },
    {
      title: 'Offers',
      value: stats.statusCounts.OFFER || 0,
      icon: CheckCircleIcon,
      color: 'green',
    },
    {
      title: 'Rejected',
      value: stats.statusCounts.REJECTED || 0,
      icon: XCircleIcon,
      color: 'red',
    },
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
      case 'yellow':
        return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
      case 'green':
        return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
      case 'red':
        return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
      default:
        return isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div key={index} className={`${cardClasses} p-6 rounded-lg shadow`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${secondaryTextClasses}`}>{card.title}</p>
              <p className={`text-2xl font-bold ${textClasses}`}>{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

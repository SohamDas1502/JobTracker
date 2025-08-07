'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

interface AnalyticsData {
  totalApplications: number
  statusCounts: Record<string, number>
  priorityCounts: Record<string, number>
  monthlyData: Record<string, { total: number; offers: number; rejections: number }>
  recentApplications: Array<{
    id: string
    company: string
    position: string
    status: string
    appliedDate: string
  }>
}

interface StatusData {
  name: string
  value: number
  color: string
}

interface PriorityData {
  name: string
  value: number
  color: string
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isDark } = useTheme()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        setError('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusData = (): StatusData[] => {
    if (!analytics?.statusCounts) return []
    
    const statusColors: Record<string, string> = {
      'APPLIED': '#3B82F6',
      'PHONE_SCREENING': '#F59E0B',
      'TECHNICAL_INTERVIEW': '#EF4444',
      'ONSITE_INTERVIEW': '#8B5CF6',
      'FINAL_INTERVIEW': '#06B6D4',
      'OFFER': '#10B981',
      'REJECTED': '#6B7280',
      'WITHDRAWN': '#374151'
    }

    return Object.entries(analytics.statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      color: statusColors[status] || '#6B7280'
    }))
  }

  const getPriorityData = (): PriorityData[] => {
    if (!analytics?.priorityCounts) return []
    
    const priorityColors: Record<string, string> = {
      'HIGH': '#EF4444',
      'MEDIUM': '#F59E0B',
      'LOW': '#6B7280'
    }

    return Object.entries(analytics.priorityCounts).map(([priority, count]) => ({
      name: priority,
      value: count,
      color: priorityColors[priority] || '#6B7280'
    }))
  }

  const getMonthlyChartData = () => {
    if (!analytics?.monthlyData) return []
    
    return Object.entries(analytics.monthlyData)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort by month
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        'Total Applications': data.total,
        'Offers': data.offers,
        'Rejections': data.rejections,
        'Success Rate': data.total > 0 ? Math.round((data.offers / data.total) * 100) : 0
      }))
  }

  const calculateMetrics = () => {
    if (!analytics) return { successRate: 0, responseRate: 0, avgTimeToResponse: 0 }
    
    const total = analytics.totalApplications
    const offers = analytics.statusCounts.OFFER || 0
    const responses = Object.entries(analytics.statusCounts)
      .filter(([status]) => !['APPLIED'].includes(status))
      .reduce((sum, [, count]) => sum + count, 0)
    
    const successRate = total > 0 ? Math.round((offers / total) * 100) : 0
    const responseRate = total > 0 ? Math.round((responses / total) * 100) : 0
    
    return { successRate, responseRate, avgTimeToResponse: 0 }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          <button
            onClick={fetchAnalytics}
            className={`hover:opacity-80 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No analytics data available</p>
        </div>
      </DashboardLayout>
    )
  }

  const statusData = getStatusData()
  const priorityData = getPriorityData()
  const monthlyData = getMonthlyChartData()
  const metrics = calculateMetrics()

  return (
    <DashboardLayout>
      <style jsx global>{`
        :root {
          --text-color: ${isDark ? '#d1d5db' : '#374151'};
          --grid-color: ${isDark ? '#4b5563' : '#e5e7eb'};
          --tooltip-bg: ${isDark ? '#374151' : '#ffffff'};
          --tooltip-border: ${isDark ? '#4b5563' : '#e5e7eb'};
          --tooltip-text: ${isDark ? '#f3f4f6' : '#374151'};
        }
      `}</style>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Insights into your job application progress</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Applications</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.totalApplications}</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{metrics.successRate}%</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'
                }`}>
                  <span className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>📞</span>
                </div>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Response Rate</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{metrics.responseRate}%</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}>
                  <span className={`font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Offers</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.statusCounts.OFFER || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Status Distribution */}
          <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Application Status Distribution</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '6px',
                      color: 'var(--tooltip-text)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-[300px] flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No data available
              </div>
            )}
          </div>

          {/* Priority Distribution */}
          <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Priority Distribution</h3>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-color)' }} />
                  <YAxis tick={{ fill: 'var(--text-color)' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '6px',
                      color: 'var(--tooltip-text)'
                    }}
                  />
                  <Bar dataKey="value" fill="#8884d8">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-[300px] flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trends */}
        {monthlyData.length > 0 && (
          <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Monthly Application Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-color)' }} />
                <YAxis tick={{ fill: 'var(--text-color)' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '6px',
                    color: 'var(--tooltip-text)'
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
                <Line 
                  type="monotone" 
                  dataKey="Total Applications" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Offers" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Rejections" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Success Rate Trend */}
        {monthlyData.length > 0 && (
          <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Success Rate Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-color)' }} />
                <YAxis tick={{ fill: 'var(--text-color)' }} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Success Rate']}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '6px',
                    color: 'var(--tooltip-text)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Success Rate" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Activity */}
        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Applications</h3>
          {analytics.recentApplications && analytics.recentApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Company
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Position
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Applied Date
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark 
                    ? 'bg-gray-800 divide-gray-700' 
                    : 'bg-white divide-gray-200'
                }`}>
                  {analytics.recentApplications.map((app) => (
                    <tr key={app.id}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {app.company}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {app.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isDark 
                            ? 'bg-blue-900/30 text-blue-400' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No applications yet
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

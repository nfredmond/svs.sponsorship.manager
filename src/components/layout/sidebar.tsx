'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Heart,
  FileText,
  Settings,
  LogOut,
  UserPlus,
  ListFilter,
  Archive,
  FileCheck,
  Clock,
  Gift,
  BarChart3,
  FileBarChart,
  FileSpreadsheet,
  Calendar,
  Mail,
  Tag,
  RefreshCw,
  Contact,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Sponsors',
    icon: Users,
    children: [
      { name: 'All Sponsors', href: '/sponsors', icon: ListFilter },
      { name: 'Add New Sponsor', href: '/sponsors/new', icon: UserPlus },
      { name: 'Archived Sponsors', href: '/sponsors/archived', icon: Archive },
    ],
  },
  { name: 'Contacts', href: '/contacts', icon: Contact },
  {
    name: 'Sponsorships',
    icon: DollarSign,
    children: [
      { name: 'All Sponsorships', href: '/sponsorships', icon: ListFilter },
      { name: 'Add New Sponsorship', href: '/sponsorships/new', icon: DollarSign },
      { name: 'Pending Payments', href: '/sponsorships/pending', icon: Clock },
      { name: 'Overdue Items', href: '/sponsorships/overdue', icon: FileCheck },
    ],
  },
  { name: 'Renewal Pipeline', href: '/renewals', icon: RefreshCw },
  { name: 'Events', href: '/events', icon: Calendar },
  {
    name: 'Individual Donations',
    icon: Heart,
    children: [
      { name: 'All Donations', href: '/donations', icon: Gift },
      { name: 'Add New Donation', href: '/donations/new', icon: Heart },
    ],
  },
  {
    name: 'Reports',
    icon: FileText,
    children: [
      { name: 'Fiscal Year Summary', href: '/reports/fiscal-year', icon: FileBarChart },
      { name: 'By Tier Analysis', href: '/reports/by-tier', icon: BarChart3 },
      { name: 'Payment Timeline', href: '/reports/payment-timeline', icon: Clock },
      { name: 'Scot Mende Fund', href: '/reports/scot-mende', icon: Heart },
      { name: 'Custom Reports', href: '/reports/custom', icon: FileSpreadsheet },
    ],
  },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'General Settings', href: '/settings', icon: Settings },
      { name: 'Fiscal Years', href: '/settings/fiscal-years', icon: Calendar },
      { name: 'Email Templates', href: '/settings/email-templates', icon: Mail },
      { name: 'Tags', href: '/settings/tags', icon: Tag },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-200 dark:border-gray-800">
        <Image
          src="/logo.jpg"
          alt="SVS APA"
          width={40}
          height={40}
          className="rounded"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">SVS APA</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">Sponsorship Tracker</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
                <div className="ml-6 space-y-1">
                  {item.children.map((child) => {
                    const isActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                          isActive
                            ? 'bg-svs-gold/10 text-svs-brown dark:text-svs-gold font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <child.icon className="h-4 w-4" />
                        {child.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          }

          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                isActive
                  ? 'bg-svs-gold/10 text-svs-brown dark:text-svs-gold font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <form action="/auth/logout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  )
}


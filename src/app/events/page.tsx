import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatDateShort } from '@/lib/utils'
import { Calendar, MapPin, Users, Video, Plus, Edit } from 'lucide-react'
import Link from 'next/link'
import type { Event } from '@/types/database'

async function getEvents() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })

  return events || []
}

function getEventTypeColor(eventType: string) {
  switch (eventType) {
    case 'Awards Ceremony':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'Speaker Series':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'Training':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'Networking':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'Conference':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

export default async function EventsPage() {
  const events = await getEvents()

  const upcomingEvents = events.filter(
    e => e.event_date && new Date(e.event_date) >= new Date()
  )

  const pastEvents = events.filter(
    e => e.event_date && new Date(e.event_date) < new Date()
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Events</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage events and track sponsor benefits usage
            </p>
          </div>
          <Button className="bg-svs-gold hover:bg-svs-gold/90">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{events.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-svs-blue">{upcomingEvents.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Past Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                {pastEvents.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                This Fiscal Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {events.filter(e => e.fiscal_year === '2025/26').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Upcoming Events
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvents.map(event => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-svs-gold" />
                          <CardTitle className="text-lg">{event.event_name}</CardTitle>
                        </div>
                        {event.event_type && (
                          <Badge className={getEventTypeColor(event.event_type)}>
                            {event.event_type}
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.event_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {formatDateShort(event.event_date)}
                          {event.event_time && ` at ${event.event_time}`}
                        </span>
                      </div>
                    )}

                    {event.is_virtual ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-gray-400" />
                        <span>Virtual Event</span>
                        {event.virtual_link && (
                          <a
                            href={event.virtual_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-svs-blue hover:underline ml-auto"
                          >
                            Join Link →
                          </a>
                        )}
                      </div>
                    ) : (
                      event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{event.location}</span>
                        </div>
                      )
                    )}

                    {event.max_attendees && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Max {event.max_attendees} attendees</span>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 bg-svs-gold hover:bg-svs-gold/90">
                        Manage Passes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Past Events
            </h2>
            <div className="space-y-3">
              {pastEvents.slice(0, 10).map(event => (
                <Card key={event.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          {event.event_date && (
                            <>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-xl font-bold">
                                {new Date(event.event_date).getDate()}
                              </span>
                            </>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.event_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {event.event_type && (
                              <Badge variant="outline" className="text-xs">
                                {event.event_type}
                              </Badge>
                            )}
                            {event.is_virtual ? (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Virtual
                              </span>
                            ) : (
                              event.location && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {events.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No events yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start by creating your first event to track sponsor benefits and attendance.
              </p>
              <Button className="bg-svs-gold hover:bg-svs-gold/90">
                <Plus className="mr-2 h-4 w-4" />
                Create First Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

import React, { useState } from 'react';
import { Container, Header, Card, Button, Badge } from '../components';
import { theme } from '../theme/theme';
import { useNavigate } from 'react-router-dom';
import { downloadAppleWalletPass, supportsAppleWallet } from '../utils/passKitGenerator';

interface Event {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  description: string;
  imageUrl?: string;
  price: number;
  currency: string;
  ticketsAvailable: number;
  category: 'upcoming' | 'recommended' | 'past';
  artists: string[];
}

interface OwnedTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  artist: string;
  date: string;
  ticketNumber: string;
  purchaseDate: string;
  price: number;
  status: 'valid' | 'used' | 'expired';
}

interface TicketingIntegration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  features: string[];
  connectionUrl?: string;
}

const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'recommended' | 'owned' | 'integrations'>('upcoming');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, boolean>>({
    ticketmaster: false,
    tickettailor: false,
    prototix: false,
    eventbookings: false,
    futureticketing: false,
  });
  const [showIntegrationModal, setShowIntegrationModal] = useState<string | null>(null);

  const ticketingIntegrations: TicketingIntegration[] = [
    {
      id: 'ticketmaster',
      name: 'Ticketmaster',
      description: 'Large-scale event discovery and enterprise ticketing.',
      icon: '🎫',
      connected: integrationStatuses.ticketmaster,
      features: [
        'Event discovery across all major venues',
        'Real-time ticket availability',
        'Enterprise-grade ticketing',
        'Global event network',
        'Advanced analytics',
      ],
      connectionUrl: 'https://developer.ticketmaster.com',
    },
    {
      id: 'tickettailor',
      name: 'Ticket Tailor',
      description: 'Flexible, developer-friendly API for various event types.',
      icon: '🎪',
      connected: integrationStatuses.tickettailor,
      features: [
        'Developer-friendly REST API',
        'Custom event workflows',
        'Flexible ticket types',
        'Multi-currency support',
        'Webhook integrations',
      ],
      connectionUrl: 'https://www.tickettailor.com/api',
    },
    {
      id: 'prototix',
      name: 'PromoTix',
      description: 'High-volume enterprise-level bulk event and order creation.',
      icon: '📊',
      connected: integrationStatuses.prototix,
      features: [
        'Bulk event creation',
        'High-volume processing',
        'Enterprise support',
        'Batch order management',
        'Custom integrations',
      ],
      connectionUrl: 'https://www.prototix.com/api',
    },
    {
      id: 'eventbookings',
      name: 'EventBookings',
      description: 'End-to-end ticketing, reporting, and payment gateway integration.',
      icon: '💳',
      connected: integrationStatuses.eventbookings,
      features: [
        'Complete ticketing solution',
        'Advanced reporting suite',
        'Multiple payment gateways',
        'Real-time analytics',
        'Customer management',
      ],
      connectionUrl: 'https://www.eventbookings.com/api',
    },
    {
      id: 'futureticketing',
      name: 'Future Ticketing',
      description: '"API-first" approach for custom, fully integrated buying journeys.',
      icon: '🚀',
      connected: integrationStatuses.futureticketing,
      features: [
        'API-first architecture',
        'Custom integration builder',
        'White-label solutions',
        'Real-time synchronization',
        'Advanced automation',
      ],
      connectionUrl: 'https://www.futureticketing.com/api',
    },
  ];

  const recommendedEvents: Event[] = [
    {
      id: '1',
      title: 'Electronic Music Festival 2026',
      artist: 'Various Artists',
      date: '2026-04-15',
      time: '18:00',
      location: 'San Francisco, CA',
      venue: 'Golden Gate Park',
      description: 'A night of electronic music with top DJs from around the world. Experience immersive sound design and visual effects.',
      imageUrl: '🎵',
      price: 85,
      currency: 'USD',
      ticketsAvailable: 450,
      category: 'recommended',
      artists: ['deadmau5', 'Diplo', 'Skrillex'],
    },
    {
      id: '2',
      title: 'Indie Rock Showcase',
      artist: 'Multiple Bands',
      date: '2026-04-20',
      time: '19:00',
      location: 'Los Angeles, CA',
      venue: 'The Fonda Theatre',
      description: 'Discover emerging indie rock bands and established favorites in an intimate venue setting.',
      imageUrl: '🎸',
      price: 45,
      currency: 'USD',
      ticketsAvailable: 200,
      category: 'recommended',
      artists: ['The xx', 'Arcade Fire', 'Modest Mouse'],
    },
    {
      id: '3',
      title: 'Hip-Hop Summit 2026',
      artist: 'Various Artists',
      date: '2026-05-10',
      time: '20:00',
      location: 'New York, NY',
      venue: 'Madison Square Garden',
      description: 'The biggest hip-hop event of the year featuring legendary rappers and producers.',
      imageUrl: '🎤',
      price: 120,
      currency: 'USD',
      ticketsAvailable: 800,
      category: 'recommended',
      artists: ['Jay-Z', 'Beyoncé', 'Kendrick Lamar'],
    },
  ];

  const upcomingEvents: Event[] = [
    {
      id: '4',
      title: 'Jazz Night',
      artist: 'Local Jazz Ensemble',
      date: '2026-03-25',
      time: '20:00',
      location: 'San Francisco, CA',
      venue: 'Blue Note',
      description: 'An intimate evening of classic and contemporary jazz.',
      imageUrl: '🎺',
      price: 35,
      currency: 'USD',
      ticketsAvailable: 150,
      category: 'upcoming',
      artists: ['Miles Davis Tribute', 'John Coltrane Revival'],
    },
    {
      id: '5',
      title: 'Pop Concert Series',
      artist: 'Pop Stars',
      date: '2026-04-05',
      time: '19:30',
      location: 'Los Angeles, CA',
      venue: 'Hollywood Bowl',
      description: 'Your favorite pop artists perform their biggest hits.',
      imageUrl: '⭐',
      price: 95,
      currency: 'USD',
      ticketsAvailable: 600,
      category: 'upcoming',
      artists: ['Taylor Swift', 'The Weeknd', 'Dua Lipa'],
    },
  ];

  const ownedTickets: OwnedTicket[] = [
    {
      id: 't1',
      eventId: '6',
      eventTitle: 'Summer Music Festival',
      artist: 'Various Artists',
      date: '2026-06-15',
      ticketNumber: 'SMF-2026-001234',
      purchaseDate: '2026-02-20',
      price: 150,
      status: 'valid',
    },
  ];

  const allEvents = [...recommendedEvents, ...upcomingEvents];
  const filteredEvents = allEvents.filter(event => {
    const matchesTab = event.category === selectedTab || (selectedTab === 'recommended' && event.category === 'recommended');
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleBuyTickets = (event: Event) => {
    setSelectedEvent(event);
    setTicketQuantity(1);
    setShowCheckoutModal(true);
  };

  const handleCheckout = () => {
    const total = (selectedEvent?.price || 0) * ticketQuantity;
    alert(`Redirecting to Stripe/Privy checkout for ${ticketQuantity} ticket(s) totaling $${total.toFixed(2)}`);
    setShowCheckoutModal(false);
  };

  const handleConnectIntegration = (integrationId: string) => {
    setIntegrationStatuses(prev => ({
      ...prev,
      [integrationId]: true,
    }));
    alert(`✅ ${ticketingIntegrations.find(i => i.id === integrationId)?.name} connected successfully!`);
    setShowIntegrationModal(null);
  };

  const handleDisconnectIntegration = (integrationId: string) => {
    if (window.confirm('Are you sure you want to disconnect this integration?')) {
      setIntegrationStatuses(prev => ({
        ...prev,
        [integrationId]: false,
      }));
      alert(`🔌 Integration disconnected`);
    }
  };

  const handleAddToAppleWallet = (ticket: OwnedTicket) => {
    if (!supportsAppleWallet()) {
      alert('⚠️ Apple Wallet is only available on iPhone, iPad, and Mac. Please try again from an Apple device.');
      return;
    }

    downloadAppleWalletPass({
      ticketNumber: ticket.ticketNumber,
      eventTitle: ticket.eventTitle,
      artist: ticket.artist,
      eventDate: ticket.date,
      eventTime: '19:00',
      venue: 'Event Venue',
      location: 'San Francisco, CA',
      price: ticket.price,
      barcode: ticket.ticketNumber,
    });
  };


  const eventCardStyles: React.CSSProperties = {
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  };

  const eventImageStyles: React.CSSProperties = {
    width: '100%',
    height: '200px',
    backgroundColor: theme.colors.background.tertiary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '64px',
  };

  const eventInfoStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
  };

  const eventTitleStyles: React.CSSProperties = {
    margin: 0,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 600,
  };

  const eventArtistStyles: React.CSSProperties = {
    margin: 0,
    marginBottom: theme.spacing.sm,
    color: theme.colors.accent,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 600,
  };

  const eventMetaStyles: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexWrap: 'wrap',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const statusBadgeStyles: (status: string) => React.CSSProperties = (status) => ({
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 600,
    backgroundColor:
      status === 'valid' ? theme.colors.success :
      status === 'used' ? theme.colors.gray[700] :
      theme.colors.danger,
    color: 'white',
  });

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="🎫 Tickets & Events"
        subtitle="Discover and purchase tickets to live events"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: theme.spacing.lg }}
      >
        ← Back
      </Button>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        borderBottom: `1px solid ${theme.colors.gray[800]}`,
        paddingBottom: theme.spacing.md,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setSelectedTab('upcoming')}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            backgroundColor: selectedTab === 'upcoming' ? theme.colors.primary : 'transparent',
            color: selectedTab === 'upcoming' ? 'white' : theme.colors.text.secondary,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: theme.typography.fontSize.base,
            transition: 'all 0.2s ease',
          }}
        >
          📅 Upcoming Events
        </button>
        <button
          onClick={() => setSelectedTab('recommended')}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            backgroundColor: selectedTab === 'recommended' ? theme.colors.primary : 'transparent',
            color: selectedTab === 'recommended' ? 'white' : theme.colors.text.secondary,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: theme.typography.fontSize.base,
            transition: 'all 0.2s ease',
          }}
        >
          ⭐ Recommended
        </button>
        <button
          onClick={() => setSelectedTab('owned')}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            backgroundColor: selectedTab === 'owned' ? theme.colors.primary : 'transparent',
            color: selectedTab === 'owned' ? 'white' : theme.colors.text.secondary,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: theme.typography.fontSize.base,
            transition: 'all 0.2s ease',
          }}
        >
          🎫 My Tickets ({ownedTickets.length})
        </button>
        <button
          onClick={() => setSelectedTab('integrations')}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            backgroundColor: selectedTab === 'integrations' ? theme.colors.primary : 'transparent',
            color: selectedTab === 'integrations' ? 'white' : theme.colors.text.secondary,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: theme.typography.fontSize.base,
            transition: 'all 0.2s ease',
          }}
        >
          🔌 Integrations
        </button>
      </div>

      {/* Search Bar */}
      {selectedTab !== 'owned' && selectedTab !== 'integrations' && (
        <div style={{ marginBottom: theme.spacing.lg }}>
          <input
            type="text"
            placeholder="🔍 Search events by title, artist, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray[700]}`,
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.base,
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Events Grid */}
      {selectedTab !== 'owned' && selectedTab !== 'integrations' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: theme.spacing.lg,
        }}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id} style={eventCardStyles}>
                <div style={eventImageStyles}>{event.imageUrl}</div>
                <div style={eventInfoStyles}>
                  <h4 style={eventTitleStyles}>{event.title}</h4>
                  <p style={eventArtistStyles}>{event.artist}</p>
                  <div style={eventMetaStyles}>
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>🕐 {event.time}</span>
                  </div>
                  <div style={eventMetaStyles}>
                    <span>📍 {event.venue}</span>
                  </div>
                  <p style={{
                    margin: 0,
                    marginBottom: theme.spacing.md,
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.sm,
                  }}>
                    {event.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.md,
                  }}>
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: theme.typography.fontSize.xl,
                        fontWeight: 'bold',
                        color: theme.colors.primary,
                      }}>
                        ${event.price}
                      </p>
                      <p style={{
                        margin: 0,
                        marginTop: '4px',
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.secondary,
                      }}>
                        {event.ticketsAvailable} tickets left
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => handleBuyTickets(event)}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: theme.spacing.lg }}>
              <p style={{ color: theme.colors.text.secondary }}>No events found matching your search</p>
            </Card>
          )}
        </div>
      ) : selectedTab === 'owned' ? (
        /* My Tickets Section */
        <div>
          {ownedTickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
              {ownedTickets.map((ticket) => (
                <Card key={ticket.id} style={{ padding: theme.spacing.lg }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: theme.spacing.md,
                  }}>
                    <div>
                      <h4 style={{
                        margin: 0,
                        marginBottom: theme.spacing.sm,
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.fontSize.lg,
                      }}>
                        {ticket.eventTitle}
                      </h4>
                      <p style={{
                        margin: 0,
                        color: theme.colors.accent,
                        fontWeight: 600,
                      }}>
                        {ticket.artist}
                      </p>
                    </div>
                    <span style={statusBadgeStyles(ticket.status)}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: theme.spacing.md,
                    marginBottom: theme.spacing.lg,
                    paddingBottom: theme.spacing.lg,
                    borderBottom: `1px solid ${theme.colors.gray[800]}`,
                  }}>
                    <div>
                      <p style={{
                        margin: 0,
                        marginBottom: theme.spacing.xs,
                        color: theme.colors.text.secondary,
                        fontSize: theme.typography.fontSize.sm,
                      }}>
                        Event Date
                      </p>
                      <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
                        {new Date(ticket.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p style={{
                        margin: 0,
                        marginBottom: theme.spacing.xs,
                        color: theme.colors.text.secondary,
                        fontSize: theme.typography.fontSize.sm,
                      }}>
                        Ticket Number
                      </p>
                      <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600, fontFamily: 'monospace' }}>
                        {ticket.ticketNumber}
                      </p>
                    </div>
                    <div>
                      <p style={{
                        margin: 0,
                        marginBottom: theme.spacing.xs,
                        color: theme.colors.text.secondary,
                        fontSize: theme.typography.fontSize.sm,
                      }}>
                        Price Paid
                      </p>
                      <p style={{ margin: 0, color: theme.colors.primary, fontWeight: 600 }}>
                        ${ticket.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: theme.spacing.md,
                    flexWrap: 'wrap',
                  }}>
                    <Button variant="primary">📱 View Ticket</Button>
                    <Button 
                      variant="secondary"
                      onClick={() => handleAddToAppleWallet(ticket)}
                      style={{ 
                        backgroundColor: '#000000',
                        color: 'white',
                        border: '1px solid white',
                      }}
                      title="Add to Apple Wallet (iOS/macOS)"
                    >
                      🍎 Wallet
                    </Button>
                    <Button variant="secondary">🎟️ Transfer</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card style={{ textAlign: 'center', padding: theme.spacing.xl }}>
              <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.lg }}>
                🎫 You don't have any tickets yet
              </p>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>
                Check out the upcoming or recommended events and grab your tickets!
              </p>
              <Button
                variant="primary"
                onClick={() => setSelectedTab('upcoming')}
              >
                Browse Events
              </Button>
            </Card>
          )}
        </div>
      ) : (
        /* Integrations Section */
        <div>
          <div style={{ marginBottom: theme.spacing.lg }}>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>
              Connect your ticketing platform integrations to streamline event management across SoundMoney.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: theme.spacing.lg,
          }}>
            {ticketingIntegrations.map((integration) => (
              <Card key={integration.id} style={{ padding: theme.spacing.lg }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: theme.spacing.md,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <div style={{ fontSize: '40px' }}>{integration.icon}</div>
                    <div>
                      <h4 style={{
                        margin: 0,
                        marginBottom: theme.spacing.xs,
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.fontSize.lg,
                      }}>
                        {integration.name}
                      </h4>
                      <Badge variant={integration.connected ? 'success' : 'default'} size="sm">
                        {integration.connected ? '✓ Connected' : '◯ Not Connected'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p style={{
                  margin: 0,
                  marginBottom: theme.spacing.md,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  {integration.description}
                </p>

                <div style={{
                  marginBottom: theme.spacing.lg,
                  paddingBottom: theme.spacing.lg,
                  borderBottom: `1px solid ${theme.colors.gray[800]}`,
                }}>
                  <p style={{
                    margin: '0 0 8px 0',
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    Features:
                  </p>
                  <ul style={{
                    margin: 0,
                    padding: '0 0 0 20px',
                    listStyle: 'none',
                  }}>
                    {integration.features.map((feature, idx) => (
                      <li
                        key={idx}
                        style={{
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.fontSize.xs,
                          marginBottom: '4px',
                          paddingLeft: '0',
                          listStyleType: 'disc',
                          listStylePosition: 'outside',
                        }}
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                  {integration.connected ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => setShowIntegrationModal(integration.id)}
                        style={{ flex: 1, fontSize: theme.typography.fontSize.sm }}
                      >
                        ⚙️ Settings
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDisconnectIntegration(integration.id)}
                        style={{
                          flex: 1,
                          fontSize: theme.typography.fontSize.sm,
                          backgroundColor: theme.colors.danger,
                          color: 'white',
                        }}
                      >
                        🔌 Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => setShowIntegrationModal(integration.id)}
                      style={{ width: '100%' }}
                    >
                      🔗 Connect Now
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <Card style={{
            padding: theme.spacing.lg,
            maxWidth: '500px',
            width: '90%',
          }}>
            <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
              🎫 Checkout
            </h3>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <p style={{
                margin: 0,
                marginBottom: theme.spacing.sm,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Event
              </p>
              <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
                {selectedEvent.title}
              </p>
            </div>

            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background.tertiary,
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.lg,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.md,
              }}>
                <label style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  Number of Tickets
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={ticketQuantity}
                  onChange={(e) => setTicketQuantity(parseInt(e.target.value) || 1)}
                  style={{
                    width: '80px',
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.md,
                fontSize: theme.typography.fontSize.sm,
              }}>
                <span style={{ color: theme.colors.text.secondary }}>Price per ticket:</span>
                <span style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                  ${selectedEvent.price.toFixed(2)}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: theme.spacing.md,
                borderTop: `1px solid ${theme.colors.gray[800]}`,
                fontSize: theme.typography.fontSize.lg,
              }}>
                <span style={{ color: theme.colors.text.secondary }}>Total:</span>
                <span style={{ color: theme.colors.accent, fontWeight: 'bold' }}>
                  ${(selectedEvent.price * ticketQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <Button
                variant="secondary"
                onClick={() => setShowCheckoutModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCheckout}
                style={{ flex: 1 }}
              >
                💳 Pay with Stripe/Privy
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Integration Details Modal */}
      {showIntegrationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
        }}
        onClick={() => setShowIntegrationModal(null)}
        >
          <Card style={{
            padding: theme.spacing.lg,
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {ticketingIntegrations.find(i => i.id === showIntegrationModal) && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
                }}>
                  <div style={{ fontSize: '48px' }}>
                    {ticketingIntegrations.find(i => i.id === showIntegrationModal)?.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
                      {ticketingIntegrations.find(i => i.id === showIntegrationModal)?.name}
                    </h3>
                    <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                      {ticketingIntegrations.find(i => i.id === showIntegrationModal)?.description}
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.tertiary,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.lg,
                }}>
                  <h4 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
                    📋 Integration Steps
                  </h4>
                  <ol style={{
                    margin: 0,
                    paddingLeft: '20px',
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.sm,
                  }}>
                    <li style={{ marginBottom: '8px' }}>
                      Create or log in to your {ticketingIntegrations.find(i => i.id === showIntegrationModal)?.name} account
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      Go to API settings and generate your API credentials
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      Copy your API key and paste it below
                    </li>
                    <li>Click "Verify & Connect" to complete the integration</li>
                  </ol>
                </div>

                <div style={{ marginBottom: theme.spacing.lg }}>
                  <label style={{
                    display: 'block',
                    marginBottom: theme.spacing.sm,
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: 600,
                  }}>
                    API Key / Connection Token
                  </label>
                  <input
                    type="password"
                    placeholder="Paste your API key here..."
                    style={{
                      width: '100%',
                      padding: theme.spacing.md,
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${theme.colors.gray[700]}`,
                      backgroundColor: theme.colors.background.secondary,
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.base,
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.lg,
                  border: `1px solid ${theme.colors.gray[800]}`,
                }}>
                  <p style={{
                    margin: 0,
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.xs,
                  }}>
                    💡 Need help? Visit the <a href={ticketingIntegrations.find(i => i.id === showIntegrationModal)?.connectionUrl} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.primary }}>API documentation</a>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                  <Button
                    variant="secondary"
                    onClick={() => setShowIntegrationModal(null)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleConnectIntegration(showIntegrationModal)}
                    style={{ flex: 1 }}
                  >
                    ✓ Verify & Connect
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </Container>
  );
};

export default TicketsPage;

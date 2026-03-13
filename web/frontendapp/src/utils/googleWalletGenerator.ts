/**
 * Google Wallet Generator Utility
 * Generates Google Wallet passes (EventTicketObjects) for event tickets
 *
 * Google Wallet uses JWT tokens for pass creation and management.
 * For production, you'll need:
 * 1. Google Service Account
 * 2. Google Pay API credentials
 * 3. Backend service to sign JWTs with your private key
 */

interface GoogleWalletPassConfig {
  ticketNumber: string;
  eventTitle: string;
  artist: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  location: string;
  price: number;
  barcode: string;
  seatInfo?: string;
}

/**
 * Generate the Event Ticket Object structure for Google Wallet
 * This is what gets encoded as a JWT by the backend
 */
export const generateEventTicketObject = (config: GoogleWalletPassConfig, issuerId: string) => {
  const eventTicket = {
    id: `${issuerId}.${config.ticketNumber}`,
    classId: `${issuerId}.soundmoney_event_ticket`,
    state: 'ACTIVE',
    hexBackgroundColor: '#121212', // SoundMoney dark theme
    textModulesData: [
      {
        id: 'event',
        header: '🎵 EVENT',
        body: config.eventTitle,
      },
      {
        id: 'artist',
        header: 'ARTIST',
        body: config.artist,
      },
      {
        id: 'date',
        header: 'DATE',
        body: new Date(config.eventDate).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      },
      {
        id: 'time',
        header: 'TIME',
        body: config.eventTime,
      },
      {
        id: 'venue',
        header: 'VENUE',
        body: config.venue,
      },
      {
        id: 'location',
        header: 'LOCATION',
        body: config.location,
      },
      ...(config.seatInfo
        ? [
            {
              id: 'seat',
              header: 'SEAT',
              body: config.seatInfo,
            },
          ]
        : []),
    ],
    linksModuleData: {
      uris: [
        {
          uri: 'https://soundmoney.io/tickets',
          description: '🎫 View all tickets',
          id: 'tickets_link',
        },
        {
          uri: 'https://soundmoney.io/support',
          description: '📧 Support',
          id: 'support_link',
        },
      ],
    },
    imageModulesData: [
      {
        id: 'image',
        mainImage: {
          sourceUri: {
            uri: 'https://soundmoney.io/logo.png',
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: 'SoundMoney Event Ticket',
            },
          },
        },
      },
    ],
    barcode: {
      type: 'CODE_128',
      value: config.barcode,
      alternateText: `Ticket: ${config.ticketNumber}`,
    },
    qrCode: {
      type: 'QR_CODE',
      value: config.barcode,
    },
    locations: [
      {
        latitude: {
          microdegrees: 377749000, // San Francisco default
        },
        longitude: {
          microdegrees: -1224194000,
        },
      },
    ],
  };

  return eventTicket;
};

/**
 * Generate Event Ticket Class for Google Wallet
 * This defines the common properties for all tickets of this type
 */
export const generateEventTicketClass = (issuerId: string) => {
  const eventTicketClass = {
    id: `${issuerId}.soundmoney_event_ticket`,
    issuerName: 'SoundMoney',
    reviewStatus: 'UNDER_REVIEW',
    displayName: 'Event Ticket',
    eventName: {
      defaultValue: {
        language: 'en-US',
        value: 'SoundMoney Event',
      },
    },
    textModulesData: [
      {
        id: 'details',
        header: 'DETAILS',
        body: 'Your all-access event ticket powered by SoundMoney',
      },
    ],
  };

  return eventTicketClass;
};

/**
 * Mock JWT generation for demonstration
 * In production, this is created and signed by your backend
 */
export const generateMockEventTicketJWT = (
  config: GoogleWalletPassConfig,
  issuerId: string = 'YOUR_ISSUER_ID'
) => {
  const eventTicket = generateEventTicketObject(config, issuerId);

  // This is the payload that would be signed
  const jwtPayload = {
    iss: issuerId,
    aud: 'google',
    origins: ['soundmoney.io'],
    typ: 'savetogoogle',
    payload: {
      eventTicketObjects: [eventTicket],
    },
  };

  return {
    payload: jwtPayload,
    needsSignature: true, // Backend must sign this
    signed: false,
  };
};

/**
 * Check if device supports Google Wallet
 */
export const supportsGoogleWallet = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  // Google Wallet works on Android and some iOS devices
  // This is a simplified check
  return /android|iphone|ipad/.test(ua);
};

/**
 * Generate Google Wallet save URL
 * This creates a deep link to add the pass to Google Wallet
 * In production, the JWT would be signed by your backend
 */
export const generateGoogleWalletSaveUrl = (jwtToken: string): string => {
  // Format: https://pay.google.com/gp/v/save/{jwt_token}
  return `https://pay.google.com/gp/v/save/${jwtToken}`;
};

/**
 * Initiate Google Wallet pass addition
 * In production, call your backend to generate and sign JWT
 */
export const addToGoogleWallet = async (config: GoogleWalletPassConfig) => {
  try {
    // In production, call your backend API:
    // const response = await fetch('/api/wallet/google-wallet-jwt', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config),
    // });
    //
    // const { jwt } = await response.json();
    // const saveUrl = generateGoogleWalletSaveUrl(jwt);
    // window.location.href = saveUrl;

    // For now, show the JWT payload configuration
    const mockJWT = generateMockEventTicketJWT(config);
    const dataStr = JSON.stringify(mockJWT, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.ticketNumber}-google-wallet-jwt.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert(
      '✅ Google Wallet JWT configuration generated!\n\nTo properly add to Google Wallet, your backend needs to:\n1. Sign the JWT with your Google service account key\n2. Generate the save URL\n3. Redirect to: https://pay.google.com/gp/v/save/{jwt}\n\nFor production setup, see:\nhttps://developers.google.com/wallet/tickets/events'
    );
  } catch (error) {
    console.error('Error adding to Google Wallet:', error);
    alert('❌ Failed to generate Google Wallet pass');
  }
};

/**
 * Format event date for Google Wallet
 */
export const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Validate Google Wallet configuration
 */
export const validateGoogleWalletConfig = (config: GoogleWalletPassConfig): string[] => {
  const errors: string[] = [];

  if (!config.ticketNumber) errors.push('Ticket number is required');
  if (!config.eventTitle) errors.push('Event title is required');
  if (!config.barcode) errors.push('Barcode is required');
  if (config.price < 0) errors.push('Price cannot be negative');

  return errors;
};

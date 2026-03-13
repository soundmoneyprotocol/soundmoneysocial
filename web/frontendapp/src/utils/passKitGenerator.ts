/**
 * PassKit Generator Utility
 * Generates Apple Wallet passes (.pkpass files) for event tickets
 *
 * Note: This is a template generator. For production use, you'll need:
 * 1. Apple Developer account
 * 2. PassKit certificate from Apple Developer
 * 3. Backend service to sign the pass (requires private key)
 * 4. Proper PKCS#7 signing implementation
 */

interface PassConfig {
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
 * Generates a basic pass.json structure for Apple Wallet
 * In production, this would be signed with your PassKit certificate
 */
export const generatePassJSON = (config: PassConfig) => {
  const pass = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.soundmoney.event',
    teamIdentifier: 'SOUNDMONEY',
    serialNumber: config.ticketNumber,
    appLaunchURL: `soundmoney://ticket/${config.ticketNumber}`,
    webServiceURL: 'https://soundmoney.io/api/wallet/',
    authenticationToken: `auth_${config.ticketNumber}`,

    // Pass styling
    backgroundColor: 'rgb(18, 18, 18)', // SoundMoney dark theme
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(176, 176, 176)',

    // EventTicket pass type
    eventTicket: {
      primaryFields: [
        {
          key: 'event',
          label: '🎵 EVENT',
          value: config.eventTitle,
          textAlignment: 'PKTextAlignmentLeft',
        },
      ],
      secondaryFields: [
        {
          key: 'artist',
          label: 'ARTIST',
          value: config.artist,
        },
        {
          key: 'date',
          label: 'DATE',
          value: new Date(config.eventDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        },
        {
          key: 'time',
          label: 'TIME',
          value: config.eventTime,
        },
      ],
      backFields: [
        {
          key: 'venue',
          label: 'VENUE',
          value: config.venue,
        },
        {
          key: 'location',
          label: 'LOCATION',
          value: config.location,
        },
        {
          key: 'price',
          label: 'PRICE PAID',
          value: `$${config.price.toFixed(2)}`,
          currencyCode: 'USD',
        },
        {
          key: 'support',
          label: '📧 SUPPORT',
          value: 'support@soundmoney.io',
        },
      ],
      auxiliaryFields: config.seatInfo
        ? [
            {
              key: 'seat',
              label: 'SEAT',
              value: config.seatInfo,
            },
          ]
        : [],
    },

    // Barcode configuration
    barcodes: [
      {
        format: 'PKBarcodeFormatPDF417',
        message: config.barcode,
        messageEncoding: 'iso-8859-1',
        altText: `Ticket: ${config.ticketNumber}`,
      },
    ],

    // QR code
    barcode: {
      format: 'PKBarcodeFormatQR',
      message: config.barcode,
      messageEncoding: 'iso-8859-1',
      altText: `Ticket: ${config.ticketNumber}`,
    },

    // Generic information
    generic: {
      primaryFields: [
        {
          key: 'ticketNumber',
          label: 'TICKET #',
          value: config.ticketNumber,
        },
      ],
    },

    // Locations for notification
    locations: [
      {
        latitude: 37.7749, // San Francisco default
        longitude: -122.4194,
        relevantText: `${config.eventTitle} at ${config.venue}`,
      },
    ],
  };

  return pass;
};

/**
 * Generate manifest.json (list of files and their SHA1 hashes)
 * In production, actual files would be hashed
 */
export const generateManifest = () => {
  const manifest: Record<string, string> = {
    'pass.json': 'placeholder_hash_sha1',
    'icon.png': 'placeholder_hash_sha1',
    'icon@2x.png': 'placeholder_hash_sha1',
    'logo.png': 'placeholder_hash_sha1',
    'logo@2x.png': 'placeholder_hash_sha1',
  };

  return manifest;
};

/**
 * Mock pass file generator for frontend
 * In production, you would:
 * 1. Send pass details to your backend
 * 2. Backend generates, signs, and zips the pass
 * 3. Return the signed .pkpass file
 *
 * For now, we'll create a JSON representation that can be sent to backend
 */
export const generateMockPassFile = (config: PassConfig) => {
  const passJSON = generatePassJSON(config);
  const manifest = generateManifest();

  return {
    pass: passJSON,
    manifest,
    timestamp: new Date().toISOString(),
    signed: false, // Frontend cannot sign - requires backend
  };
};

/**
 * Initiates Apple Wallet pass download
 * In production, this would download a properly signed .pkpass file from your backend
 */
export const downloadAppleWalletPass = async (config: PassConfig) => {
  try {
    // In production, call your backend API to generate signed pass
    // const response = await fetch('/api/wallet/generate-pass', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config),
    // });
    //
    // const blob = await response.blob();
    // const filename = `${config.ticketNumber}.pkpass`;
    //
    // // Download the file
    // const url = window.URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = filename;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // window.URL.revokeObjectURL(url);

    // For now, show the pass data as JSON (for backend reference)
    const passData = generateMockPassFile(config);
    const dataStr = JSON.stringify(passData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.ticketNumber}-wallet-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert('✅ Apple Wallet pass configuration generated!\n\nTo properly add to Apple Wallet, your backend needs to:\n1. Sign the pass with your PassKit certificate\n2. Return a .pkpass file\n\nFor production setup, see:\nhttps://developer.apple.com/wallet/');
  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error);
    alert('❌ Failed to generate Apple Wallet pass');
  }
};

/**
 * Generate Web API Deep Link to Apple Wallet
 * iOS users can use this to add pass directly
 */
export const generateAppleWalletDeepLink = (passURL: string): string => {
  return `https://wallet-api.icloud.com/add_pass?url=${encodeURIComponent(passURL)}`;
};

/**
 * Check if device supports Apple Wallet
 */
export const supportsAppleWallet = (): boolean => {
  // Check if on iOS/macOS
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod|macintosh/.test(ua);
};

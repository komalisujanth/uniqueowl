import './globals.css';

export const metadata = {
  title: 'Unique Owl — Think you\'re one of a kind? Prove it.',
  description: 'Submit words nobody else has thought of. Climb the global leaderboard. Challenge your friends.',
  manifest: '/manifest.json',
  themeColor: '#7F77DD',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <meta name="google-adsense-account" content="ca-pub-2988038891687562"></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Unique Owl" />
      </head>
      <body className="min-h-screen bg-base-100">
        {children}
      </body>
    </html>
  );
}

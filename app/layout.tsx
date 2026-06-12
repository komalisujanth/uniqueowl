import './globals.css';

export const metadata = {
  title: "Unique Owl — Think you're one of a kind? Prove it.",
  description: 'Submit words nobody else has thought of. Climb the global leaderboard. Challenge your friends.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#7F77DD',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta name="google-adsense-account" content="ca-pub-7277504416937985" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Unique Owl" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </head>
      <body className="min-h-screen bg-base-100">
        {children}
      </body>
    </html>
  );
}

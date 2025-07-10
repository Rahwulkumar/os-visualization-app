import './globals.css';

export const metadata = {
  title: 'OS Visualization Web App',
  description: 'Interactive OS learning tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Font link moved to app/head.js */}
      </head>
      <body>{children}</body>
    </html>
  );
}
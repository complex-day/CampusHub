export const metadata = {
  title: "CampusHub",
  description: "Structured campus communication"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

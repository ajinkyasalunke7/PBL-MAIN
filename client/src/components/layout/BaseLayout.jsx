export default function BaseLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">{children}</main>
      <Footer />
    </div>
  );
}

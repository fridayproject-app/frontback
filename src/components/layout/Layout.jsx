import Header from './Header'
import BottomNav from './BottomNav'
import DesktopSidebar from './DesktopSidebar'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <DesktopSidebar />
      <main className="layout__main">
        {children}
      </main>
      <BottomNav />

      <style>{`
        .layout {
          display: flex;
          min-height: 100dvh;
          min-height: 100vh;
        }

        .layout__main {
          flex: 1;
          width: 100%;
          min-width: 0;
        }

        @media (min-width: 768px) {
          .layout__main {
            margin-left: 220px;
          }
        }

        @media (min-width: 1100px) {
          .layout__main {
            margin-left: 260px;
          }
        }
      `}</style>
    </div>
  )
}

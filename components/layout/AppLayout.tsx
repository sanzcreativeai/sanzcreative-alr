import Sidebar from './Sidebar'
import Header from './Header'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  userName?: string
  userRole?: string
  role?: 'super_admin' | 'client_user'
  isDemo?: boolean
}

export default function AppLayout({
  children,
  title,
  subtitle,
  userName,
  userRole,
  role = 'super_admin',
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar role={role} />

      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        <Header
          title={title}
          subtitle={subtitle}
          userName={userName}
          userRole={userRole}
          isDemo={false}
        />

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, ArrowLeft, User as UserIcon, Lock, Building2, Calendar } from 'lucide-react'
import { AccountMenu } from '@/components/account-menu'
import { getUserOrganizations } from '@/lib/db/organizations'
import { getUserProfile } from '@/lib/actions/profile'
import { ProfileForm } from '@/components/profile-form'
import { PasswordChangeForm } from '@/components/password-change-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile and organizations
  const profileResult = await getUserProfile()
  const profile = profileResult.profile || null
  const organizations = await getUserOrganizations(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Plane className="w-8 h-8 text-sky-600 mr-2" />
              <span className="text-xl text-gray-900 font-semibold">WingWake</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
              <AccountMenu userEmail={user.email} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-sky-600" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} profile={profile} />
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-sky-600" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>

          {/* Organizations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                <CardTitle>Organizations</CardTitle>
              </div>
              <CardDescription>
                Organizations you are a member of
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizations.length > 0 ? (
                <div className="space-y-3">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{org.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{org.type}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {org.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>You are not a member of any organizations yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                <CardTitle>Account Information</CardTitle>
              </div>
              <CardDescription>
                Your account details and metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="text-sm text-gray-900 font-mono">{user.id}</dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                  <dd className="text-sm text-gray-900">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </dd>
                </div>
                {profile?.created_at && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Profile Created</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
                {profile?.updated_at && (
                  <div className="flex justify-between items-center py-2">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(profile.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

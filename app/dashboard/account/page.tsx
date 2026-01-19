import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, User as UserIcon, Lock, Building2, Calendar, Plus, Users } from 'lucide-react'
import { AccountMenu } from '@/components/account-menu'
import { getUserOrganizations } from '@/lib/db/organizations'
import { getUserProfile } from '@/lib/actions/profile'
import { ProfileForm } from '@/components/profile-form'
import { PasswordChangeForm } from '@/components/password-change-form'
import { OrganizationForm } from '@/components/organization-form'
import { OrganizationList } from '@/components/organization-list'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { convexClient, api } from '@/lib/convex/server'

export default async function AccountPage() {
  // Get current user profile from Convex
  const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});

  if (!profile) {
    redirect('/login')
  }

  // Get user profile and organizations
  const profileResult = await getUserProfile()
  const profileData = profileResult.profile || null
  const organizations = await getUserOrganizations(profile._id)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <Plane className="w-8 h-8 text-sky-600 mr-2" />
                <span className="text-xl text-gray-900 font-semibold">WingWake</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <AccountMenu />
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
              <ProfileForm profile={profileData} />
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-600" />
                  <CardTitle>Organizations</CardTitle>
                </div>
                {organizations.length === 0 && (
                  <OrganizationForm />
                )}
              </div>
              <CardDescription>
                {organizations.length === 0
                  ? 'Create your organization to get started'
                  : 'Organizations you are a member of'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizations.length > 0 ? (
                <OrganizationList organizations={organizations} userId={profile._id} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="mb-4">You are not a member of any organizations yet.</p>
                  <OrganizationForm />
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
                  <dt className="text-sm font-medium text-gray-500">Profile ID</dt>
                  <dd className="text-sm text-gray-900 font-mono">{profile._id}</dd>
                </div>
                {profileData?.created_at && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Profile Created</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(profileData.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
                {profileData?.updated_at && (
                  <div className="flex justify-between items-center py-2">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(profileData.updated_at).toLocaleDateString('en-US', {
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

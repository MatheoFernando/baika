"use client"

import { useEffect, useState } from "react"
import instance from "@/src/lib/api"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, Lock, SettingsIcon, Trash2, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/infrastructure/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/infrastructure/ui/avatar"
import { Button } from "@/src/infrastructure/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/infrastructure/ui/tabs"
import { Input } from "@/src/infrastructure/ui/input"
import { Label } from "@/src/infrastructure/ui/label"
import { Separator } from "@/src/infrastructure/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/src/infrastructure/ui/alert-dialog"
import { useTranslations } from "next-intl"
import { getUser } from "@/src/core/auth/authApi"





export default function SettingsPage() {
  const t = useTranslations("settings")
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [profileError, setProfileError] = useState<{ phoneNumber?: string }>({})

  useEffect(() => {
    async function validateSession() {
      try {
        const userData = await getUser()
        setUser(userData)
        console.log("Usuário autenticado:", userData)
        setProfileForm({
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phoneNumber || "",
        })
      } catch (err) {
        console.error("Usuário não autenticado", err)
        toast(`${t("error")}: ${t("userNotAuthenticated")}`)
      } finally {
        setLoading(false)
      }
    }

    validateSession()
  }, [t])

  const validateProfile = () => {
    const errors: { phoneNumber?: string } = {}
    const phone = profileForm.phoneNumber.trim()
    if (!phone) {
      errors.phoneNumber = t("profile.phoneNumberRequired")
    } else if (!/^\d+$/.test(phone)) {
      errors.phoneNumber = t("profile.phoneNumberInvalid")
    } else if (phone.length !== 9) {
      errors.phoneNumber = t("profile.phoneNumberLength")
    }
    setProfileError(errors)
    return Object.keys(errors).length === 0
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    if (!validateProfile()) return
    setUpdating(true)
    try {
      await instance.put(`/user/updateMe/${user._id}`, profileForm)
      setUser({ ...user, ...profileForm })
      toast(`${t("success")}: ${t("profileUpdated")}`)
    } catch (error) {
      toast(`${t("error")}: ${t("updateProfileError")}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!user) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast(`${t("error")}: ${t("passwordMismatch")}`)
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast(`${t("error")}: ${t("passwordTooShort")}`)
      return
    }

    setUpdating(true)
    try {
      await instance.patch(`/user/updatePassword/${user._id}`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      toast(`${t("success")}: ${t("passwordUpdated")}`)
    } catch (error) {
      toast(`${t("error")}: ${t("updatePasswordError")}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setUpdating(true)
    try {
      await instance.put(`/user/deleteMe/${user._id}`, {})
      toast(`${t("success")}: ${t("accountDeleted")}`)
      window.location.href = "/"
    } catch (error) {
      toast(`${t("error")}: ${t("deleteAccountError")}`)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("error")}</CardTitle>
            <CardDescription>{t("userNotFound")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <Card className="min-h-screen bg-background dark:bg-gray-800 mt-8">
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-8 ">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg   ">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name}  />
              <AvatarFallback className="text-lg">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-background dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <SettingsIcon className="h-6 w-6" />
                    {t("title")}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 dark:bg-gray-900">
              <TabsTrigger value="profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                {t("tabs.profile")}
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2 cursor-pointer">
                <Lock className="h-4 w-4" />
                {t("tabs.password")}
              </TabsTrigger>
              <TabsTrigger value="danger" className="flex items-center gap-2 cursor-pointer">
                <Trash2 className="h-4 w-4" />
                {t("tabs.danger")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="dark:bg-gray-900">
                <CardHeader>
                  <CardTitle>{t("profile.title")}</CardTitle>
                  <CardDescription>{t("profile.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("profile.name")}</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder={t("profile.namePlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("profile.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder={t("profile.emailPlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">{t("profile.number")}</Label>
                      <Input
                        id="number"
                        type="number"
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        placeholder={t("profile.phoneNumber")}
                      />
                      {profileError.phoneNumber && (
                        <p className="text-sm text-destructive">{profileError.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setProfileForm({ name: user.name, email: user.email  , phoneNumber: user.phoneNumber})}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleUpdateProfile} disabled={updating} className="cursor-pointer">
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("profile.update")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card className="dark:bg-gray-900">
                <CardHeader>
                  <CardTitle>{t("password.title")}</CardTitle>
                  <CardDescription>{t("password.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t("password.current")}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t("password.new")}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("password.requirements")}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("password.confirm")}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Separator />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                    >
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleUpdatePassword} disabled={updating} className="cursor-pointer">
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("password.update")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="danger">
              <Card className="border-destructive dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-destructive">{t("danger.title")}</CardTitle>
                  <CardDescription>{t("danger.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <h3 className="font-semibold text-destructive mb-2">{t("danger.deleteAccount")}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{t("danger.deleteWarning")}</p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full sm:w-auto cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("danger.deleteButton")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("danger.confirmTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("danger.confirmDescription")}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={updating}
                            >
                              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {t("danger.confirmDelete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  )
}
